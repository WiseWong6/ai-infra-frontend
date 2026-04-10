# call_server 系统设计文档

## 1. 概述

### 1.1 背景

call_server 是 muc_mcp_server_hub 的 AO 服务调用模块，负责根据服务语言类型（python/php/go）初始化对应的客户端，调用 AO 服务接口并透传入参，直接返回 AO 服务的原始结果。

### 1.2 目标

- 统一封装 Python / PHP / Go 三种语言 AO 服务的调用逻辑
- 提供简洁的单一入口函数，对 muc_mcp_server_hub 屏蔽语言差异
- 直接透传 AO 服务的返回值，不做任何加工

---

## 2. 使用方式

call_server 由 muc_mcp_server_hub 内部调用，不直接暴露给终端用户：

```python
from call_server import call_ao_service

result = call_ao_service(
    service_name="orderao",
    interface_name="list_orders",
    lang="python",
    params={"limit": 10},
    env="beta",
    domain="cx",
    timeout=5
)

# result = AO 服务的原始返回值，例如 {"orders": [...], "total": 100}
# 异常时直接抛出异常，由上层 muc_mcp_server_hub 捕获处理
```

---

## 3. 接口定义

### 3.1 call_ao_service

```python
def call_ao_service(service_name: str, interface_name: str, lang: str, params: dict,
                    env: str, domain: str, timeout: int = None):
    """
    调用 AO 服务

    Args:
        service_name: Nacos 注册的服务名，如 "orderao"
        interface_name: AO 服务接口名称，如 "list_orders"
        lang: 服务语言类型，"python" / "php" / "go"
        params: 调用参数，来自 MCP tools/call 的 arguments
        env: 环境标识，如 "dev" / "alpha" / "beta" / "idc"
        domain: 域标识，如 "cx" / "xys" / "muc"
        timeout: 调用超时时间（秒），来自 mcp_server_config.service_config

    Returns:
        AO 服务的原始返回值，不做任何加工

    Raises:
        ValueError: lang 不支持时
        Exception: AO 服务调用失败时，透传原始异常
    """
```

---

## 4. AO 客户端调用方式

三种语言的客户端接口一致，仅类名不同：

| lang 值 | 客户端类 | 导入路径 |
|---------|---------|---------|
| `"python"` | `PyaoClient` | `from muc_core import PyaoClient` |
| `"php"` | `PhpClient` | `from muc_core.php_client import PhpClient` |
| `"go"` | `GoClient` | `from muc_core.go_client import GoClient` |

**统一调用模式：**

```python
client = XxxClient(service_name, env, domain, timeout)
result = client.invoke(interface_name, params)
```

XxxClient 构造参数：

| 参数 | 说明 | 示例 |
|------|------|------|
| service_name | Nacos 注册的服务名 | `"orderao"` |
| env | 环境标识 | `"beta"` |
| domain | 域标识 | `"cx"` |
| timeout | 超时时间（秒），可选 | `5` |

---

## 5. 详细流程

```
call_ao_service(service_name, interface_name, lang, params, env, domain, timeout)
    │
    ├── 1. 根据 lang 选择客户端类
    │       ├── "python" → PyaoClient
    │       ├── "php"    → PhpClient
    │       ├── "go"     → GoClient
    │       └── 其他     → 抛出 ValueError("不支持的语言类型: {lang}")
    │
    ├── 2. 创建客户端实例
    │       client = XxxClient(service_name, env, domain, timeout)
    │
    ├── 3. 调用接口
    │       data = client.invoke(interface_name, params)
    │       异常直接抛出，由上层捕获
    │
    └── 4. 返回 AO 服务原始结果
            return data
```

---

## 6. 代码文件划分

### 6.1 目录结构

```
call_server/
├── __init__.py        # 模块入口，暴露 call_ao_service
└── call_server.py     # 核心实现
```

### 6.2 文件职责

#### `__init__.py`

```python
from .call_server import call_ao_service
```

#### `call_server.py`

| 内容 | 说明 |
|------|------|
| `LANG_CLIENT_MAP` | lang → 客户端类的映射字典 |
| `call_ao_service()` | 核心函数，选择客户端 → 创建实例 → 调用 → 返回原始结果 |

核心逻辑（约 20 行）：

```python
from muc_core import PyaoClient
from muc_core.php_client import PhpClient
from muc_core.go_client import GoClient
from muc_core.logger import Logger

LANG_CLIENT_MAP = {
    "python": PyaoClient,
    "php": PhpClient,
    "go": GoClient,
}

def call_ao_service(service_name: str, interface_name: str, lang: str, params: dict,
                    env: str, domain: str, timeout: int = None):
    client_cls = LANG_CLIENT_MAP.get(lang)
    if not client_cls:
        raise ValueError(f"不支持的语言类型: {lang}")

    client = client_cls(service_name, env, domain, timeout)
    Logger.info(f"[call_server] 调用: service={service_name}, interface={interface_name}, lang={lang}, env={env}, domain={domain}")
    return client.invoke(interface_name, params)
```

---

## 7. 错误处理

| 场景 | 处理方式 |
|------|---------|
| lang 不在 python/php/go 中 | 抛出 `ValueError` |
| 客户端初始化失败（服务不存在等） | 透传原始异常 |
| 调用超时（框架抛异常） | 透传原始异常 |
| 调用其他异常 | 透传原始异常 |

所有异常不做捕获包装，直接透传给 muc_mcp_server_hub 处理。

---

## 8. 日志规范

```python
Logger.info(f"[call_server] 调用: service={service_name}, interface={interface_name}, lang={lang}")
Logger.error(f"[call_server] 调用失败: service={service_name}, interface={interface_name}, lang={lang}, error={e}")
```

---

## 9. 依赖

| 依赖 | 用途 |
|------|------|
| `muc_core.PyaoClient` | 调用 Python AO 服务 |
| `muc_core.php_client.PhpClient` | 调用 PHP AO 服务 |
| `muc_core.go_client.GoClient` | 调用 Go AO 服务 |
| `muc_core.logger.Logger` | 日志 |