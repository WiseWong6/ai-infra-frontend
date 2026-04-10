# muc_mcp_server_hub 系统设计文档

## 1. 概述

### 1.1 背景
muc_mcp_server_hub 是一个通用 MCP Server HUB 服务，基于 Flask 框架实现，采用 SSE（Server-Sent Events）+ JSON-RPC 协议与 Claude Code 通信。它作为中间层，将 Claude Code 的 MCP 工具调用请求路由到后端的 AO（Application Object）服务中的对应接口。

### 1.2 目标
- 提供统一的 MCP Server 入口，支持多个 MCP Server 按路径区分
- 通过环境变量 `mcp_hub_enable_auth` 控制是否开启 API Key 鉴权（外网机器开启，内网机器不开启）
- 通过 MySQL 配置管理，动态映射 MCP Server 到不同的 AO 服务接口
- 无需管理后台，所有配置由人工直接维护 MySQL 表

### 1.3 架构总览

```
┌──────────────┐         SSE + JSON-RPC          ┌─────────────────────┐
│  Claude Code │◄──────────────────────────────►│ muc_mcp_server_hub  │
│              │  http://myhost:8080/mcp/{name} │   (Flask + SSE)     │
└──────────────┘                                 └─────────┬───────────┘
      │                                                    │
      │ GET /mcp/{name}                                   │
      │ Header: Authorization: Bearer {api_key}            │
      │                                          ┌─────────▼───────────┐
      │                                          │       MySQL         │
      │                                          │  - mcp_api_key      │
      │                                          │  - mcp_server_config│
      │                                          └─────────────────────┘
      │                                                    │
      │                                          ┌─────────▼───────────┐
      │                                          │   call_server       │
      │                                          │  (AO 服务调用层)     │
      │                                          └─────────┬───────────┘
      │                                                    │
      │                                          ┌─────────▼───────────┐
      │                                          │  AO 服务 (via Nacos) │
      │                                          │  python / php / go   │
      │                                          └─────────────────────┘
```

---

## 2. 数据库设计

### 2.1 API Key 管理表：`mcp_api_key`

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | AUTO_INCREMENT, PRIMARY KEY | 主键 |
| api_key | VARCHAR(128) | NOT NULL, UNIQUE | API Key，用于鉴权 |
| allowed_servers | JSON | NOT NULL | 允许访问的 server_name 列表，如 `["server_name1", "server_name2"]` |
| owner | VARCHAR(64) | NOT NULL | 负责人名称 |
| enabled | TINYINT | NOT NULL DEFAULT 1 | 是否启用，1=启用，0=禁用 |
| addtime | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| mtime | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 修改时间 |

**建表 SQL：**

```sql
CREATE TABLE `mcp_api_key` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `api_key` VARCHAR(128) NOT NULL COMMENT 'API Key，用于鉴权',
  `allowed_servers` JSON NOT NULL COMMENT '允许访问的 server_name 列表',
  `owner` VARCHAR(64) NOT NULL COMMENT '负责人名称',
  `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用，1=启用，0=禁用',
  `addtime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `mtime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_api_key` (`api_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='MCP API Key 管理表';
```

### 2.2 Server 配置管理表：`mcp_server_config`

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | AUTO_INCREMENT, PRIMARY KEY | 主键 |
| server_name | VARCHAR(128) | NOT NULL, UNIQUE | MCP Server 名称，对应 URL 路径中的 {name} |
| service_name | VARCHAR(128) | NOT NULL | Nacos 注册的服务名 |
| interface_name | VARCHAR(128) | NOT NULL | AO 服务对应的接口名称 |
| lang | ENUM('python', 'php', 'go') | NOT NULL | AO 服务的语言类型 |
| config | JSON | NOT NULL | 工具的输入输出配置 |
| service_config | JSON | DEFAULT NULL | AO 服务调用配置，如 `{"timeout": 5}` |
| owner | VARCHAR(64) | NOT NULL | 负责人名称 |
| enabled | TINYINT | NOT NULL DEFAULT 1 | 是否启用，1=启用，0=禁用 |
| addtime | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| mtime | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 修改时间 |

**config 字段结构定义：**

```json
{
    "input": {
        "name": "工具名称，与 server_name 保持一致",
        "description": "工具的功能描述，供 Claude Code 理解用途",
        "inputSchema": {
            "type": "object",
            "properties": {
                "参数名": {"type": "参数类型", "description": "参数描述"}
            },
            "required": ["必填参数列表"]
        }
    },
    "output": "接口返回值的描述信息"
}
```

**service_config 字段结构定义：**

```json
{"timeout": 5}
```

| 字段 | 说明 |
|------|------|
| timeout | AO 服务调用超时时间（秒），传给 XxxClient 的 timeout 参数 |

**建表 SQL（mcp_server_config）：**

```sql
CREATE TABLE `mcp_server_config` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `server_name` VARCHAR(128) NOT NULL COMMENT 'MCP Server 名称',
  `service_name` VARCHAR(128) NOT NULL COMMENT 'Nacos 注册的服务名',
  `interface_name` VARCHAR(128) NOT NULL COMMENT 'AO 服务对应的接口名称',
  `lang` ENUM('python', 'php', 'go') NOT NULL COMMENT 'AO 服务的语言类型',
  `config` JSON NOT NULL COMMENT '工具的输入输出配置',
  `service_config` JSON DEFAULT NULL COMMENT 'AO 服务调用配置，如 {"timeout": 5}',
  `owner` VARCHAR(64) NOT NULL COMMENT '负责人名称',
  `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用，1=启用，0=禁用',
  `addtime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `mtime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_server_name` (`server_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='MCP Server 配置管理表';
```

---

## 3. 配置文件设计

### 3.1 config.json

```json
{
    "server": {
        "host": "0.0.0.0",
        "port": 8080
    },
    "mysql": {
        "host": "127.0.0.1",
        "port": 3306,
        "user": "root",
        "password": "your_password",
        "database": "mcp_hub",
        "charset": "utf8mb4"
    },
    "log_level": "INFO"
}
```

---

## 4. 接口设计

### 4.1 总体说明

Claude Code 配置 MCP Server 时，URL 格式为：
```
http://myhost:8080/mcp/{server_name}
```

所有请求需携带 HTTP Header：
```
Authorization: Bearer {api_key}
```

通信协议采用 **SSE + JSON-RPC**，符合 MCP 标准协议规范。

### 4.2 鉴权控制

通过环境变量 `mcp_hub_enable_auth` 控制是否开启 API Key 鉴权：

| 环境变量 | 值 | 行为 |
|---------|-----|------|
| `mcp_hub_enable_auth` | 未设置（默认） | 不鉴权，跳过 API Key 验证 |
| `mcp_hub_enable_auth` | `True` | 开启鉴权，必须携带有效的 API Key |

- **内网机器**：不设置该环境变量，不走鉴权
- **外网机器**：设置 `mcp_hub_enable_auth=True`，走 API Key 鉴权

### 4.3 环境解析

muc_mcp_server_hub 从请求的 Host 头中解析当前环境信息（env 和 domain），传递给 call_server 用于 AO 服务调用：

**二级域名映射规则：**

| 二级域名 | env | domain |
|---------|-----|--------|
| mcp-dev | dev | xys |
| mcp-alpha | alpha | xys |
| mcp-beta-cx | beta | cx |
| mcp-beta-xys | beta | xys |
| mcp-beta-muc | beta | muc |
| mcp-idc-cx | idc | cx |
| mcp-idc-xys | idc | xys |
| mcp-idc-muc | idc | muc |

**解析逻辑：**

```
Host: mcp-beta-cx.shouhui-tech.com 或 mcp-beta-cx.tech.muc
  → 提取二级域名: mcp-beta-cx
  → 解析: env=beta, domain=cx
```

### 4.4 请求处理流程

```
Flask 接收 GET /mcp/{server_name}
    │
    ├── 1. 解析 server_name（从 URL 路径）
    ├── 2. 从请求 Host 解析 env 和 domain
    ├── 3. 检查环境变量 mcp_hub_enable_auth 是否为 True
    │       ├── 是 → 提取 api_key，查询 MySQL 验证权限
    │       │       ├── 无权限 → 返回 401
    │       └── 否 → 跳过鉴权
    ├── 4. 查询 mcp_server_config 表获取 server_name 配置
    │       ├── 不存在 → 返回 404
    ├── 5. 建立 SSE 长连接
    └── 6. 监听 JSON-RPC 消息，路由到对应处理方法
```

### 4.3 JSON-RPC 方法处理

#### 4.3.1 initialize

MCP 协议握手，返回服务器能力声明。

**请求：**
```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {"name": "claude-code", "version": "1.0.0"}
    }
}
```

**响应：**
```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
        "protocolVersion": "2024-11-05",
        "capabilities": {
            "tools": {}
        },
        "serverInfo": {
            "name": "{server_name}",
            "version": "1.0.0"
        }
    }
}
```

#### 4.3.2 tools/list

返回当前 MCP Server 支持的工具列表。从 `mcp_server_config.config["input"]` 读取。

**请求：**
```json
{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
}
```

**响应：**
```json
{
    "jsonrpc": "2.0",
    "id": 2,
    "result": {
        "tools": [
            {
                "name": "calculator",
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

#### 4.3.3 tools/call

执行工具调用。从 `mcp_server_config` 读取服务配置，调用 `call_server.call_ao_service()` 远程调用 AO 服务。

**请求：**
```json
{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
        "name": "calculator",
        "arguments": {
            "a": 1,
            "b": 2
        }
    }
}
```

**响应（成功）：**
```json
{
    "jsonrpc": "2.0",
    "id": 3,
    "result": {
        "content": [
            {
                "type": "text",
                "text": "{\"output\": \"返回 a + b 的计算结果\", \"data\": {\"result\": 3}}"
            }
        ]
    }
}
```

**响应（失败）：**
```json
{
    "jsonrpc": "2.0",
    "id": 3,
    "result": {
        "content": [
            {
                "type": "text",
                "text": "服务异常没有返回，请稍后重试"
            }
        ],
        "isError": true
    }
}
```

---

## 5. call_server 接口说明

call_server 是独立模块，详细设计见 [call_server系统设计.md](call_server系统设计.md)。

muc_mcp_server_hub 中调用方式：

```python
from call_server import call_ao_service

env, domain = parse_host(request.host)
timeout = server_config.get("service_config", {}).get("timeout", None)

try:
    data = call_ao_service(
        service_name=server_config["service_name"],
        interface_name=server_config["interface_name"],
        lang=server_config["lang"],
        params=arguments,
        env=env,
        domain=domain,
        timeout=timeout
    )
    # data 是 AO 服务的原始返回值
    text = json.dumps({"output": server_config["config"]["output"], "data": data})
    is_error = False
except Exception as e:
    Logger.error(f"[mcp_hub] AO服务调用失败: {e}")
    text = "服务异常没有返回，请稍后重试"
    is_error = True
```

call_ao_service 直接返回 AO 原始结果，异常直接抛出。muc_mcp_server_hub 负责捕获异常并拼装 MCP 响应。

---

## 6. 模块设计

### 6.1 项目结构

```
muc_mcp_server_hub/
├── muc_mcp_server_hub.py   # 主程序入口，Flask 应用 + SSE + JSON-RPC 处理
├── call_server/             # AO 服务调用模块（独立模块）
│   ├── __init__.py
│   └── call_server.py
├── config.json              # 配置文件
└── db.py                    # 数据库操作封装
```

### 6.2 模块职责

#### muc_mcp_server_hub.py（主程序）

| 职责 | 说明 |
|------|------|
| Flask 应用初始化 | 加载 config.json，初始化 MySQL 连接 |
| SSE 端点 | `GET /mcp/<server_name>` 建立 SSE 长连接 |
| 鉴权中间件 | 从 Authorization Header 提取 api_key，查询 MySQL 验证权限 |
| JSON-RPC 消息路由 | 解析 JSON-RPC 消息，分发到 initialize / tools/list / tools/call |
| tools/list 处理 | 从 mcp_server_config.config["input"] 构造工具列表返回 |
| tools/call 处理 | 解析 Host 获取 env/domain，调用 call_server.call_ao_service()，捕获异常，拼装返回结果 |

#### db.py（数据库操作）

| 方法 | 说明 |
|------|------|
| `verify_api_key(api_key, server_name)` | 验证 api_key 是否有效且有权限访问 server_name |
| `get_server_config(server_name)` | 根据 server_name 获取服务配置 |

---

## 7. 详细流程

### 7.1 tools/list 流程

```
1. 收到 JSON-RPC "tools/list" 请求
2. 从数据库获取 mcp_server_config 中 server_name 对应的 config
3. 构造响应：
   {
       "tools": [config["input"]]
   }
4. 通过 SSE 发送 JSON-RPC 响应
```

### 7.2 tools/call 流程

```
1. 收到 JSON-RPC "tools/call" 请求
2. 从请求 params 中获取 name 和 arguments
3. 从数据库获取 mcp_server_config 中 server_name 对应的配置
4. 提取 service_name、interface_name、lang、service_config
5. 从请求 Host 解析 env 和 domain，从 service_config 获取 timeout
6. 调用 call_server.call_ao_service(service_name, interface_name, lang, arguments, env, domain, timeout)
7. call_ao_service 直接返回 AO 原始结果，异常直接抛出
7. muc_mcp_server_hub 捕获结果/异常，拼装响应：
   - 成功: {"content": [{"type": "text", "text": json.dumps({"output": config["output"], "data": data})}]}
   - 失败: {"content": [{"type": "text", "text": "服务异常没有返回，请稍后重试"}], "isError": True}
8. 通过 SSE 发送 JSON-RPC 响应
```

### 7.3 错误处理

| 场景 | HTTP 状态码 | 错误信息 |
|------|-----------|---------|
| 未携带 Authorization Header（开启鉴权时） | 401 | `缺少 Authorization Header` |
| api_key 无效或已禁用（开启鉴权时） | 401 | `无效的api-key` |
| api_key 无权访问该 server_name（开启鉴权时） | 403 | `无权访问该server` |
| server_name 不存在或已禁用 | 404 | `server不存在或已禁用` |
| AO 服务调用失败 | 200（JSON-RPC 层面） | `服务异常没有返回，请稍后重试` |

---

## 8. Claude Code 配置示例

```json
{
    "mcpServers": {
        "calculator": {
            "url": "http://myhost:8080/mcp/calculator",
            "headers": {
                "Authorization": "Bearer sk-abc123xxx"
            }
        },
        "weather": {
            "url": "http://myhost:8080/mcp/weather",
            "headers": {
                "Authorization": "Bearer sk-abc123xxx"
            }
        }
    }
}
```

---

## 9. 日志规范

```python
from muc_core.logger import Logger

Logger.info(f"[mcp_hub] {server_name} tools/list called, api_key={api_key[:8]}***")
Logger.info(f"[mcp_hub] {server_name} tools/call called, params={params}")
Logger.error(f"[mcp_hub] api_key验证失败: {api_key[:8]}***, server={server_name}")
Logger.error(f"[mcp_hub] AO服务调用失败: service={service_name}, interface={interface_name}, error={e}")
```

日志中 api_key 脱敏处理，仅显示前 8 位。

---

## 10. 待设计项

| 项目 | 说明 | 状态 |
|------|------|------|
| config 热更新 | 是否需要支持不重启服务更新配置 | 待定 |
| 限流策略 | 是否需要对 API Key 维度进行限流 | 待定 |