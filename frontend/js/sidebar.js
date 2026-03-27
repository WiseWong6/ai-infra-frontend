(function () {
  const currentPath = window.location.pathname;
  const isPage = (paths) => paths.split(',').some(p => currentPath.includes(p));

  // Get initial state from localStorage
  const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';

  const html = `
<aside id="sidebar-main" class="sidebar sidebar-injected ${isCollapsed ? 'collapsed' : ''}" style="width: ${isCollapsed ? '72px' : '220px'}; background: #ffffff; border-right: 1px solid #e2e8f0; padding: 0; flex-shrink: 0; display: flex; flex-direction: column; height: 100vh; overflow-y: auto; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; z-index: 1000;">
  <style>
    /* Sidebar internal styles */
    .sidebar-component .menu-group { margin-bottom: 20px; }
    .sidebar-component .menu-title { margin: 0 0 8px; padding: 0 22px; font-size: 12px; color: #64748b; font-weight: 600; display: block; line-height: 1.5; white-space: nowrap; overflow: hidden; transition: all 0.2s; }
    .sidebar-component .menu-item { height: 44px; padding: 0 22px; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; color: #64748b; text-decoration: none; transition: all 0.2s ease; border-radius: 0; position: relative; box-sizing: border-box; white-space: nowrap; overflow: hidden; }
    .sidebar-component .menu-item:hover { background: #fafbfc; color: #0f172a; }
    .sidebar-component .menu-item.active { background: #eff6ff; color: #3b82f6; }
    .sidebar-component .menu-item.active::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: #3b82f6; }
    .sidebar-component .menu-item i, .sidebar-component .menu-item svg { width: 18px; height: 18px; flex-shrink: 0; }
    
    .sidebar-header { padding: 12px 20px; display: flex; align-items: center; justify-content: flex-start; margin-bottom: 10px; }
    .toggle-btn { cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 6px; transition: all 0.2s; background: transparent; border: none; padding: 0; }
    .toggle-btn:hover { background: #f1f5f9; color: #0f172a; }

    /* Collapsed state styles */
    .sidebar.collapsed { width: 72px !important; }
    .sidebar.collapsed .menu-title { visibility: hidden; opacity: 0; height: 0; margin: 0; }
    .sidebar.collapsed .menu-item { padding: 0 !important; justify-content: center; gap: 0; }
    .sidebar.collapsed .menu-item .menu-text { display: none; }
    .sidebar.collapsed .sidebar-header { justify-content: center; }
    .sidebar.collapsed .menu-item.active::before { width: 4px; }
  </style>

  <div class="sidebar-header">
    <button id="sidebar-toggle" class="toggle-btn" title="收起/展开菜单">
      <i data-lucide="menu"></i>
    </button>
  </div>

  <div class="sidebar-component" style="display:flex; flex-direction: column; height: 100%;">
      <div class="menu-group">
        <h2 class="menu-title">应用</h2>
        <a class="menu-item ${isPage('frontend-app-management.html,frontend-app-config.html,frontend-app-config-edit.html,frontend-app-config-node-binding.html') ? 'active' : ''}" href="./frontend-app-management.html">
          <i data-lucide="layout-grid"></i>
          <span class="menu-text">应用管理</span>
        </a>
      </div>

      <div class="menu-group">
        <h2 class="menu-title">资源</h2>
        <a class="menu-item ${isPage('frontend-slides-guide.html,frontend-slides-guide-edit.html,frontend-slides-guide-create.html') ? 'active' : ''}" href="./frontend-slides-guide.html">
          <i data-lucide="file-text"></i>
          <span class="menu-text">提示词</span>
        </a>
        <a class="menu-item ${isPage('frontend-knowledge-base.html,frontend-knowledge-base-detail.html') ? 'active' : ''}" href="./frontend-knowledge-base.html">
          <i data-lucide="database"></i>
          <span class="menu-text">知识库</span>
        </a>
        
        <!-- Tools with sub-menu -->
        <div style="position: relative;">
          <a class="menu-item ${isPage('frontend-ocr-eval.html') ? 'active' : ''}" href="./frontend-ocr-eval.html">
            <i data-lucide="wrench"></i>
            <span class="menu-text">工具</span>
          </a>
          <div style="display: flex; flex-direction: column;">
            <a class="menu-item ${isPage('frontend-ocr-eval.html') ? 'active' : ''}" href="./frontend-ocr-eval.html" style="padding-left: 44px; font-size: 13px; height: 36px; padding-top: 5px; padding-bottom: 5px;">
              <i data-lucide="scan-text" style="width: 16px; height: 16px;"></i>
              <span class="menu-text">OCR 评测</span>
            </a>
          </div>
        </div>
      </div>

      <div class="menu-group">
        <h2 class="menu-title">评测</h2>
        <a class="menu-item ${isPage('frontend-eval-tasks.html') ? 'active' : ''}" href="./frontend-eval-tasks.html">
          <i data-lucide="layout-grid"></i>
          <span class="menu-text">评测任务</span>
        </a>
        <a class="menu-item" href="#">
          <i data-lucide="bar-chart-3"></i>
          <span class="menu-text">评测指标</span>
        </a>
      </div>

      <div class="menu-group">
        <h2 class="menu-title">追踪</h2>
        <a class="menu-item ${isPage('frontend-trace.html') ? 'active' : ''}" href="./frontend-trace.html">
          <i data-lucide="activity"></i>
          <span class="menu-text">Trace追踪</span>
        </a>
        <a class="menu-item" href="#">
          <i data-lucide="bar-chart-3"></i>
          <span class="menu-text">应用指标</span>
        </a>
      </div>

      <div class="menu-group">
        <h2 class="menu-title">基础设施</h2>
        <a class="menu-item ${isPage('frontend-mcp-center.html') ? 'active' : ''}" href="./frontend-mcp-center.html">
          <i data-lucide="plug-zap"></i>
          <span class="menu-text">MCP中心</span>
        </a>
        <a class="menu-item ${isPage('frontend-models.html') ? 'active' : ''}" href="./frontend-models.html">
          <i data-lucide="cpu"></i>
          <span class="menu-text">模型管理</span>
        </a>
        <a class="menu-item ${isPage('frontend-model-test.html') ? 'active' : ''}" href="./frontend-model-test.html">
          <i data-lucide="flask-conical"></i>
          <span class="menu-text">模型测试</span>
        </a>
      </div>

      <div class="menu-group">
        <h2 class="menu-title">设置</h2>
        <a class="menu-item" href="#">
          <i data-lucide="tag"></i>
          <span class="menu-text">标签管理</span>
        </a>
      </div>
  </div>
</aside>
    `;

  document.write(html);

  // Sidebar Toggle Logic
  function setupSidebarToggle() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar-main');

    if (toggleBtn && sidebar) {
      // Remove any existing listeners to avoid multiple attachments if script re-runs
      const newToggleBtn = toggleBtn.cloneNode(true);
      toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);

      newToggleBtn.addEventListener('click', () => {
        const isNowCollapsed = sidebar.classList.toggle('collapsed');
        sidebar.style.width = isNowCollapsed ? '72px' : '220px';
        localStorage.setItem('sidebar-collapsed', isNowCollapsed);

        // Trigger a window resize event to let other components know the layout shifted
        window.dispatchEvent(new Event('resize'));
      });
    }

    // Always try to create icons for the sidebar
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  // Try multiple times to ensure it initializes after DOM is ready and scripts loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSidebarToggle);
  } else {
    setupSidebarToggle();
  }

  // Backup initialization for dynamic content
  setTimeout(setupSidebarToggle, 100);
})();
