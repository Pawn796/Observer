document.addEventListener('DOMContentLoaded', function() {
    // 主题切换功能
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    const html = document.documentElement;
    
    // 检测系统主题偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
    
    // 初始化主题
    if (savedTheme === 'dark') {
        html.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
    } else {
        html.classList.remove('dark-theme');
        themeIcon.textContent = '🌙';
    }
    
    // 切换主题
    themeToggle.addEventListener('click', function() {
        html.classList.toggle('dark-theme');
        const isDark = html.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeIcon.textContent = isDark ? '☀️' : '🌙';
    });
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                html.classList.add('dark-theme');
                themeIcon.textContent = '☀️';
            } else {
                html.classList.remove('dark-theme');
                themeIcon.textContent = '🌙';
            }
        }
    });

    // 标签页切换功能
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            const card = this.closest('.account-card');
            
            // 只在当前卡片内切换
            const currentTabButtons = card.querySelectorAll('.tab-btn');
            const currentTabPanes = card.querySelectorAll('.tab-pane');
            
            currentTabButtons.forEach(btn => btn.classList.remove('active'));
            currentTabPanes.forEach(pane => pane.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });

    // 模拟API设置按钮
    const apiSettingsBtn = document.querySelector('.api-settings');
    if (apiSettingsBtn) {
        apiSettingsBtn.addEventListener('click', function() {
            alert('API 设置功能（待实现）');
        });
    }
    
    // 表头拖动排序功能
    function initDraggableHeaders() {
        const tables = document.querySelectorAll('.data-table');
        
        tables.forEach(table => {
            const headers = table.querySelectorAll('thead th');
            let draggedElement = null;
            let draggedIndex = null;
            
            headers.forEach((header, index) => {
                header.setAttribute('draggable', 'true');
                
                header.addEventListener('dragstart', function(e) {
                    // 如果点击的是排序按钮，不触发拖动
                    if (e.target.classList.contains('sort-btn')) {
                        e.preventDefault();
                        return;
                    }
                    
                    draggedElement = this;
                    draggedIndex = index;
                    this.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });
                
                header.addEventListener('dragend', function(e) {
                    this.classList.remove('dragging');
                    headers.forEach(h => h.classList.remove('drag-over'));
                });
                
                header.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    
                    if (this !== draggedElement) {
                        this.classList.add('drag-over');
                    }
                });
                
                header.addEventListener('dragleave', function(e) {
                    this.classList.remove('drag-over');
                });
                
                header.addEventListener('drop', function(e) {
                    e.preventDefault();
                    this.classList.remove('drag-over');
                    
                    if (draggedElement !== this) {
                        const dropIndex = Array.from(headers).indexOf(this);
                        swapColumns(table, draggedIndex, dropIndex);
                    }
                });
            });
        });
    }
    
    function swapColumns(table, fromIndex, toIndex) {
        const headerRow = table.querySelector('thead tr');
        const headers = Array.from(headerRow.children);
        
        // 交换表头
        const fromHeader = headers[fromIndex];
        const toHeader = headers[toIndex];
        
        if (fromIndex < toIndex) {
            headerRow.insertBefore(fromHeader, toHeader.nextSibling);
        } else {
            headerRow.insertBefore(fromHeader, toHeader);
        }
        
        // 交换所有数据行的对应列
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            // 跳过空状态行
            if (row.querySelector('.empty-row')) return;
            
            const cells = Array.from(row.children);
            const fromCell = cells[fromIndex];
            const toCell = cells[toIndex];
            
            if (fromIndex < toIndex) {
                row.insertBefore(fromCell, toCell.nextSibling);
            } else {
                row.insertBefore(fromCell, toCell);
            }
        });
        
        // 重新初始化拖动功能
        initDraggableHeaders();
    }
    
    // 排序功能
    function initTableSort() {
        const sortButtons = document.querySelectorAll('.sort-btn');
        
        sortButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation(); // 防止触发拖动
                
                const th = this.closest('th');
                const table = th.closest('table');
                const tbody = table.querySelector('tbody');
                const columnIndex = Array.from(th.parentNode.children).indexOf(th);
                
                // 获取当前排序状态
                let currentSort = this.getAttribute('data-sort');
                
                // 重置同一表格的其他排序按钮
                table.querySelectorAll('.sort-btn').forEach(btn => {
                    if (btn !== this) {
                        btn.setAttribute('data-sort', 'none');
                        btn.className = 'sort-btn none';
                    }
                });
                
                // 切换排序状态: none -> asc -> desc -> none
                let newSort;
                if (currentSort === 'none') {
                    newSort = 'asc';
                } else if (currentSort === 'asc') {
                    newSort = 'desc';
                } else {
                    newSort = 'none';
                }
                
                this.setAttribute('data-sort', newSort);
                this.className = 'sort-btn ' + newSort;
                
                // 执行排序
                if (newSort !== 'none') {
                    sortTable(tbody, columnIndex, newSort);
                } else {
                    // 恢复原始顺序（可以存储原始顺序或重新加载数据）
                    // 这里暂时不做处理，实际应用中应该恢复到数据加载时的顺序
                }
            });
        });
    }
    
    function sortTable(tbody, columnIndex, direction) {
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        // 过滤掉空状态行
        const dataRows = rows.filter(row => !row.querySelector('.empty-row'));
        
        if (dataRows.length === 0) return;
        
        dataRows.sort((a, b) => {
            const aCell = a.children[columnIndex];
            const bCell = b.children[columnIndex];
            
            if (!aCell || !bCell) return 0;
            
            const aText = aCell.textContent.trim();
            const bText = bCell.textContent.trim();
            
            // 尝试转换为数字进行比较
            const aNum = parseFloat(aText.replace(/[^0-9.-]/g, ''));
            const bNum = parseFloat(bText.replace(/[^0-9.-]/g, ''));
            
            let comparison = 0;
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                // 数字比较
                comparison = aNum - bNum;
            } else {
                // 字符串比较
                comparison = aText.localeCompare(bText, 'zh-CN');
            }
            
            return direction === 'asc' ? comparison : -comparison;
        });
        
        // 重新插入排序后的行
        dataRows.forEach(row => tbody.appendChild(row));
    }
    
    // 初始化拖动功能
    initDraggableHeaders();

    // 初始化排序功能
    initTableSort();

    // 分页功能
    const ITEMS_PER_PAGE = 20;
    const paginationData = new Map(); // 存储每个表格的分页数据

    function initPagination() {
        const tables = document.querySelectorAll('.data-table');
        
        tables.forEach((table, index) => {
            const tableId = `table-${index}`;
            const tbody = table.querySelector('tbody');
            const pagination = table.closest('.table-container').querySelector('.pagination');
            
            if (!tbody || !pagination) return;
            
            // 初始化分页数据
            paginationData.set(tableId, {
                currentPage: 1,
                allRows: [],
                table: table,
                tbody: tbody,
                pagination: pagination
            });
            
            // 绑定分页按钮事件
            const buttons = pagination.querySelectorAll('.pagination-btn');
            buttons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const action = this.getAttribute('data-action');
                    handlePaginationAction(tableId, action);
                });
            });
            
            // 初始化显示
            updatePagination(tableId);
        });
    }
    
    function handlePaginationAction(tableId, action) {
        const data = paginationData.get(tableId);
        if (!data) return;
        
        const totalPages = Math.ceil(data.allRows.length / ITEMS_PER_PAGE) || 1;
        
        switch(action) {
            case 'first':
                data.currentPage = 1;
                break;
            case 'prev':
                data.currentPage = Math.max(1, data.currentPage - 1);
                break;
            case 'next':
                data.currentPage = Math.min(totalPages, data.currentPage + 1);
                break;
            case 'last':
                data.currentPage = totalPages;
                break;
        }
        
        updatePagination(tableId);
    }
    
    function updatePagination(tableId) {
        const data = paginationData.get(tableId);
        if (!data) return;
        
        const tbody = data.tbody;
        const pagination = data.pagination;
        
        // 获取所有非空状态行
        const allRows = Array.from(tbody.querySelectorAll('tr')).filter(row => 
            !row.querySelector('.empty-row')
        );
        
        data.allRows = allRows;
        
        // 如果数据少于等于20条，隐藏分页并显示所有数据
        if (allRows.length <= ITEMS_PER_PAGE) {
            pagination.style.display = 'none';
            allRows.forEach(row => row.style.display = '');
            return;
        }
        
        // 显示分页控件
        pagination.style.display = 'flex';
        
        const totalPages = Math.ceil(allRows.length / ITEMS_PER_PAGE);
        const currentPage = Math.min(data.currentPage, totalPages);
        data.currentPage = currentPage;
        
        // 隐藏所有行
        allRows.forEach(row => row.style.display = 'none');
        
        // 显示当前页的行
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, allRows.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            if (allRows[i]) {
                allRows[i].style.display = '';
            }
        }
        
        // 更新分页信息
        const currentPageSpan = pagination.querySelector('.current-page');
        const totalPagesSpan = pagination.querySelector('.total-pages');
        const buttons = pagination.querySelectorAll('.pagination-btn');
        
        if (currentPageSpan) currentPageSpan.textContent = currentPage;
        if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
        
        // 更新按钮状态
        buttons.forEach(btn => {
            const action = btn.getAttribute('data-action');
            if (action === 'first' || action === 'prev') {
                btn.disabled = currentPage === 1;
            } else if (action === 'next' || action === 'last') {
                btn.disabled = currentPage === totalPages;
            }
        });
    }
    
    // 初始化分页
    initPagination();
    
    // 修改排序函数，排序后重置到第一页
    const originalSortTable = sortTable;
    sortTable = function(tbody, columnIndex, direction) {
        originalSortTable(tbody, columnIndex, direction);
        
        // 找到对应的表格ID并重置到第一页
        const table = tbody.closest('table');
        const tables = document.querySelectorAll('.data-table');
        const tableIndex = Array.from(tables).indexOf(table);
        const tableId = `table-${tableIndex}`;
        
        const data = paginationData.get(tableId);
        if (data) {
            data.currentPage = 1;
            updatePagination(tableId);
        }
    };
});
