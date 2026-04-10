# muc_mcp_client_hub 系统设计文档

## 1. 概述

### 1.1 背景

OpenAI 的 Chat Completion API 支持 function call（函数调用），但其协议与 MCP Server 的协议不同，无法直接对接。muc_mcp_client_hub 作为桥梁，通过标准 MCP SSE 协议与 MCP Server 通信，将 MCP 工具转换为 OpenAI function call 兼容格式，并通过 `call()` 方法统一处理 OpenAI 返回的 tool_call。

### 1.2 目标

- 封装 MCP Server 调用，提供简洁的 Python API
- 通过标准 MCP SSE 协议与 muc_mcp_server_hub 通信（与 Claude Code 行为一致）
- 自动获取 MCP Server 的 tools/list，转换为 OpenAI function call 格式
- 通过 `mcp_client.call(tool_call)` 一行代码完成 MCP Server 调用

### 1.3 架构总览

```
┌──────────────────────────────────────────────────────────┐
│                      业务代码                             │
│                                                          │
│  1. tools = mcp_client.get_function_call(["add","sub"])  │
│     → 内部建立 SSE 连接，调用 tools/list                   │
│     → 返回 OpenAI tools JSON                             │
│                                                          │
│  2. 将 tools 传给 OpenAI Chat API                        │
│     → OpenAI 返回 tool_call                              │
│                                                          │
│  3. result = mcp_client.call(tool_call)                  │
│     → 通过 SSE 连接调用 tools/call                        │
│     → 返回结果                                            │
└────────────────────┬─────────────────────────────────────┘
                     │
            SSE + JSON-RPC (标准 MCP 协议)
            GET /mcp/{name}  → SSE 流（接收响应）
            POST /messages   → 发送 JSON-RPC 消息
                     │
┌────────────────────▼─────────────────────────────────────┐
│              muc_mcp_server_hub                           │
│          http://myhost:8080/mcp/{server_name}            │
└──────────────────────────────────────────────────────────┘
```

---

## 2. 使用方式

```python
import muc_mcp_client_hub as mcp_client

# 初始化配置（env 可选，不设置则根据当前环境自动获取）
mcp_client.set_api_key("sk-abc123xxx")
# mcp_client.set_env("beta", "cx")  # 可选，不设置则自动根据 muc_core.env.env_config 获取

# 获取 function call 工具列表（内部自动建立 SSE 连接）
tools = mcp_client.get_function_call(["add", "sub", "mul", "div"])

# 将 tools 传给 OpenAI
import openai

response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "请计算 3 + 5"}],
    tools=tools
)

# 处理 OpenAI 返回的 tool_call
message = response.choices[0].message
if message.tool_calls:
    for tool_call in message.tool_calls:
        result = mcp_client.call(tool_call)

# 使用完毕，关闭连接
mcp_client.close()
```

### 2.1 get_function_call 返回值示例

传入 `["add", "sub", "mul", "div"]`，返回：

```json
[
    {
        "type": "function",
        "function": {
            "name": "add",
            "description": "加法计算 a + b",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {"type": "number", "description": "数字a"},
                    "b": {"type": "number", "description": "数字b"}
                },
                "required": ["a", "b"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "sub",
            "description": "减法计算 a - b",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {"type": "number", "description": "数字a"},
                    "b": {"type": "number", "description": "数字b"}
                },
                "required": ["a", "b"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "mul",
            "description": "乘法计算 a * b",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {"type": "number", "description": "数字a"},
                    "b": {"type": "number", "description": "数字b"}
                },
                "required": ["a", "b"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "div",
            "description": "除法计算 a / b",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {"type": "number", "description": "数字a"},
                    "b": {"type": "number", "description": "数字b"}
                },
                "required": ["a", "b"]
            }
        }
    }
]
```

---

## 3. 通信协议

### 3.1 标准 MCP SSE 协议

与 Claude Code 完全一致，采用标准 MCP SSE 传输协议：

**连接建立流程：**

```
客户端                                           服务端
  │                                                │
  │  GET /mcp/{server_name}                        │
  │  Accept: text/event-stream                     │
  │  Authorization: Bearer {api_key}               │
  │───────────────────────────────────────────────►│
  │                                                │
  │  SSE 流建立                                    │
  │  ◄── event: endpoint                           │
  │      data: /mcp/{server_name}/messages?session_id=xxx
  │                                                │
  │  ◄── event: message                            │
  │      data: {"jsonrpc":"2.0", ...}              │
  │                                                │
```

**消息发送流程：**

```
客户端                                           服务端
  │                                                │
  │  POST /mcp/{server_name}/messages?session_id=xxx
  │  Content-Type: application/json                │
  │  Body: {"jsonrpc":"2.0","method":"tools/list"}│
  │───────────────────────────────────────────────►│
  │                                                │
  │  SSE 响应推送到 SSE 流                          │
  │  ◄── event: message                            │
  │      data: {"jsonrpc":"2.0","result":{...}}    │
  │                                                │
```

### 3.2 SSE 连接管理

- 每个 server_name 建立独立的 SSE 连接
- SSE 连接在 `get_function_call()` 时按需创建，复用到 `close()` 调用
- 连接内部维护：SSE 流监听线程 + message endpoint URL + session_id

### 3.3 initialize 握手

建立 SSE 连接后，自动完成 MCP 协议握手：

**发送：**
```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {"name": "muc_mcp_client_hub", "version": "1.0.0"}
    }
}
```

**接收（通过 SSE 流）：**
```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
        "protocolVersion": "2024-11-05",
        "capabilities": {"tools": {}},
        "serverInfo": {"name": "add", "version": "1.0.0"}
    }
}
```

**发送 initialized 通知：**
```json
{
    "jsonrpc": "2.0",
    "method": "notifications/initialized"
}
```

### 3.4 tools/list 请求

**POST 到 message endpoint：**
```json
{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
}
```

**通过 SSE 流接收响应：**
```json
{
    "jsonrpc": "2.0",
    "id": 2,
    "result": {
        "tools": [
            {
                "name": "add",
                "description": "加法计算 a + b",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "a": {"type": "number", "description": "数字a"},
                        "b": {"type": "number", "description": "数字b"}
                    },
                    "required": ["a", "b"]
                }
            }
        ]
    }
}
```

### 3.5 tools/call 请求

**POST 到 message endpoint：**
```json
{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
        "name": "add",
        "arguments": {
            "a": 3,
            "b": 5
        }
    }
}
```

**通过 SSE 流接收响应：**
```json
{
    "jsonrpc": "2.0",
    "id": 3,
    "result": {
        "content": [
            {
                "type": "text",
                "text": "{\"output\": \"返回 a + b 的计算结果\", \"data\": {\"result\": 8}}"
            }
        ]
    }
}
```

---

## 4. 协议转换设计

### 4.1 MCP → OpenAI Function Call 转换规则

| MCP (tools/list) | OpenAI (function call) |
|------------------|----------------------|
| `tools[0].name` | `function.name`（直接使用 server name） |
| `tools[0].description` | `function.description` |
| `tools[0].inputSchema` | `function.parameters` |
| - | `type` = `"function"` |

**转换逻辑：**

```
MCP tool:
{
    "name": "add",
    "description": "加法计算 a + b",
    "inputSchema": { ... }
}

          ↓ 转换

OpenAI function call:
{
    "type": "function",
    "function": {
        "name": "add",
        "description": "加法计算 a + b",
        "parameters": { ... }
    }
}
```

### 4.2 call(tool_call) 转换规则

```
OpenAI 返回 tool_call:
tool_call.function.name = "add"
tool_call.function.arguments = '{"a": 3, "b": 5}'

          ↓ call() 内部处理

1. 从 tool_call.function.name 取出 server_name = "add"
2. 从 tool_call.function.arguments 解析出 arguments = {"a": 3, "b": 5}
3. 找到 server_name="add" 对应的 SSE 连接
4. 通过 POST message endpoint 发送 tools/call JSON-RPC 消息
5. 通过 SSE 流接收响应
6. 返回 MCP Server 响应结果
```

---

## 5. 使用说明

### 5.1 安装与引入

muc_mcp_client_hub 作为独立模块使用，直接引入即可：

```python
import muc_mcp_client_hub as mcp_client
```

### 5.2 完整使用流程

```python
import muc_mcp_client_hub as mcp_client
import openai
import json

# ========== 第一步：初始化 ==========
mcp_client.set_api_key("sk-abc123xxx")
mcp_client.set_env("beta", "cx")  # 可选，不设置则自动根据 muc_core.env.env_config 获取

# ========== 第二步：获取 OpenAI function call 工具列表 ==========
# 传入你要使用的 MCP Server 名称列表
# 内部会自动建立 SSE 连接、完成 MCP 握手、获取 tools/list 并转换格式
tools = mcp_client.get_function_call(["add", "sub", "mul", "div"])

# tools 可直接传给 OpenAI Chat API 的 tools 参数

# ========== 第三步：调用 OpenAI Chat API ==========
response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是一个计算助手"},
        {"role": "user", "content": "请计算 3 + 5，然后再用结果乘以 2"}
    ],
    tools=tools
)

# ========== 第四步：处理 OpenAI 返回的 tool_call ==========
# 多轮对话循环处理
messages = [{"role": "system", "content": "你是一个计算助手"},
            {"role": "user", "content": "请计算 3 + 5，然后再用结果乘以 2"}]

while True:
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools
    )

    message = response.choices[0].message

    # 如果 OpenAI 不再调用工具，说明已得到最终回答
    if not message.tool_calls:
        print("最终回答:", message.content)
        break

    # 将 assistant 的 tool_call 消息加入历史
    messages.append(message)

    # 逐个执行 tool_call
    for tool_call in message.tool_calls:
        # 一行代码调用 MCP Server，内部自动完成协议转换和 SSE 通信
        result = mcp_client.call(tool_call)

        # 将工具结果返回给 OpenAI
        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": json.dumps(result, ensure_ascii=False)
        })

# ========== 第五步：使用完毕，关闭连接 ==========
mcp_client.close()
```

### 5.3 API 说明

| 方法 | 说明 | 调用时机 |
|------|------|---------|
| `set_api_key(api_key)` | 设置 MCP Server 鉴权 API Key | 最先调用，只需一次 |
| `set_env(env, domain=None)` | 设置环境（env 和 domain），自动生成 MCP Server Hub 地址 | 最先调用，只需一次 |
| `get_function_call(server_name_list)` | 获取 OpenAI tools 列表 | 每次对话开始前调用，内部自动建立 SSE 连接 |
| `call(tool_call)` | 执行 OpenAI 返回的 tool_call | OpenAI 返回 tool_call 后调用 |
| `close()` | 关闭所有 SSE 连接 | 使用完毕后调用 |

### 5.4 调用时序图

```
用户代码                muc_mcp_client_hub              muc_mcp_server_hub
  │                          │                                │
  │  set_api_key()           │                                │
  │  set_env()               │                                │
  │─────────────────────────►│                                │
  │                          │                                │
  │  get_function_call(      │                                │
  │    ["add", "sub"])       │                                │
  │─────────────────────────►│                                │
  │                          │  GET /mcp/add (SSE)            │
  │                          │───────────────────────────────►│
  │                          │  ◄── endpoint event            │
  │                          │  POST initialize               │
  │                          │───────────────────────────────►│
  │                          │  ◄── initialize response       │
  │                          │  POST notifications/initialized│
  │                          │───────────────────────────────►│
  │                          │  POST tools/list               │
  │                          │───────────────────────────────►│
  │                          │  ◄── tools/list response       │
  │                          │                                │
  │                          │  GET /mcp/sub (SSE)            │
  │                          │───────────────────────────────►│
  │                          │  ◄── endpoint event            │
  │                          │  POST initialize               │
  │                          │───────────────────────────────►│
  │                          │  ◄── initialize response       │
  │                          │  POST tools/list               │
  │                          │───────────────────────────────►│
  │                          │  ◄── tools/list response       │
  │  ◄── [tools列表]         │                                │
  │                          │                                │
  │       ┌─── OpenAI Chat API (用户自行调用) ───┐            │
  │       │  返回 tool_call: name="add"          │            │
  │       └─────────────────────────────────────┘            │
  │                          │                                │
  │  call(tool_call)         │                                │
  │─────────────────────────►│                                │
  │                          │  POST tools/call               │
  │                          │  (通过 add 的 SSE 连接)         │
  │                          │───────────────────────────────►│
  │                          │  ◄── tools/call response       │
  │  ◄── {"data":{...}}     │                                │
  │                          │                                │
  │       ┌─── OpenAI Chat API (继续对话) ───┐               │
  │       │  不再调用工具，返回最终回答         │               │
  │       └─────────────────────────────────┘                │
  │                          │                                │
  │  close()                 │                                │
  │─────────────────────────►│  关闭所有 SSE 连接              │
  │                          │───────────────────────────────►│
```

### 5.5 注意事项

1. **set_env 为可选操作**，不设置时自动根据 `muc_core.env.env_config` 中的 env/domain 生成内网 host：

   ```python
   # 调用 set_env(env, domain=None) 时，根据 env 和 domain 生成 host：
   mcp_client.set_env("dev")           # host = http://mcp-dev.tech.muc
   mcp_client.set_env("alpha")         # host = http://mcp-alpha.tech.muc
   mcp_client.set_env("beta", "cx")    # host = http://mcp-beta-cx.tech.muc
   mcp_client.set_env("beta", "xys")   # host = http://mcp-beta-xys.tech.muc
   mcp_client.set_env("beta", "muc")   # host = http://mcp-beta-muc.tech.muc
   mcp_client.set_env("idc", "cx")     # host = http://mcp-idc-cx.tech.muc
   mcp_client.set_env("idc", "xys")    # host = http://mcp-idc-xys.tech.muc
   mcp_client.set_env("idc", "muc")    # host = http://mcp-idc-muc.tech.muc
   ```

   **host 生成规则：**
   - 若 env 为 `dev` 或 `alpha`，host = `http://mcp-{env}.tech.muc`（忽略 domain）
   - 若 env 为 `beta` 或 `idc`，host = `http://mcp-{env}-{domain}.tech.muc`（domain 必填）

   **不调用 set_env 时**，自动从 `muc_core.env.env_config` 获取：

   ```python
   from muc_core.env import env_config
   domain = env_config.get('domain', 'unknown')
   env = env_config.get('env', 'unknown')
   ```

   自动生成规则与 set_env 一致。

2. **get_function_call 会自动建立 SSE 连接并缓存**，多次调用同一 server_name 会复用连接
3. **call(tool_call) 的 tool_call 必须来自 OpenAI 的响应**，且 function.name 必须是已通过 get_function_call 注册过的 server_name
4. **使用完毕后建议调用 close()** 释放 SSE 连接资源；即使未显式调用，程序结束时也会通过析构函数自动 close
5. **SSE 连接支持自动重连**，连接意外断开时会自动重建

---

## 6. 代码文件划分

### 6.1 目录结构

```
muc_mcp_client_hub/
├── __init__.py                # 模块入口，暴露模块级接口
├── client.py                  # MCPClientHub 类，核心业务逻辑
├── sse_connection.py          # SSEConnection 类，SSE 连接管理
└── protocol.py                # 协议转换与 JSON-RPC 工具函数
```

### 6.2 文件职责

#### `__init__.py` — 模块入口（约 30 行）

仅负责暴露模块级 API，内部委托给单例实例：

```python
from .client import MCPClientHub

_instance = MCPClientHub()

def set_api_key(api_key: str):
    _instance.set_api_key(api_key)

def set_env(env: str, domain: str = None):
    _instance.set_env(env, domain)

def get_function_call(server_name_list: list) -> list:
    return _instance.get_function_call(server_name_list)

def call(tool_call) -> dict:
    return _instance.call(tool_call)

def close():
    _instance.close()
```

#### `client.py` — 核心业务逻辑

| 方法 | 职责 |
|------|------|
| `set_api_key()` | 保存 API Key |
| `set_env()` | 设置环境（env, domain），自动生成 MCP Server Hub 地址（可选，不设置则自动根据环境生成） |
| `_get_default_host()` | 根据 env/domain 自动生成内网 host |
| `get_function_call()` | 遍历 server_name，建立/复用 SSE 连接，调用 tools/list，转换为 OpenAI 格式 |
| `call()` | 从 tool_call 提取 server_name 和参数，通过 SSE 连接调用 tools/call |
| `close()` | 关闭所有 SSE 连接 |
| `__del__()` | 析构函数，若未显式 close 则自动关闭所有 SSE 连接 |
| `_get_or_create_connection()` | 获取或创建 SSEConnection |
| `_closed` | 标记是否已 close，防止 `__del__` 重复关闭 |

#### `sse_connection.py` — SSE 连接管理

| 方法 | 职责 |
|------|------|
| `connect()` | 建立 SSE 连接，获取 endpoint，完成 initialize 握手，启动监听线程 |
| `send_jsonrpc()` | 发送 JSON-RPC 消息到 message endpoint，等待 SSE 响应 |
| `close()` | 关闭 SSE 流，停止监听线程 |
| `_listen()` | 后台线程，持续读取 SSE 流，匹配 jsonrpc id 分发响应 |

#### `protocol.py` — 协议转换工具

| 函数 | 职责 |
|------|------|
| `mcp_tool_to_openai_function(tool)` | MCP tool 格式 → OpenAI function call 格式 |
| `build_jsonrpc_request(id, method, params)` | 构造 JSON-RPC 请求体 |
| `parse_jsonrpc_response(data)` | 解析 JSON-RPC 响应，提取 result 或 error |
| `build_initialize_params()` | 构造 initialize 请求参数 |

### 6.3 模块依赖关系

```
__init__.py
    └── client.py
            ├── sse_connection.py
            └── protocol.py
```

- `__init__.py` → `client.py`
- `client.py` → `sse_connection.py`（连接管理） + `protocol.py`（协议转换）
- `sse_connection.py` → `protocol.py`（JSON-RPC 消息构造/解析）
- `protocol.py` → 无内部依赖（纯工具函数）

### 6.4 设计原则

- **单一职责**：连接管理、协议转换、业务逻辑分离到不同文件，并行开发不冲突
- **低耦合**：`protocol.py` 为纯工具函数，无状态，方便单独测试
- **入口统一**：用户只通过 `__init__.py` 暴露的 5 个函数交互，内部实现透明

---

## 7. 详细流程

### 7.1 SSE 连接建立流程

```
1. GET {host}/mcp/{server_name}
   Headers: Accept: text/event-stream, Authorization: Bearer {api_key}
2. 接收 SSE 流
3. 等待 event: endpoint → 获取 message_endpoint URL（含 session_id）
4. POST message_endpoint 发送 initialize 握手
5. 通过 SSE 流接收 initialize 响应
6. POST message_endpoint 发送 notifications/initialized 通知
7. 启动后台线程持续监听 SSE 流
```

### 7.2 get_function_call 流程

```
1. 遍历 server_name_list
2. 对每个 server_name:
   a. 调用 _get_or_create_connection(server_name)
      → 首次则建立 SSE 连接（含握手）
      → 已存在则直接复用
   b. 通过 SSE 连接发送 tools/list 请求
   c. 等待并接收 tools/list 响应
   d. 从 result.tools[0] 提取 tool 信息
   e. 转换为 OpenAI function call 格式（name 直接使用 server_name）
3. 返回汇总的 tools 列表
```

### 7.3 call(tool_call) 流程

```
1. 从 tool_call.function.name 获取 server_name
2. 从 tool_call.function.arguments 解析 JSON 得到 arguments dict
3. 从 _connections[server_name] 获取 SSE 连接
   ├── 连接不存在 → 抛出 ValueError("请先调用 get_function_call")
4. 通过 SSE 连接发送 tools/call:
   POST message_endpoint:
   {
       "jsonrpc": "2.0",
       "id": n,
       "method": "tools/call",
       "params": {"name": server_name, "arguments": arguments}
   }
5. 通过 SSE 监听线程接收响应
6. 解析 result.content[0].text 返回
```

### 7.4 SSE 监听线程

```
1. 持续读取 SSE 流
2. 解析事件:
   event: message
   data: {"jsonrpc": "2.0", "id": n, "result": {...}}
3. 根据 jsonrpc "id" 查找 _response_map[id]
4. 将 result 存入 _response_map[id]
5. 通知等待的 Event.set()
```

---

## 8. 返回值约定

### 8.1 call(tool_call) 返回值

返回 MCP Server tools/call 响应中的 content 文本（已解析为 dict）：

```python
# 成功
{"output": "返回 a + b 的计算结果", "data": {"result": 8}}

# 失败
{"error": "AO服务调用失败: 具体错误信息"}
```

---

## 9. 错误处理

| 场景 | 处理方式 |
|------|---------|
| 未调用 set_api_key / set_env | `ValueError("请先设置 api_key 和 env")` |
| API Key 无效（HTTP 401） | `RuntimeError("需要正确的api-key")` |
| 无权访问 server（HTTP 403） | `RuntimeError("无权访问该server")` |
| server 不存在（HTTP 404） | `RuntimeError("server不存在")` |
| call() 时连接不存在 | `ValueError("请先调用 get_function_call")` |
| MCP Server 返回 JSON-RPC error | `RuntimeError`，包含错误详情 |
| SSE 连接断开 | 自动重连，重连失败则 `ConnectionError` |
| 网络请求超时 | `TimeoutError` |
| JSON-RPC 响应超时 | `TimeoutError` |

---

## 10. 连接生命周期

```
set_env / set_api_key
        │
        ▼
get_function_call(["add", "sub"])
        │
        ├── 为 "add" 创建 SSE 连接 → 握手 → tools/list → 缓存连接
        ├── 为 "sub" 创建 SSE 连接 → 握手 → tools/list → 缓存连接
        │
        ▼
call(tool_call)  ←── 可多次调用，复用 SSE 连接
        │
        ▼
call(tool_call)  ←── 可多次调用，复用 SSE 连接
        │
        ├── 用户显式调用 close()        → 关闭所有 SSE 连接，标记 _closed=True
        └── 用户未调用 close()，程序结束 → __del__() 自动检测并关闭
```

SSE 连接在 `get_function_call` 时按需创建，后续 `call()` 复用，`close()` 时统一关闭。若用户未显式调用 `close()`，`MCPClientHub.__del__()` 会在对象被垃圾回收时自动检测并关闭所有连接，防止资源泄漏。

**析构函数逻辑（client.py）：**

```python
class MCPClientHub:
    def __init__(self):
        self._api_key = None
        self._env = None
        self._domain = None
        self._host = None
        self._connections = {}
        self._closed = False

    def set_env(self, env: str, domain: str = None):
        """设置环境，自动生成 host"""
        self._env = env
        self._domain = domain
        self._host = self._generate_host(env, domain)

    def _generate_host(self, env: str, domain: str = None) -> str:
        """根据 env/domain 生成 host"""
        if env in ("dev", "alpha"):
            return f"http://mcp-{env}.tech.muc"
        else:
            # beta, idc 等需要 domain
            if not domain:
                raise ValueError(f"env={env} 时 domain 不能为空")
            return f"http://mcp-{env}-{domain}.tech.muc"

    def _get_default_host(self):
        """从 muc_core.env.env_config 自动获取 env/domain 并生成 host"""
        from muc_core.env import env_config
        env = env_config.get('env', 'unknown')
        domain = env_config.get('domain', 'unknown')
        return self._generate_host(env, domain)

    def close(self):
        if self._closed:
            return
        self._closed = True
        for server_name, conn in self._connections.items():
            conn.close()
        self._connections.clear()

    def __del__(self):
        if not self._closed:
            self.close()
```

---

## 11. 日志规范

```python
from muc_core.logger import Logger

Logger.info(f"[mcp_client] SSE连接建立: server={server_name}")
Logger.info(f"[mcp_client] initialize完成: server={server_name}")
Logger.info(f"[mcp_client] tools/list: server={server_name}")
Logger.info(f"[mcp_client] tools/call: server={server_name}, args={arguments}")
Logger.info(f"[mcp_client] SSE连接关闭: server={server_name}")
Logger.error(f"[mcp_client] SSE连接异常: server={server_name}, error={error}")
Logger.error(f"[mcp_client] 请求失败: server={server_name}, status={status_code}")
Logger.error(f"[mcp_client] JSON-RPC错误: server={server_name}, error={error}")
```

---

## 12. 依赖

| 依赖 | 用途 |
|------|------|
| `requests` | HTTP 请求（GET SSE 流 + POST 消息） |
| `muc_core.logger` | 日志框架 |
| `threading` | SSE 监听线程、Event 同步（标准库） |
| `json` | JSON 解析（标准库） |
