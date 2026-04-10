# MCP Server HUB 系统设计（总览）

## 1. 系统概述

本系统解决一个核心问题：**让 AI 应用（Claude Code / OpenAI）能够通过统一的 MCP 协议调用后端的 AO 业务服务。**

系统由三个模块组成：

| 模块 | 定位 | 面向的用户 |
|------|------|-----------|
| **muc_mcp_server_hub** | MCP Server 服务端 | Claude Code、mcp_client |
| **muc_mcp_client_hub** | MCP Client 客户端库 | 使用 OpenAI API 的业务代码 |
| **call_server** | AO 服务调用层 | muc_mcp_server_hub 内部使用 |

---

## 2. 整体架构

```
┌──────────────┐                 ┌──────────────────────┐
│  Claude Code │                 │   业务代码 (Python)   │
│              │                 │   使用 OpenAI API     │
│ 原生支持 MCP │                 │   function call       │
└──────┬───────┘                 └──────────┬───────────┘
       │                                    │
       │                          ┌─────────▼──────────┐
       │                          │ muc_mcp_client_hub  │
       │                          │  协议转换:           │
       │                          │  MCP ↔ OpenAI       │
       │                          └─────────┬──────────┘
       │                                    │
       │        SSE + JSON-RPC              │  SSE + JSON-RPC
       │                                    │
┌──────▼────────────────────────────────────▼───────────┐
│                muc_mcp_server_hub (Flask)              │
│                                                       │
│  ┌─────────┐  ┌──────────────┐  ┌──────────┐         │
│  │ API Key  │  │  JSON-RPC    │  │   SSE    │         │
│  │  鉴权    │  │  消息路由    │  │  连接管理 │         │
│  └─────────┘  └──────────────┘  └──────────┘         │
│                                                       │
│  ┌──────────────────────────────────────────┐         │
│  │  MySQL: mcp_api_key + mcp_server_config  │         │
│  └──────────────────────────────────────────┘         │
│                       │                               │
│                       ▼                               │
│  ┌──────────────────────────────────────────┐         │
│  │          call_server                     │         │
│  │  PyaoClient / PhpClient / GoClient       │         │
│  └──────────────────────┬───────────────────┘         │
└─────────────────────────┼─────────────────────────────┘
                          │ via Nacos
                          ▼
                 ┌──────────────────┐
                 │  AO 业务服务      │
                 │  Python/PHP/Go   │
                 └──────────────────┘
```

---

## 3. 两种使用场景

### 场景一：Claude Code 直接使用

Claude Code 原生支持 MCP 协议，直接配置 Server URL 即可。

```
Claude Code ──SSE+JSON-RPC──► muc_mcp_server_hub ──► call_server ──► AO 服务
```

配置示例：
```json
{
    "mcpServers": {
        "calculator": {
            "url": "http://myhost:8080/mcp/calculator",
            "headers": {"Authorization": "Bearer sk-abc123xxx"}
        }
    }
}
```

### 场景二：OpenAI API 通过 muc_mcp_client_hub 使用

OpenAI 不支持 MCP 协议（只支持 function call），需要 muc_mcp_client_hub 做协议转换。

```
业务代码 ──OpenAI function call──► muc_mcp_client_hub ──SSE+JSON-RPC──► muc_mcp_server_hub ──► AO 服务
```

使用示例：
```python
import muc_mcp_client_hub as mcp_client
import openai
import json

# 1. 初始化（env 可选，不设置则根据当前环境自动生成内网 host）
mcp_client.set_api_key("sk-abc123xxx")
# mcp_client.set_env("beta", "cx")

# 2. 获取 OpenAI function call 工具列表
tools = mcp_client.get_function_call(["calculator"])

# 3. 调用 OpenAI Chat API，将 tools 传入
messages = [{"role": "user", "content": "请计算 3 + 5"}]
response = openai.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=tools
)

# 4. 处理 OpenAI 返回的 tool_calls
message = response.choices[0].message
if message.tool_calls:
    for tool_call in message.tool_calls:
        # 一行代码调用 MCP Server
        result = mcp_client.call(tool_call)

        # 将结果返回给 OpenAI 继续对话
        messages.append(message)
        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": json.dumps(result, ensure_ascii=False)
        })

    # 再次调用 OpenAI 获取最终回答
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools
    )

# 5. 使用完毕，关闭连接
mcp_client.close()
```

---

## 4. 模块间关系

### 4.1 调用链路

```
muc_mcp_client_hub ──(SSE网络调用)──► muc_mcp_server_hub ──(Python import)──► call_server ──(Nacos+HTTP)──► AO 服务
```

| 关系 | 通信方式 | 说明 |
|------|---------|------|
| client_hub → server_hub | SSE + JSON-RPC（网络） | 标准协议，可跨机器部署 |
| server_hub → call_server | Python 函数调用（进程内） | 同一进程内直接导入 |
| call_server → AO 服务 | Nacos 服务发现 + HTTP（跨机器） | 通过 Nacos 获取实例，HTTP 调用远程 AO 服务 |

### 4.2 数据流：tools/list

一个 MCP Server URL 对应一个 tool（即一个 AO 接口），不是多个 tools 的集合。

```
MySQL.mcp_server_config.config["input"]
        │
        ▼
muc_mcp_server_hub 读取 config["input"]（含 inputSchema）
        │
        ├──► Claude Code: 通过 MCP 协议获取 inputSchema，知道如何调用 tools/call
        │
        └──► muc_mcp_client_hub: 通过 MCP 协议获取 inputSchema，转换为 OpenAI function call 格式
```

### 4.3 数据流：tools/call

```
Claude Code / OpenAI 业务代码
        │  arguments (入参)
        ▼
muc_mcp_server_hub 收到 tools/call 请求
        │
        ├── 从 URL 中提取 mcp server_name，查询 MySQL mcp_server_config 获取 service_name、interface_name、lang
        │
        ▼
call_server.call_ao_service(service_name, interface_name, lang, arguments, env, domain, timeout)
        │
        ├── lang="python" → PyaoClient(service_name, env, domain, timeout).invoke(interface_name, arguments)
        ├── lang="php"    → PhpClient(service_name, env, domain, timeout).invoke(interface_name, arguments)
        └── lang="go"     → GoClient(service_name, env, domain, timeout).invoke(interface_name, arguments)
        │
        ▼
AO 服务返回结果 → muc_mcp_server_hub 拼装后原路返回
```

### 4.4 MySQL 两张表的关系

```
mcp_api_key.allowed_servers 中的每一项
        │
        │  关联
        ▼
mcp_server_config.server_name
```

- `mcp_api_key` 控制"谁能访问哪些 server"（鉴权）
- `mcp_server_config` 控制"每个 server 对应哪个 AO 服务的哪个接口"（路由）

**举例：**

mcp_api_key 表：
| api_key | allowed_servers |
|---------|----------------|
| sk-abc123 | `["add", "sub"]` |

mcp_server_config 表：
| server_name | service_name | interface_name | lang |
|-------------|-------------|---------------|------|
| add | math_tools | add | python |
| sub | math_tools | sub | python |

当 `sk-abc123` 请求 `/mcp/add` 时：
1. 鉴权：`add` 在 `["add", "sub"]` 中，有权限
2. 路由：`add` → `math_tools` 服务的 `add` 接口（Python）

---

## 5. 部署形态

### 5.1 服务端部署

服务端只部署在 **alpha 环境** 和 **手回生产环境** 两台机器上：

| 环境 | 外网 Host | 内网 Host | 实际指向 | 鉴权 |
|------|----------|----------|---------|------|
| dev | https://mcp-dev.shouhui-tech.com | http://mcp-dev.tech.muc | 手回生产机器 | 内网不鉴权，外网鉴权 |
| alpha | https://mcp-alpha.shouhui-tech.com | http://mcp-alpha.tech.muc | alpha 机器 | 内网不鉴权，外网鉴权 |
| beta-cx | https://mcp-beta-cx.shouhui-tech.com | http://mcp-beta-cx.tech.muc | 手回生产机器 | 内网不鉴权，外网鉴权 |
| beta-xys | https://mcp-beta-xys.shouhui-tech.com | http://mcp-beta-xys.tech.muc | 手回生产机器 | 内网不鉴权，外网鉴权 |
| beta-muc | https://mcp-beta-muc.shouhui-tech.com | http://mcp-beta-muc.tech.muc | 手回生产机器 | 内网不鉴权，外网鉴权 |
| idc-cx | https://mcp-idc-cx.shouhui-tech.com | http://mcp-idc-cx.tech.muc | 手回生产机器 | 内网不鉴权，外网鉴权 |
| idc-xys | https://mcp-idc-xys.shouhui-tech.com | http://mcp-idc-xys.tech.muc | 手回生产机器 | 内网不鉴权，外网鉴权 |
| idc-muc | https://mcp-idc-muc.shouhui-tech.com | http://mcp-idc-muc.tech.muc | 手回生产机器 | 内网不鉴权，外网鉴权 |

- alpha 环境的 host 指向 alpha 机器
- 其他所有环境的 host 都指向手回生产机器（同一个 IP）
- 外网机器设置环境变量 `mcp_hub_enable_auth=True` 开启鉴权，内网机器不设置（不鉴权）
- 手回生产机器上的 muc_mcp_server_hub 通过解析请求 Host 中的二级域名，确定 env/domain，路由到对应环境的 AO 服务

两台机器的部署结构相同：
```
alpha 机器 / 手回生产机器
│
├── muc_mcp_server_hub/        # Flask 进程
│   ├── muc_mcp_server_hub.py  # 主程序入口
│   ├── db.py                  # 数据库操作
│   └── config.json            # 配置文件
│
├── call_server/               # 被 server_hub 导入
│   ├── __init__.py
│   └── call_server.py
│
├── MySQL                      # mcp_api_key + mcp_server_config
└── Nacos                      # AO 服务注册中心
```

### 5.2 客户端安装

```
业务代码项目
│
└── muc_mcp_client_hub/        # 作为 Python 库引入
    ├── __init__.py
    ├── client.py
    ├── sse_connection.py
    └── protocol.py
```

muc_mcp_client_hub 是纯客户端库，无需服务端部署，业务代码 import 后远程连接 muc_mcp_server_hub 即可使用。

---

## 6. 设计文档索引

| 模块 | 设计文档 | 核心职责 |
|------|---------|---------|
| muc_mcp_server_hub | [muc_mcp_server_hub系统设计.md](muc_mcp_server_hub系统设计.md) | 服务端：鉴权、SSE、JSON-RPC 路由、AO 调用编排 |
| muc_mcp_client_hub | [muc_mcp_client_hub系统设计.md](muc_mcp_client_hub系统设计.md) | 客户端库：SSE 连接管理、MCP ↔ OpenAI 协议转换 |
| call_server | [call_server系统设计.md](call_server系统设计.md) | AO 调用层：屏蔽 Python/PHP/Go 语言差异 |
