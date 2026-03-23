target_main = """        <main class="main">
            <div class="page-title app-config">应用配置</div>

            <!-- Detail Card -->
            <div class="detail-card">
                <div class="detail-left">
                    <div class="detail-title-row">
                        <div class="detail-title">投保助手 <i class="fa-solid fa-pen"></i></div>
                        <div class="detail-id">项目ID：2 <i class="fa-regular fa-copy"></i></div>
                        <div class="detail-id">应用ID：3 <i class="fa-regular fa-copy"></i></div>
                    </div>
                    <div class="detail-info-row">
                        <div class="detail-info-item"><span>企业：</span>创信</div>
                        <div class="detail-info-item"><span>项目：</span>咔嚓保-投保助手</div>
                        <div class="detail-info-item"><span>负责人：</span>wisewong, jerry, martin, able, lurk, kant</div>
                    </div>
                </div>
                <div class="detail-actions">
                    <button class="btn btn-secondary">数据同步</button>
                    <button class="btn btn-secondary">版本历史</button>
                    <button class="btn">版本发布</button>
                </div>
            </div>

            <!-- Table Section -->
            <div class="table-section">
                <div class="table-header">
                    <div class="table-title">
                        资源列表 <span class="count">(总条数：6)</span>
                        <div class="table-desc">测试环境仅供体验，不具备同步线上的能力，请在线上创建资源后同步至alpha.</div>
                    </div>
                    <button class="btn">添加资源 <i class="fa-solid fa-chevron-down" style="font-size: 10px;"></i></button>
                </div>

                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 80px;">ID</th>
                                <th>名称</th>
                                <th>类型</th>
                                <th>最近更新角色</th>
                                <th>最近更新时间</th>
                                <th style="width: 120px;">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>103</td>
                                <td>产品检索</td>
                                <td>提示词</td>
                                <td>wisewong</td>
                                <td>2026-02-27 16:34:33</td>
                                <td>
                                    <div class="action-links">
                                        <a class="edit-btn">编辑</a>
                                        <a>删除</a>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>86</td>
                                <td>意图分流（有产品检索）</td>
                                <td>提示词</td>
                                <td>wisewong</td>
                                <td>2026-02-27 16:32:37</td>
                                <td>
                                    <div class="action-links">
                                        <a class="edit-btn">编辑</a>
                                        <a>删除</a>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>54</td>
                                <td>投保报错</td>
                                <td>提示词</td>
                                <td>martin</td>
                                <td>2026-02-11 10:22:11</td>
                                <td>
                                    <div class="action-links">
                                        <a class="edit-btn">编辑</a>
                                        <a>删除</a>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>52</td>
                                <td>寒暄兜底</td>
                                <td>提示词</td>
                                <td>martin</td>
                                <td>2026-02-27 10:45:15</td>
                                <td>
                                    <div class="action-links">
                                        <a class="edit-btn">编辑</a>
                                        <a>删除</a>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>50</td>
                                <td>条款咨询</td>
                                <td>提示词</td>
                                <td>wisewong</td>
                                <td>2026-02-27 16:34:20</td>
                                <td>
                                    <div class="action-links">
                                        <a class="edit-btn">编辑</a>
                                        <a>删除</a>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>46</td>
                                <td>意图分流（无产品检索）</td>
                                <td>提示词</td>
                                <td>wisewong</td>
                                <td>2026-02-09 17:38:39</td>
                                <td>
                                    <div class="action-links">
                                        <a class="edit-btn">编辑</a>
                                        <a>删除</a>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="pagination">
                    <span>共 6 条</span>
                    <select>
                        <option>10条/页</option>
                    </select>
                    <div class="page-btn"><i class="fa-solid fa-chevron-left" style="font-size:10px;"></i></div>
                    <div class="page-btn active">1</div>
                    <div class="page-btn"><i class="fa-solid fa-chevron-right" style="font-size:10px;"></i></div>
                    <span>前往</span>
                    <input type="text" value="1" style="width: 40px; text-align: center;" />
                    <span>页</span>
                </div>
            </div>

        </main>"""

overlay_css = """
        .split-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(255, 255, 255, 0);
            z-index: 200;
            display: flex;
            flex-direction: column;
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateX(20px);
        }

        .split-overlay.show {
            opacity: 1;
            pointer-events: auto;
            transform: translateX(0);
        }

        .split-overlay-header {
            height: 60px;
            padding: 0 var(--spacing-2xl);
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #fff;
            border-bottom: 1px solid var(--line-strong);
            flex-shrink: 0;
        }

        .split-overlay-title {
            font-size: 16px;
            font-weight: 600;
        }

        .split-overlay-close {
            cursor: pointer;
            color: var(--muted);
            font-size: 16px;
            padding: 8px;
        }
        
        .split-overlay-close:hover {
            color: var(--text);
        }
"""

with open('frontend-app-config.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Insert original list table <main> back.
# We will find where `        <main class="main">` currently is, which is the split workspace.
import re
new_text = text.replace('        <main class="main">\n            <!-- 顶部面包屑 -->\n            <div class="top-nav">', '[[[SPLIT_MARKER]]]')

# Since new_text has the marker:
components = new_text.split('[[[SPLIT_MARKER]]]')

if len(components) == 2:
    # 2. Insert CSS
    # Add CSS for original app-config page that were lost
    lost_css = """
        .main {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: var(--bg);
            padding: var(--spacing-2xl);
            height: 100vh;
            overflow-y: auto;
        }
        
        .page-title.app-config {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: var(--spacing-xl);
        }

        /* Detail Card */
        .detail-card {
            background: #fff;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: var(--spacing-xl);
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border: 1px solid var(--line-strong);
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .detail-title-row {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
        }

        .detail-title {
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .detail-title i {
            color: var(--blue);
            font-size: 14px;
            cursor: pointer;
        }

        .detail-id {
            font-size: 12px;
            color: var(--muted);
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .detail-id i {
            cursor: pointer;
        }

        .detail-info-row {
            display: flex;
            flex-wrap: wrap;
            gap: 24px;
            font-size: 13px;
        }

        .detail-info-item {
            color: var(--text);
        }

        .detail-info-item span {
            color: var(--muted);
        }

        .detail-actions {
            display: flex;
            gap: 12px;
        }

        .btn {
            height: 32px;
            padding: 0 16px;
            background: var(--blue);
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .btn:hover {
            background: var(--blue-dark);
        }

        .btn-secondary {
            background: white;
            color: var(--text);
            border: 1px solid var(--line-strong);
        }

        .btn-secondary:hover {
            background: var(--hover-bg);
            border-color: var(--muted);
        }

        /* Table Section */
        .table-section {
            background: #fff;
            border-radius: 8px;
            border: 1px solid var(--line-strong);
            padding: 20px 24px;
            flex: 1;
            display: flex;
            flex-direction: column;
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .table-title {
            font-size: 16px;
            font-weight: 600;
        }

        .table-title .count {
            font-size: 13px;
            color: var(--muted);
            font-weight: normal;
        }

        .table-desc {
            font-size: 12px;
            color: var(--muted);
            margin-top: 4px;
            font-weight: normal;
        }

        .table-wrap {
            flex: 1;
            overflow-y: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 13px;
        }

        th {
            padding: 12px 16px;
            background: var(--head);
            color: var(--muted);
            font-weight: 500;
            border-bottom: 1px solid var(--line-strong);
        }

        td {
            padding: 16px;
            border-bottom: 1px solid var(--line);
            color: var(--text);
        }

        tbody tr:hover {
            background: var(--hover-bg);
        }

        .action-links {
            display: flex;
            gap: 12px;
        }

        .action-links a {
            color: var(--blue);
            cursor: pointer;
            text-decoration: none;
        }

        .action-links a:hover {
            text-decoration: underline;
        }
"""
    
    css_insert_idx = components[0].rfind('</style>')
    modified_top = components[0][:css_insert_idx] + lost_css + overlay_css + "        " + components[0][css_insert_idx:]
    
    # 3. Insert target_main, then the overlay wrapper
    split_view_content = """        <!-- Split Pane Overlay -->
        <div class="split-overlay" id="splitOverlay">
            <div class="split-overlay-header">
                <div class="split-overlay-title">编辑资源：产品检索</div>
                <div class="split-overlay-close" id="closeSplitOverlay"><i class="fa-solid fa-xmark"></i></div>
            </div>
            <!-- 分栏工作区 -->
            <div class="workspace" style="background:var(--bg);">""" + components[1]
            
    split_view_content = split_view_content.replace('<main class="main">', '') # we removed it via marker mostly, but ensure.
    
    # Change "return / cancel" logic
    split_view_content = split_view_content.replace('onclick="window.history.back()"', 'id="cancelBtn"')
    
    final_text = modified_top + target_main + "\n" + split_view_content + "\n" + '</div>'
    
    # Add JS logic for the .edit-btn
    js_logic = """
        const overlay = document.getElementById('splitOverlay');
        const editBtns = document.querySelectorAll('.edit-btn');
        const closeBtn = document.getElementById('closeSplitOverlay');
        const cancelBtn = document.getElementById('cancelBtn');

        editBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                overlay.classList.add('show');
            });
        });

        const closeOverlay = () => {
            overlay.classList.remove('show');
        };

        if(closeBtn) closeBtn.addEventListener('click', closeOverlay);
        if(cancelBtn) cancelBtn.addEventListener('click', closeOverlay);

        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            // Remove old listeners
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
            newSaveBtn.addEventListener('click', () => {
                showToast("配置保存成功");
                setTimeout(closeOverlay, 1000);
            });
        }
    """
    final_text = final_text.replace('</script>', js_logic + '\n    </script>')
    
    # We must patch an issue from `components[1]`: the `</main>` and `</div>` from the end of the file.
    # Replace `<div class="split-overlay-close"`...
    final_text = final_text.replace('</main>\n    </div>', '</div>\n    </div>')

    with open('frontend-app-config.html', 'w', encoding='utf-8') as f:
        f.write(final_text)

