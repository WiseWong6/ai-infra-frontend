# AI Infra Frontend Platform Guidelines

## Project Structure & Module Organization
This repository is a static frontend prototype set for the AI Infra platform, encompassing multiple interconnected modules (e.g., Prompt Management, Evaluation, Trace Tracking, Knowledge Base, etc.).

- `prd/`: Contains source-of-truth product requirement documents.
  - `PRD-提示词管理平台-优化版.html`: Core prompt management logic (List, Create, Edit, Variables).
  - `PRD-应用配置与Trace详情交互优化.html`: App Config & Trace Detail interaction optimization (includes App Config split-pane edit, Trace list three-button actions, Process Log timeline with node navigation, and KB Slice slide-over panel).
  - `PRD-AI平台功能优化.html`: AI platform optimization features (OCR evaluation, workflow enhancements).
  - `PRD-模版-使用说明.md`: PRD template usage guide for generating new PRD documents from HTML prototypes.
  - **Navigation Pattern**: PRD files use **IntersectionObserver** for sidebar TOC highlighting:
    - Click TOC item: Immediately highlights and smoothly scrolls to anchor.
    - Scroll: Auto-highlights the TOC item whose section is nearest viewport top.
    - Implementation: Single observer with `rootMargin: '-80px 0px -70% 0px'` watching all `.section[id]`, `.accordion-header[id]`, and `h3[id]/h4[id]/h5[id]` elements.
- `frontend/pages/`: Single-file HTML pages with inline logic or shared dependencies.
  - `frontend-slides-guide.html`: Prompt Management - List view.
  - `frontend-slides-guide-create.html`: Prompt Management - Create new prompt.
  - `frontend-slides-guide-edit.html`: Prompt Management - Edit existing prompt.
  - `frontend-app-management.html`: Application List.
  - `frontend-app-config.html`: App Resource Configuration (Drawer/Slide-out version).
  - `frontend-app-config-edit.html`: App Resource Configuration (Full-page Split-Pane version).
  - `frontend-eval-tasks.html`: Evaluation / Eval-set module.
  - `frontend-ocr-eval.html`: OCR Evaluation Workbench - OCR quality assessment and comparison module.
  - `frontend-trace.html`: Trace Tracking module (List, Search, Detail Drawer with Timeline Process Log, KB Slice Panel).
    - **TraceId 复制功能**: Trace列表和详情页中的 `TraceId`，以及详情页中的 `userId`，均需提供一个复制 Icon。点击后需触发原生的 "已复制" 全局轻提示 (Toast)。
    - **Trace 详情弹窗防滚动穿透**: 当 Trace 详情弹窗 (`#detailModal`) 开启时，必须为 `html` 和 `body` 元素同时添加 `modal-open` class，以阻断底部列表页的滚动行为。
    - **Trace 过程日志交互 (Timeline)**:
      - 日志默认采用 **时间轴 (Timeline) 视图** 进行结构化展示，包含节点名称、耗时、状态和核心载荷。
      - **左侧节点目录**: 固定侧边栏展示所有日志节点，点击节点名称平滑滚动对应时间轴卡片到视图顶部。
      - **URL 锚点支持**: 支持 `selectedNode={nodeId}` URL 参数，打开详情时自动高亮并滚动到指定节点（如 `selectedNode=node-3` 定位到商品召回节点）。
      - **详细数据折叠**: 时间轴卡片内的长文本或深度嵌套 JSON 默认截断折叠，提供"展开详细 JSON"按钮。
      - **引用卡片化与二级侧滑**: 知识库召回节点展示紧凑型引用卡片，点击后从右侧划出 **二级侧滑面板 (Slide-over Panel)** 展示切片详情。
  - `frontend-knowledge-base.html`: Knowledge Base module (List & Management).
  - `frontend-knowledge-base-detail.html`: Knowledge Base Configuration & File Detail.
  - `frontend-proto-trace-timeline.html`: Trace Timeline prototype (early development version).
- `frontend/css/`: Shared UI stylesheets.
  - `ui-refresh.css`: Common UI components and theme variables.
- `docs/`: Design documents and project guidelines.
  - `AGENTS.md`: This file - comprehensive development guidelines.
- `logs/`: Local runtime logs.

> **Note**: Behavior existing in both create/edit views of a module must be implemented and verified in both files in the same change.

## Current Modules & Roadmap
1. **Prompt Management (提示词)**: Completed - covers list, create, edit, message flows, and variables.
2. **Evaluation (评测)**: Partially completed - eval tasks list and management.
3. **OCR Evaluation (OCR 评测)**: New module - OCR quality assessment workbench with comparison capabilities.
4. **Trace Tracking (Trace 追踪)**: Completed - full lifecycle trace list with advanced filtering, horizontal scroll table, three-button action group, and right-sliding detail drawer with Timeline Process Log and KB Slice Panel.
5. **Knowledge Base (知识库)**: Completed - list, management, detail configuration with file explorer and chunk viewer.
6. **App Config (应用配置)**: Completed - resource configuration with split-pane layout, online/offline prompt manager integration.
7. **Tools (工具管理)**: New module - Tools CRUD, parameter schema definition, API configuration, tool testing, and call logging.
8. **Future Expansions**: To be iteratively designed and developed (e.g., Models, Agents, etc.).

## Build, Test, and Development Commands
No build step is required. Run a local server from the `frontend` or root directory:

```bash
cd "/Users/wisewong/Desktop/手回/11-AI Infra"
python3 -m http.server 5500
```

Open in browser:
- `http://localhost:5500/frontend/pages/frontend-slides-guide.html` - Prompt Management
- `http://localhost:5500/frontend/pages/frontend-eval-tasks.html` - Evaluation Tasks
- `http://localhost:5500/frontend/pages/frontend-ocr-eval.html` - OCR Evaluation Workbench
- `http://localhost:5500/frontend/pages/frontend-knowledge-base.html` - Knowledge Base
- `http://localhost:5500/frontend/pages/frontend-trace.html` - Trace Tracking
- `http://localhost:5500/frontend/pages/frontend-app-management.html` - App Management
- `http://localhost:5500/frontend/pages/frontend-tools.html` - Tools Management
- `http://localhost:5500/frontend/pages/frontend-tools-log.html` - Tools Call Logs
- `http://localhost:5500/prd/PRD-应用配置与Trace详情交互优化.html` - PRD with embedded prototypes
- `http://localhost:5500/prd/PRD-AI平台功能优化.html` - AI Platform Optimization PRD

## Developer Guidelines

### Coding Style
- Use 2-space indentation.
- Keep naming semantic: `camelCase` for variables/functions, `UPPER_SNAKE_CASE` for constants.
- Keep UI copy in **Chinese** unless requirement says otherwise.
- Prefer minimal, local patches but actively extract common CSS to `frontend/css/ui-refresh.css` to build an integrated AI Infra UI theme.

### Product Interaction Invariants (Prompt Management)
- Message area defaults to `System Prompt` (Purple theme) + `User Prompt` (Blue theme); both are mandatory and cannot be deleted.
- **Interactions**:
  - **Double-click** any prompt textarea to open a full-screen zoom overlay for focused editing/viewing.
  - **Automatic Extraction**: Variables are automatically extracted from the prompt text using `{{variable_name}}` syntax.
- **Assistant Role**: Add button text is `添加Assistant Prompt` (Green theme); click adds directly; multiple Assistant blocks are supported and can be deleted.
- `+变量` opens a 3-option popover (`text/image/file`) aligned to the trigger's right edge.
- Variable name supports two-way sync (left placeholder <-> right variable list).
- Variable type switching updates input control (`text` textarea; `image/file` upload).
- Each variable row has delete action: remove `{{var}}` from prompt content and clear bound value/file.
- Prompt description uses max length only (`maxlength=200`), no remaining-char UI.

### Product Interaction Invariants (App Config)
- Editing resources (like Prompts) inside the App Config page utilizes a **Split-Pane View** (`.pane-left` and `.pane-right`), implemented either as a full-screen overlay or a dedicated page.
- The Split-Pane layout must maintain:
  - Left pane: Configuration fields (Resource Name, Prompt Selection, Model & Parameters).
  - Right pane: Prompt content preview blocks.
- **Form Layout**: All form components (selectors, sliders, inputs) must use a **labels-above-inputs** (top-down) structure and be **left-aligned**.
- **Header Actions**: "Save" and "Cancel" buttons are located in the **top-right header** area.
- **Dismissal**: The view can be dismissed via the "Cancel" button or by pressing the **Esc** key.
- **Temperature Setting**: The default model temperature is **0.3** (optimized for consistency over creativity).
- **Go to Management**: A "去管理" link must be provided next to the prompt selector to jump to the full Prompt Management edit page.

### Product Interaction Invariants (App Config: Prompt Manager Online/Offline Demo)
- Online/offline state must be controlled by a **visible in-page toggle** (radio), not URL params.
- Toggle state is shared across `frontend-app-config.html` and `frontend-app-config-edit.html` via `localStorage` key: `prompt_manager_online_demo`.
- `已上线`:
  - Show prompt selector and load prompt config from storage (`prompt_rows_demo`).
  - Resource name defaults to selected prompt name but remains editable.
  - Model selection, model parameters, and all prompt content blocks are **read-only/disabled** (content is pulled from the Prompt Manager).
  - Assistant role content is supported and rendered as an extra preview block when present in the selected prompt.
- `未上线`:
  - Hide prompt selector block.
  - Model and parameters are editable.
  - **System Prompt** and **User Prompt** textareas are **editable**.
  - **Assistant Prompt** remains **preview-only** (read-only) even in offline mode.
- Save action must always show visible success feedback:
  - Prefer top toast (`配置保存成功`).
  - Keep a hard fallback (`alert`) if toast function is unavailable.
- Prompt preview textareas keep multiline behavior with drag-resize and support **double-click zoom overlay** for immersive viewing.

### Product Interaction Invariants (Trace Tracking)
- **Filter Layout**: Uses a **4-column grid** for filter items.
- **Table Structure**:
  - Supports **horizontal scrolling** with a minimum width of `2200px` to accommodate extensive data columns.
  - **Column Order**: `TraceId` -> `Project` -> `App` -> `Input` -> `Output` -> `User Feedback` -> `Problem Type` -> `Problem Feedback` -> `QC Evaluation` -> `QC Notes` -> `QC Tags` -> `Last Operator` -> `Trace Creation Time` -> `Actions`.
  - **Left Alignment**: The `Input` and `Output` columns (both headers and cell content) must be strictly **left-aligned** for readability. Content cells must also be stripped of leading whitespace caused by HTML formatting.
  - **Fixed Column**: The `Actions` column must be **sticky-right** for accessibility during horizontal scrolling.
- **Data Content**:
  - `Input` and `Output` columns use monospace fonts and `white-space: pre-wrap` for structured/JSON data.
  - Linked data: Certain IDs or URLs (like OCR file paths) should be rendered as clickable links.
- **Actions (Table Rows)**:
  - **Operation Buttons**: Replaces simple links with a group of three primary buttons:
    - **运行结果 (Run Result)**: Opens the detail modal directly to the Run Result tab.
    - **过程日志 (Process Log)**: Opens the detail modal directly to the Process Log tab.
    - **反馈质检 (QC Audit)**: Opens the detail modal directly to the Feedback QA tab.
  - **Cell Click Redirection**: 
    - Clicking the `Input` or `Output` cells opens the **Run Result** tab.
    - Clicking the `TraceId` or `Project/App` cells opens the **Process Log** tab.
    - Clicking any **QC Evaluation, Notes, or Tags** cells opens the **Feedback QA** tab.
  - **批量标注**: Supports selecting multiple rows via checkboxes for bulk QC operations.
- **Pagination**: Includes total count, page size toggle (10/20/50), and page jump input.
- **Trace Detail Modal (Drawer)**:
  - **Trigger**: Click "查看详情" in the table Actions column.
  - **Layout**: Right-side drawer (slides from right to left, width 80%).
  - **Scroll Lock**: Opening the modal MUST disable background scrolling by adding the `.modal-open` class to both `<html>` and `<body>` (applying `overflow: hidden; height: 100%`).
  - **Tabbed Interface**:
    - **运行结果 (Run Result)**: Shows Input and Output code blocks. Input is a single block; Output supports format selection (e.g., "混合格式").
    - **过程日志 (Process Log)**: Chronological timeline of events with structured node navigation.
      - **节点目录 (Node Navigation)**: Fixed left sidebar (`#timelineNav`) listing all log nodes with status indicators (green/red/gray dots). Clicking a node name smoothly scrolls the corresponding timeline card to the **top** of the stream view (`#timelineStream`).
      - **URL Deep Linking**: Supports URL parameters for direct navigation:
        - `openDetail=1` - Auto-opens the detail modal on page load.
        - `tab=processLog` - Activates the specified tab (options: `runResult`, `processLog`, `qualityAudit`).
        - `traceId={id}` - Opens detail for specific trace.
        - `selectedNode={nodeId}` - Auto-scrolls and highlights the specified node (e.g., `selectedNode=node-3` for "商品召回").
      - **Timeline Data**: Includes NLU reasoning and JSON payloads using monospace fonts.
      - **Content Formatting**: Auto-detects and formats JSON/Markdown/HTML content with syntax highlighting.
    - **反馈质检 (Feedback QA)**: Dynamic table for annotating and reviewing trace quality.
  - **Alignment**: Both Input/Output and Log content must be strictly **left-aligned** for readability.
- **KB Slice Secondary Panel (切片详情)**:
  - **Trigger**: Clicked from "引用卡片" within the Process Log.
  - **Layout**: Premium slide-over panel (width 800px) with a backdrop blur overlay.
  - **Slice Navigation**: Includes an internal **sidebar** listing all slices retrieved in that node. Users can switch between slices without closing the panel.
  - **Header Actions**: "复制当前" (Copy Current) and "复制全部切片" (Copy All Slices) buttons are located in the top-right header, adjacent to the close button.
  - **Dismissal**: Closes via the "X" button, pressing **Esc**, or clicking the blurred overlay.
- **Copy-to-Clipboard**:
  - **Table TraceId**: Clickable cell that copies the full 32-character TraceId (displays abbreviated form `abcd****` by default).
  - **Modal Integration**: Copy icons are provided for the full TraceId in the header, Input/Output section headers, and the primary Log content box.
  - **Feedback**: A temporary toast notification ("已复制") should appear at the top center after a successful copy.

### Product Interaction Invariants (Knowledge Base)
- **Filter Layout**: Uses a standard card-based grid for "知识库名称" (Knowledge Base Name) and "负责人" (Owner) filters.
- **Header Actions**: "重置" (Reset), "查询" (Search), and "新建知识库" (Create) buttons are grouped and right-aligned within the filter card.
- **Table Columns**: `Id` -> `名称` (Name) -> `描述` (Description) -> `创建时间` (Creation Time) -> `负责人` (Owner) -> `操作` (Actions).
- **Operations**:
  - **查看 (View)**: Navigates to the detailed management view of the specific knowledge base.
  - **删除 (Delete)**: Triggers a confirmation for permanent removal of the knowledge base.
- **Pagination**: Implements the platform-standard pagination footer with total item count, page size selector, numeric page navigation, and a jump-to-page input.

### Product Interaction Invariants (Knowledge Base: Detail & Configuration)
- **Layout**: Split-view layout with a fixed header for KB meta-information.
- **Header Info**:
  - Displays Knowledge Base Name (editable), Description, and Owner.
  - **Quick Actions**: "召回测试" (Recall Test) and "分段配置" (Chunk Configuration) are the primary configuration entry points.
- **File Explorer (Left Pane)**:
  - Supports nested folder structures and file-type icons.
  - **Status Indicators**: Files with processing errors must display a red warning icon.
  - **Actions**: Bottom sticky bar for "创建文件夹" (Create Folder), "上传文件" (Upload File), and "批量操作" (Batch Actions).
- **Chunk Viewer (Right Pane)**:
  - **Search**: Dedicated "搜索切片内容" (Search Chunks) input with refresh functionality.
  - **Chunk Cards**: Individual data segments rendered in bordered cards with monospace-friendly text formatting.
  - **Pagination**: Standard footer synced with total chunk count (`Showing X total`).

### Product Interaction Invariants (OCR Evaluation)
- **Layout**: Three-column layout with file list/preview, OCR result viewer, and comparison panel.
- **Header Actions**:
  - **Model Selection**: Dropdown to select OCR model (DeepSeek-OCR2, Paddle-OCR, GLM-OCR).
  - **Run Button**: "开始解析" button triggers OCR processing on selected files.
  - **Upload Options**: Toggle between single file upload ("上传") and batch upload ("批量").
- **File List (Left Column)**:
  - Displays uploaded files with preview thumbnails.
  - Active file selection highlights with blue border.
  - Shows file status indicators (pending, processing, completed, error).
- **OCR Result Viewer (Middle Column)**:
  - Displays OCR extracted text with syntax highlighting.
  - Supports text selection and copy functionality.
  - Shows confidence scores for extracted segments.
- **Comparison Panel (Right Column)**:
  - Side-by-side comparison of different OCR model results.
  - Highlighting differences between model outputs.
  - Quality metrics and accuracy scores.
- **Actions**:
  - **Export**: Export OCR results in various formats (TXT, JSON, CSV).
  - **Quality Review**: Mark OCR results as accurate/needs review/incorrect.
  - **Batch Operations**: Apply actions to multiple files simultaneously.

## Testing & Quality Assurance
Manual regression is required:
1. Validate cross-page parity (e.g., create/edit for prompts).
2. Verify all interactive components (popovers, uploads, dynamic lists) function correctly.
3. Confirm no console errors in DevTools.
4. Test URL deep linking parameters (openDetail, tab, traceId, selectedNode) work correctly.

## Commit & PR Guidelines
- Commit format: `type(scope): summary` (e.g., `feat(eval): add evaluation dataset table`).
- Include linked PRD section and screenshots/GIFs for UI changes in PRs.
