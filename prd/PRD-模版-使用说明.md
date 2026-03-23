# PRD HTML 模版使用说明

## 📦 模版位置

项目本地示例模版（推荐）：
```
prd/PRD-AI平台功能优化.html
```

这是一个已填充内容的完整示例，复制后替换内容即可。

中央 skill 仓库：
```
~/.claude/skills/html-to-prd/assets/prd-template.html
```

---

## 🚀 使用方式

### 方式 1：从 HTML 原型自动生成（推荐）

直接告诉 Claude：
```
把 frontend/pages/frontend-xxx.html 转成 PRD
```

或批量生成：
```
基于 frontend/pages 下的所有 HTML 生成一份完整 PRD
```

Claude 会：
1. 读取 HTML 结构
2. 提取标题、按钮、表单字段等信息
3. 自动填充模版生成 PRD
4. 嵌入 iframe 指向原型文件

### 方式 2：手动复制模版

如需手动创建 PRD：
```bash
# 使用已填充的示例模版（推荐）
cp "prd/PRD-AI平台功能优化.html" "prd/PRD-你的需求名称.html"

# 或使用空白模版
cp ~/.claude/skills/html-to-prd/assets/prd-template.html \
   "prd/PRD-你的需求名称.html"
```

然后手动替换内容。

---

## 📝 占位符说明

| 占位符 | 说明 | 示例 |
|--------|------|------|
| `{{需求名称}}` | 文档标题 | Trace追踪优化 |
| `{{功能名称}}` | 功能模块名 | Trace列表查询 |
| `{{P0/P1}}` | 优先级 | P0 |
| `{{负责人}}` | 文档负责人 | 张三 |
| `{{YYYY-MM-DD}}` | 日期 | 2024-03-03 |
| `{{需求概述}}` | 功能描述 | 提供多维筛选能力... |

---

## 🎨 可用组件

### 信息框
```html
<div class="info-box blue">
    <p>内容</p>
</div>
```

### 卡片网格
```html
<div class="card-grid">
    <div class="card">...</div>
</div>
```

### 原型嵌入
```html
<div class="prototype-embed">
    <div class="prototype-wrapper">
        <iframe class="prototype-frame" src="file:///.../xxx.html"></iframe>
    </div>
</div>
```

### 折叠面板
```html
<div class="accordion">
    <button class="accordion-header" onclick="toggleAccordion(this)">
        标题
    </button>
    <div class="accordion-body">
        <div class="accordion-content">内容</div>
    </div>
</div>
```

### 表格
```html
<div class="table-wrapper">
    <table class="data-table">
        <thead><tr><th>列1</th></tr></thead>
        <tbody><tr><td>值1</td></tr></tbody>
    </table>
</div>
```

---

## ⚠️ 注意事项

1. **iframe 路径**：使用绝对路径 `file:///Users/...`，只在当前电脑有效
2. **浏览器限制**：直接打开 file 协议的 HTML 可能有安全限制，建议启动本地服务器：
   ```bash
   python3 -m http.server 8080
   ```
3. **换电脑使用**：PRD 文件需要重新生成或手动更新 iframe 路径

---

## 📁 项目 PRD 目录

当前项目的 PRD 文件：
```
prd/
├── PRD-AI平台功能优化.html     ← 示例生成文件
├── PRD-应用配置与Trace详情交互优化.html  ← 历史文件
├── PRD-提示词管理平台-优化版.html        ← 历史文件
└── PRD-模版-使用说明.md      ← 本文件
```

**不要删除 skill 目录**，它是技能的中央仓库。
