document.addEventListener('DOMContentLoaded', function() {
        // 规范浮动盈亏显示：确保为正/负形式并添加样式类
        function normalizeFloatingPnl() {
            // 格式化小的浮动变化文本（例如 +0.000 (0.00%)）
            document.querySelectorAll('.balance-change').forEach(el => {
                const raw = el.textContent.trim();
                const m = raw.match(/([+-]?[0-9,]*\.?[0-9]+)(?:\s*\(?([+-]?[0-9.,%]+)\)?)?/);
                if (!m) return;
                const num = parseFloat(m[1].replace(/,/g, '')) || 0;
                let percent = (m[2] || '').trim();
                if (percent.startsWith('+')) percent = percent.slice(1);

                const absFormatted = Math.abs(num).toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3});
                const sign = num > 0 ? '+' : (num < 0 ? '-' : '+');

                el.textContent = sign + absFormatted + (percent ? (' (' + percent + ')') : '');

                el.classList.remove('positive', 'negative', 'neutral');
                if (num > 0) el.classList.add('positive');
                else if (num < 0) el.classList.add('negative');
                else el.classList.add('neutral');
            });

            // 同时格式化主面板上显示的“浮动盈亏”数值（通常在 label 包含“浮动盈亏”的 .balance-item 中）
            document.querySelectorAll('.balance-item').forEach(item => {
                const label = item.querySelector('label');
                const valueEl = item.querySelector('.balance-value');
                if (!label || !valueEl) return;
                if (!/浮动盈亏/.test(label.textContent)) return;

                const raw = valueEl.textContent.trim();
                const m = raw.match(/([+-]?[0-9,]*\.?[0-9]+)/);
                if (!m) return;
                const num = parseFloat(m[1].replace(/,/g, '')) || 0;
                const absFormatted = Math.abs(num).toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3});
                const sign = num > 0 ? '+' : (num < 0 ? '-' : '+');

                valueEl.textContent = sign + absFormatted;

                // 复制类名到父元素以便样式控制（或直接给 valueEl 加类）
                valueEl.classList.remove('positive', 'negative', 'neutral');
                if (num > 0) valueEl.classList.add('positive');
                else if (num < 0) valueEl.classList.add('negative');
                else valueEl.classList.add('neutral');
            });
        }
        normalizeFloatingPnl();

        // 标记止盈/止损是否有实际数值并添加类以便上色
        function markTpSlValues() {
            document.querySelectorAll('.tp, .sl').forEach(el => {
                const txt = (el.textContent || '').trim();
                if (!txt || txt === '--' || txt === '-') {
                    el.classList.remove('has-value');
                } else {
                    el.classList.add('has-value');
                }
            });
        }
        markTpSlValues();

        // 给历史表格中的收益/收益率/已实现收益/已实现收益率列上色（正绿、负红）
        function markHistoryMetricsColors() {
            // helper to parse number from cell text
            function parseNumberFromText(txt) {
                if (!txt) return NaN;
                const cleaned = txt.replace(/[,\s]/g, '').replace('%', '');
                const num = parseFloat(cleaned.replace(/[^0-9.-]/g, ''));
                return isNaN(num) ? NaN : num;
            }

            // history-order panes: handle 收益 and 收益率
            document.querySelectorAll('[id^="history-order"]').forEach(pane => {
                pane.querySelectorAll('.data-table').forEach(table => {
                    const headers = Array.from(table.querySelectorAll('thead th'));
                    const thTexts = headers.map(h => (h.textContent || '').trim());

                    const profitIdx = thTexts.findIndex(t => t.includes('收益') && !t.includes('收益率'));
                    const rateIdx = thTexts.findIndex(t => t.includes('收益率'));

                    table.querySelectorAll('tbody tr').forEach(row => {
                        if (row.querySelector('.empty-row')) return;
                        const cells = Array.from(row.children);

                        if (profitIdx !== -1) {
                            const cell = cells[profitIdx];
                            if (cell) {
                                const num = parseNumberFromText((cell.textContent || '').trim());
                                cell.classList.remove('history-profit-positive', 'history-profit-negative');
                                if (!isNaN(num)) {
                                    if (num > 0) cell.classList.add('history-profit-positive');
                                    else if (num < 0) cell.classList.add('history-profit-negative');
                                }
                            }
                        }

                        if (rateIdx !== -1) {
                            const cell = cells[rateIdx];
                            if (cell) {
                                const num = parseNumberFromText((cell.textContent || '').trim());
                                cell.classList.remove('history-rate-positive', 'history-rate-negative');
                                if (!isNaN(num)) {
                                    if (num > 0) cell.classList.add('history-rate-positive');
                                    else if (num < 0) cell.classList.add('history-rate-negative');
                                }
                            }
                        }
                    });
                });
            });

            // history-holding panes: handle 已实现收益 and 已实现收益率
            document.querySelectorAll('[id^="history-holding"]').forEach(pane => {
                pane.querySelectorAll('.data-table').forEach(table => {
                    const headers = Array.from(table.querySelectorAll('thead th'));
                    const thTexts = headers.map(h => (h.textContent || '').trim());

                    const realizedIdx = thTexts.findIndex(t => t.includes('已实现收益'));
                    const realizedRateIdx = thTexts.findIndex(t => t.includes('已实现收益率'));

                    table.querySelectorAll('tbody tr').forEach(row => {
                        if (row.querySelector('.empty-row')) return;
                        const cells = Array.from(row.children);

                        if (realizedIdx !== -1) {
                            const cell = cells[realizedIdx];
                            if (cell) {
                                const num = parseNumberFromText((cell.textContent || '').trim());
                                cell.classList.remove('realized-positive', 'realized-negative');
                                if (!isNaN(num)) {
                                    if (num > 0) cell.classList.add('realized-positive');
                                    else if (num < 0) cell.classList.add('realized-negative');
                                }
                            }
                        }

                        if (realizedRateIdx !== -1) {
                            const cell = cells[realizedRateIdx];
                            if (cell) {
                                const num = parseNumberFromText((cell.textContent || '').trim());
                                cell.classList.remove('realized-positive', 'realized-negative');
                                if (!isNaN(num)) {
                                    if (num > 0) cell.classList.add('realized-positive');
                                    else if (num < 0) cell.classList.add('realized-negative');
                                }
                            }
                        }
                    });
                });
            });
        }
        markHistoryMetricsColors();

        // 迷你资产走势图悬浮显示（支持多个账户卡片）
        document.querySelectorAll('.account-balance-label').forEach(function(label, idx) {
            const tooltip = label.querySelector('.mini-chart-tooltip');
            const canvas = tooltip ? tooltip.querySelector('canvas') : null;
            if (!tooltip || !canvas) return;
            // 生成示例数据：支持 7 天和 30 天
            const baseValues = [482018, 125450, 50200];
            function generateSeries(center, len) {
                const arr = [];
                for (let i = 0; i < len; i++) {
                    // 简单生成波动数据以便演示
                    const noise = Math.sin(i / 3) * center * 0.002 + (Math.cos(i / 5) * center * 0.001);
                    arr.push(Math.round((center + noise) * 100) / 100);
                }
                return arr;
            }
            const rangesData = {
                '7': generateSeries(baseValues[idx] || baseValues[0], 7),
                '30': generateSeries(baseValues[idx] || baseValues[0], 30)
            };

            function getRecentDates(days) {
                const arr = [];
                const now = new Date();
                for (let i = days - 1; i >= 0; i--) {
                    const d = new Date(now);
                    d.setDate(now.getDate() - i);
                    arr.push((d.getMonth() + 1) + '/' + d.getDate());
                }
                return arr;
            }

            let currentRange = '7';
            let currentData = rangesData[currentRange];

            const hoverValueEl = tooltip.querySelector('.chart-hover-value');

            function drawMiniChart(data, hoverIdx = null) {
                // resolve accent color from CSS variable for consistent theme
                const accentRaw = getComputedStyle(document.documentElement).getPropertyValue('--accent-color') || '#ff9800';
                const accent = accentRaw.trim() || '#ff9800';
                function hexToRgba(hex, a) {
                    const h = hex.replace('#','');
                    const bigint = parseInt(h, 16);
                    const r = (bigint >> 16) & 255;
                    const g = (bigint >> 8) & 255;
                    const b = bigint & 255;
                    return `rgba(${r},${g},${b},${a})`;
                }
                const ctx = canvas.getContext('2d');
                // responsive canvas: resize to container using devicePixelRatio
                const dpr = window.devicePixelRatio || 1;
                let cssW, cssH;
                // if frozen, use cached values to avoid recalculating sizes during interaction
                if (canvas.dataset.frozen === 'true' && canvas.dataset.cssW && canvas.dataset.cssH) {
                    cssW = parseFloat(canvas.dataset.cssW);
                    cssH = parseFloat(canvas.dataset.cssH);
                } else {
                    const wrap = canvas.parentElement;
                    // use bounding rect to avoid layout-triggered clientWidth rounding
                    const rect = wrap.getBoundingClientRect();
                    cssW = Math.max(320, rect.width || 480);
                    cssH = Math.max(140, rect.height || 180);
                }

                // Only update backing pixel buffer when logical size changes significantly
                const lastW = parseFloat(canvas.dataset.cssW) || 0;
                const lastH = parseFloat(canvas.dataset.cssH) || 0;
                const widthChanged = Math.abs(cssW - lastW) > 0.5;
                const heightChanged = Math.abs(cssH - lastH) > 0.5;

                const desiredW = Math.round(cssW * dpr);
                const desiredH = Math.round(cssH * dpr);
                // if not frozen, keep previous behavior of updating backing buffer when size changes
                if (canvas.dataset.frozen !== 'true') {
                    const lastW = parseFloat(canvas.dataset.cssW) || 0;
                    const lastH = parseFloat(canvas.dataset.cssH) || 0;
                    const widthChanged = Math.abs(cssW - lastW) > 0.5;
                    const heightChanged = Math.abs(cssH - lastH) > 0.5;
                    if (widthChanged || heightChanged || canvas.width !== desiredW || canvas.height !== desiredH) {
                        canvas.width = desiredW;
                        canvas.height = desiredH;
                        canvas.dataset.cssW = cssW;
                        canvas.dataset.cssH = cssH;
                    }
                } else {
                    // ensure pixel buffer matches cached size (it should from showTooltip)
                    if (canvas.width !== desiredW || canvas.height !== desiredH) {
                        canvas.width = desiredW;
                        canvas.height = desiredH;
                    }
                }

                // reset transform and scale to DPR so drawing uses CSS pixels
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctx.clearRect(0, 0, cssW, cssH);
                const w = cssW;
                const h = cssH;
                const paddingLeft = 36;
                const paddingBottom = 20;
                const min = Math.min(...data);
                const max = Math.max(...data);

                // 坐标轴
                ctx.strokeStyle = '#bbb';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(paddingLeft, 10);
                ctx.lineTo(paddingLeft, h - paddingBottom);
                ctx.lineTo(w - 10, h - paddingBottom);
                ctx.stroke();

                // Y轴刻度
                ctx.fillStyle = '#888';
                ctx.font = '11px Arial';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                for (let i = 0; i <= 2; i++) {
                    const y = 10 + ((h - 30) / 2) * i;
                    const val = Math.round(max - (max - min) * (i / 2));
                    ctx.fillText(val, paddingLeft - 2, y);
                }

                // X轴日期刻度
                const labels = getRecentDates(data.length);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                for (let i = 0; i < data.length; i++) {
                    const x = paddingLeft + ((w - (paddingLeft + 10)) / (data.length - 1)) * i;
                    ctx.fillText(labels[i], x, h - 16);
                }

                // 计算点坐标
                const xs = [];
                const ys = [];
                for (let i = 0; i < data.length; i++) {
                    const x = paddingLeft + ((w - (paddingLeft + 10)) / (data.length - 1)) * i;
                    const y = 10 + (max - data[i]) / (max - min + 1e-6) * (h - 30);
                    xs.push(x);
                    ys.push(y);
                }

                // 平滑曲线（使用二次贝塞尔曲线 / midpoints）
                ctx.beginPath();
                ctx.moveTo(xs[0], ys[0]);
                for (let i = 1; i < xs.length; i++) {
                    const xc = (xs[i] + xs[i - 1]) / 2;
                    const yc = (ys[i] + ys[i - 1]) / 2;
                    ctx.quadraticCurveTo(xs[i - 1], ys[i - 1], xc, yc);
                }
                // 最后一段
                ctx.quadraticCurveTo(xs[xs.length - 1], ys[ys.length - 1], xs[xs.length - 1], ys[ys.length - 1]);

                // 描边（使用主题 accent 颜色）
                ctx.strokeStyle = accent;
                ctx.lineWidth = 2;
                ctx.stroke();

                // 渐变填充
                ctx.lineTo(xs[xs.length - 1], h - paddingBottom);
                ctx.lineTo(xs[0], h - paddingBottom);
                ctx.closePath();
                const grad = ctx.createLinearGradient(0, 10, 0, h - paddingBottom);
                grad.addColorStop(0, hexToRgba(accent, 0.45));
                grad.addColorStop(1, hexToRgba(accent, 0));
                ctx.fillStyle = grad;
                ctx.globalAlpha = 1;
                ctx.fill();

                // hover 交互（点与提示）
                if (hoverIdx !== null && hoverIdx >= 0) {
                    const x = xs[hoverIdx];
                    const y = ys[hoverIdx];
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = accent;
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    const tip = data[hoverIdx] + '';
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    // draw tooltip rect
                    const rectW = 64;
                    const rectH = 22;
                    const rx = Math.max(12, Math.min(w - rectW - 12, x - rectW / 2));
                    const ry = y - 30;
                    ctx.fillStyle = accent;
                    ctx.fillRect(rx, ry, rectW, rectH);
                    ctx.fillStyle = '#fff';
                    ctx.fillText(tip, rx + rectW / 2, ry + rectH - 6);

                    // update external hover value display if present
                    if (hoverValueEl) {
                        hoverValueEl.style.display = 'block';
                        hoverValueEl.textContent = tip;
                    }
                } else {
                    if (hoverValueEl) hoverValueEl.style.display = 'none';
                }
            }

            // 绑定范围切换按钮
            const rangeBtns = tooltip.querySelectorAll('.chart-range');
            rangeBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    rangeBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentRange = this.getAttribute('data-range');
                    currentData = rangesData[currentRange];
                    lastHover = null;
                    drawMiniChart(currentData, null);
                });
            });

            // 鼠标/触碰悬停显示数值（使用 rAF 节流）
            let lastHover = null;
            let rafPending = false;
            let pendingX = null;

            function handlePointerMove(clientX) {
                const rect = canvas.getBoundingClientRect();
                const mx = clientX - rect.left;
                const w = canvas.clientWidth;
                let idx = null;
                for (let i = 0; i < currentData.length; i++) {
                    const x = 36 + ((w - (36 + 10)) / (currentData.length - 1)) * i;
                    if (Math.abs(mx - x) < 16) {
                        idx = i;
                        break;
                    }
                }
                if (idx !== lastHover) {
                    lastHover = idx;
                    drawMiniChart(currentData, idx);
                }
            }

            function pointerMoveEvent(e) {
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                pendingX = clientX;
                if (!rafPending) {
                    rafPending = true;
                    requestAnimationFrame(function() {
                        handlePointerMove(pendingX);
                        rafPending = false;
                    });
                }
            }

            canvas.addEventListener('mousemove', pointerMoveEvent);
            canvas.addEventListener('touchmove', function(e) {
                e.preventDefault();
                pointerMoveEvent(e);
            }, { passive: false });
            canvas.addEventListener('touchstart', function(e) {
                pointerMoveEvent(e);
            }, { passive: true });
            canvas.addEventListener('mouseleave', function() {
                lastHover = null;
                drawMiniChart(currentData, null);
            });
                const icon = label.querySelector('.mini-chart-icon');
                const closeBtn = tooltip.querySelector('.chart-close');
                // Ensure a single overlay exists on the page
                let overlay = document.querySelector('.mini-chart-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'mini-chart-overlay';
                    overlay.style.display = 'none';
                    document.body.appendChild(overlay);
                }

                function showTooltip() {
                    // close other tooltips
                    document.querySelectorAll('.mini-chart-tooltip').forEach(function(tip) {
                        if (tip !== tooltip) tip.style.display = 'none';
                    });
                    tooltip.style.display = 'flex';
                    overlay.style.display = 'block';
                    // initialize and freeze canvas size while tooltip is open to avoid
                    // repeated resizing during pointer interactions
                    try {
                        const wrapRect = canvas.parentElement.getBoundingClientRect();
                        const initCssW = Math.max(320, wrapRect.width || 480);
                        const initCssH = Math.max(140, wrapRect.height || 180);
                        const dpr = window.devicePixelRatio || 1;
                        canvas.dataset.cssW = initCssW;
                        canvas.dataset.cssH = initCssH;
                        const desiredW = Math.round(initCssW * dpr);
                        const desiredH = Math.round(initCssH * dpr);
                        if (canvas.width !== desiredW || canvas.height !== desiredH) {
                            canvas.width = desiredW;
                            canvas.height = desiredH;
                        }
                        canvas.dataset.frozen = 'true';
                    } catch (e) {
                        // ignore
                    }
                    drawMiniChart(currentData, null);
                }

                function hideTooltip() {
                    tooltip.style.display = 'none';
                    overlay.style.display = 'none';
                    try {
                        delete canvas.dataset.frozen;
                    } catch (e) {}
                }

                if (icon) {
                    icon.addEventListener('click', function(e) {
                        e.stopPropagation();
                        if (tooltip.style.display === 'flex') {
                            hideTooltip();
                        } else {
                            showTooltip();
                        }
                    });

                    // 点击 overlay 关闭浮层
                    overlay.addEventListener('click', function() {
                        hideTooltip();
                    });

                    // 点击页面其他地方关闭浮层（保留原有行为）
                    document.addEventListener('click', function(e) {
                        if (!label.contains(e.target) && !tooltip.contains(e.target)) {
                            hideTooltip();
                        }
                    });
                }

                // 绑定浮层内的关闭按钮
                if (closeBtn) {
                    closeBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        hideTooltip();
                    });
                }

                // 移动端依然支持悬停（但icon更明显用于打开）
                label.addEventListener('mouseenter', function() {
                    if (window.innerWidth <= 900) {
                        showTooltip();
                    }
                });
                label.addEventListener('mouseleave', function() {
                    if (window.innerWidth <= 900) {
                        hideTooltip();
                    }
                });
        });
    // 主题切换功能
    // 手续费浮窗：使用 fixed 定位并由 JS 动态计算位置，避免被表头或容器遮挡
    (function() {
        document.querySelectorAll('.pnl-tooltip').forEach(el => {
            const popup = el.querySelector('.pnl-tooltip-popup');
            if (!popup) return;
            // ensure popup uses fixed positioning and is present in DOM
            popup.style.position = 'fixed';
            popup.style.zIndex = '99999';
            popup.style.opacity = '0';
            popup.style.pointerEvents = 'none';
            popup.style.display = 'block';

            function showPopup() {
                // measure popup size first
                const elRect = el.getBoundingClientRect();
                // temporarily set opacity to 0 display block to measure width/height
                popup.style.opacity = '0';
                popup.style.pointerEvents = 'none';
                const popupRect = popup.getBoundingClientRect();

                let left = elRect.left + elRect.width / 2 - popupRect.width / 2;
                // keep inside viewport
                left = Math.max(8, Math.min(left, window.innerWidth - popupRect.width - 8));

                // prefer showing above; if not enough space, show below
                let top = elRect.top - popupRect.height - 8;
                if (top < 8) {
                    top = elRect.bottom + 8;
                }

                popup.style.left = left + 'px';
                popup.style.top = top + 'px';
                popup.style.opacity = '1';
                popup.style.pointerEvents = 'auto';
            }

            function hidePopup() {
                popup.style.opacity = '0';
                popup.style.pointerEvents = 'none';
            }

            el.addEventListener('mouseenter', showPopup);
            el.addEventListener('mouseleave', hidePopup);
            // hide on scroll/resize to avoid stale positions
            window.addEventListener('scroll', hidePopup, true);
            window.addEventListener('resize', hidePopup);
        });
    })();
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
            openAccountSettings();
        });
    }

    // Account settings implementation
    function getAccountElements() {
        return Array.from(document.querySelectorAll('.account-card'));
    }

    function serializeAccounts() {
        return getAccountElements().map(card => {
            return {
                id: card.dataset.accountId || null,
                title: (card.querySelector('.card-header h2') || {textContent: 'Account'}).textContent.trim(),
                visible: card.style.display !== 'none'
            };
        });
    }

    function saveAccountsToStorage() {
        const data = serializeAccounts();
        localStorage.setItem('observer_accounts', JSON.stringify(data));
    }

    function loadAccountsFromStorage() {
        try {
            const raw = localStorage.getItem('observer_accounts');
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) { return null; }
    }

    function applyStoredSettings() {
        const saved = loadAccountsFromStorage();
        if (!saved) return;
        const container = document.querySelector('.container');
        // build a map of existing cards by id or title fallback
        const cards = getAccountElements();
        const map = new Map();
        cards.forEach(c => map.set(c.dataset.accountId || c.querySelector('.card-header h2').textContent.trim(), c));

        // reorder and apply visibility
        saved.forEach(item => {
            const key = item.id || item.title;
            const card = map.get(key);
            if (card) {
                if (item.visible === false) card.style.display = 'none';
                else card.style.display = '';
                container.appendChild(card); // append preserves order
            }
        });
    }

    // create settings modal interactions
    const settingsModal = document.querySelector('.account-settings-modal');
    const settingsList = document.getElementById('account-settings-list');
    const addAccountBtn = document.getElementById('add-account-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const settingsClose = document.querySelector('.settings-close');

    function buildSettingsList() {
        if (!settingsList) return;
        settingsList.innerHTML = '';
        const accounts = serializeAccounts();
        accounts.forEach(acc => {
            const li = document.createElement('li');
            li.className = 'account-item';
            li.dataset.accountId = acc.id || '';

            li.innerHTML = `
                <div class="account-handle" title="拖动以排序">≡</div>
                <div class="account-name">${escapeHtml(acc.title)}</div>
                <div class="account-controls">
                    <label class="visibility"><input type="checkbox" ${acc.visible ? 'checked' : ''}> 显示</label>
                    <button class="delete" title="删除">🗑</button>
                </div>
            `;

            // visibility toggle
            const checkbox = li.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', function() {
                const id = li.dataset.accountId;
                const card = findCardByIdOrTitle(id, li.querySelector('.account-name').textContent.trim());
                if (card) card.style.display = this.checked ? '' : 'none';
            });

            // delete
            li.querySelector('.delete').addEventListener('click', function() {
                const id = li.dataset.accountId;
                const card = findCardByIdOrTitle(id, li.querySelector('.account-name').textContent.trim());
                if (card) card.remove();
                li.remove();
            });

            // attach draggable to handle only (keep for accessibility) and add manual pointer-based drag
            const handle = li.querySelector('.account-handle');
            if (handle) {
                handle.setAttribute('draggable', 'false');
                // pointer-based manual drag for better reliability
                handle.addEventListener('pointerdown', function downHandler(e) {
                    // only left button / primary touch
                    if (e.button && e.button !== 0) return;
                    startManualDrag(li, e);
                });
            }

            settingsList.appendChild(li);
        });

        // ensure placeholder exists for reuse
        if (!settingsList._placeholder) {
            const placeholder = document.createElement('li');
            placeholder.className = 'account-item placeholder';
            placeholder.dataset.placeholder = '1';
            settingsList._placeholder = placeholder;
        }
    }

    function openAccountSettings() {
        if (!settingsModal) return;
        buildSettingsList();
        settingsModal.style.display = 'flex';
    }

    // centralized drag handlers (bound once) - handle-based drag
    if (settingsList && !settingsList._dragHandlersAttached) {
        let draggingEl = null;

        settingsList.addEventListener('dragstart', function(e) {
            // only start drag when originating from handle
            if (!e.target.classList.contains('account-handle')) {
                e.preventDefault();
                return;
            }
            const li = e.target.closest('.account-item');
            if (!li) return;
            draggingEl = li;
            li.classList.add('dragging');
            // ensure placeholder has appropriate height
            const ph = settingsList._placeholder;
            ph.style.height = li.getBoundingClientRect().height + 'px';
            li.parentNode.insertBefore(ph, li.nextSibling);
            try { e.dataTransfer.setData('text/plain', li.dataset.accountId || li.querySelector('.account-name').textContent); } catch (_) {}
            e.dataTransfer.effectAllowed = 'move';
        });

        settingsList.addEventListener('dragover', function(e) {
            e.preventDefault();
            if (!settingsList._placeholder) return;
            const after = getDragAfterElement(settingsList, e.clientY);
            const ph = settingsList._placeholder;
            if (after == null) settingsList.appendChild(ph);
            else settingsList.insertBefore(ph, after);
            e.dataTransfer && (e.dataTransfer.dropEffect = 'move');
        });

        settingsList.addEventListener('drop', function(e) {
            e.preventDefault();
            const ph = settingsList._placeholder;
            if (!ph || !draggingEl) return;

            // FLIP animation
            const children = Array.from(settingsList.children).filter(c => c !== ph);
            const beforeRects = new Map(children.map(ch => [ch, ch.getBoundingClientRect()]));

            settingsList.insertBefore(draggingEl, ph);
            ph.remove();

            const afterRects = new Map(children.map(ch => [ch, ch.getBoundingClientRect()]));

            children.forEach(ch => {
                const before = beforeRects.get(ch);
                const after = afterRects.get(ch);
                if (!before || !after) return;
                const dx = before.left - after.left;
                const dy = before.top - after.top;
                if (dx === 0 && dy === 0) return;
                ch.style.transform = `translate(${dx}px, ${dy}px)`;
                ch.style.willChange = 'transform';
            });

            requestAnimationFrame(() => {
                children.forEach(ch => {
                    if (!ch.style.transform) return;
                    ch.style.transition = 'transform 240ms cubic-bezier(0.2,0,0,1)';
                    ch.style.transform = '';
                    const onEnd = function() {
                        ch.style.transition = '';
                        ch.style.willChange = '';
                        ch.removeEventListener('transitionend', onEnd);
                    };
                    ch.addEventListener('transitionend', onEnd);
                });
            });

            draggingEl.classList.remove('dragging');
            draggingEl = null;
        });

        settingsList.addEventListener('dragend', function(e) {
            const ph = settingsList._placeholder;
            if (ph && ph.parentNode) ph.remove();
            if (draggingEl) draggingEl.classList.remove('dragging');
            draggingEl = null;
        });

        settingsList._dragHandlersAttached = true;
    }

    // Manual (pointer) drag helpers
    function startManualDrag(li, pointerEvent) {
        if (!li || !settingsList) return;
        pointerEvent.preventDefault();

        const startY = pointerEvent.clientY;
        const rect = li.getBoundingClientRect();
        const offsetY = startY - rect.top;

        // create ghost
        const ghost = li.cloneNode(true);
        ghost.classList.add('drag-ghost');
        ghost.style.position = 'fixed';
        ghost.style.left = rect.left + 'px';
        ghost.style.width = rect.width + 'px';
        ghost.style.top = rect.top + 'px';
        ghost.style.pointerEvents = 'none';
        ghost.style.zIndex = 2000;
        ghost.style.boxShadow = '0 8px 30px rgba(0,0,0,0.18)';
        ghost.style.transform = 'scale(1.02)';
        document.body.appendChild(ghost);

        // placeholder
        const ph = settingsList._placeholder || document.createElement('li');
        ph.className = 'account-item placeholder';
        ph.dataset.placeholder = '1';
        ph.style.height = rect.height + 'px';
        li.parentNode.insertBefore(ph, li.nextSibling);

        // hide original visually
        li.style.visibility = 'hidden';

        function onPointerMove(e) {
            const y = e.clientY;
            ghost.style.top = (y - offsetY) + 'px';

            const after = getDragAfterElement(settingsList, e.clientY);
            if (after == null) settingsList.appendChild(ph);
            else settingsList.insertBefore(ph, after);
        }

        function onPointerUp(e) {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);

            // perform drop: insert li where placeholder is
            const children = Array.from(settingsList.children).filter(c => c !== ph);
            const beforeRects = new Map(children.map(ch => [ch, ch.getBoundingClientRect()]));

            settingsList.insertBefore(li, ph);
            if (ph && ph.parentNode) ph.remove();
            li.style.visibility = '';

            const afterRects = new Map(children.map(ch => [ch, ch.getBoundingClientRect()]));
            // FLIP animate
            children.forEach(ch => {
                const before = beforeRects.get(ch);
                const after = afterRects.get(ch);
                if (!before || !after) return;
                const dx = before.left - after.left;
                const dy = before.top - after.top;
                if (dx === 0 && dy === 0) return;
                ch.style.transform = `translate(${dx}px, ${dy}px)`;
                ch.style.willChange = 'transform';
            });
            requestAnimationFrame(() => {
                children.forEach(ch => {
                    if (!ch.style.transform) return;
                    ch.style.transition = 'transform 240ms cubic-bezier(0.2,0,0,1)';
                    ch.style.transform = '';
                    const onEnd = function() {
                        ch.style.transition = '';
                        ch.style.willChange = '';
                        ch.removeEventListener('transitionend', onEnd);
                    };
                    ch.addEventListener('transitionend', onEnd);
                });
            });

            // cleanup ghost
            if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
        }

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    }

    function closeAccountSettings() {
        if (!settingsModal) return;
        settingsModal.style.display = 'none';
    }

    if (settingsClose) settingsClose.addEventListener('click', closeAccountSettings);
    // backdrop click
    const settingsBackdrop = document.querySelector('.account-settings-backdrop');
    if (settingsBackdrop) settingsBackdrop.addEventListener('click', closeAccountSettings);

    if (addAccountBtn) {
        addAccountBtn.addEventListener('click', function() {
            // show inline add form
            const form = document.querySelector('.add-account-form');
            if (!form) return;
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
            const nameInput = document.getElementById('new-account-name');
            if (nameInput) nameInput.focus();
        });
    }

    // confirm add from inline form
    const confirmAddBtn = document.getElementById('confirm-add-account');
    if (confirmAddBtn) {
        confirmAddBtn.addEventListener('click', function() {
            const nameInput = document.getElementById('new-account-name');
            const typeSelect = document.getElementById('new-account-type');
            const name = (nameInput && nameInput.value.trim()) || ('新账户 ' + (document.querySelectorAll('.account-card').length + 1));
            const type = (typeSelect && typeSelect.value) || '模拟盘';
            const id = 'account-' + Date.now();
            const card = document.createElement('div');
            card.className = 'account-card';
            card.dataset.accountId = id;
            card.innerHTML = `\n                <div class="card-header"><h2>${escapeHtml(name)} <span class="badge-blue">${escapeHtml(type)}</span></h2></div>\n                <div class="balance-grid">\n                    <div class="balance-item"><label>交易账户 (USDT)</label><div class="balance-value">0.000</div></div>\n                    <div class="balance-item"><label>资金账户 (USDT)</label><div class="balance-value">0.000</div></div>\n                    <div class="balance-item"><label>可用保证金 (USDT)</label><div class="balance-value">0.000</div></div>\n                    <div class="balance-item"><label>浮动盈亏 (USDT)</label><div class="balance-value">0.000</div><div class="balance-change neutral">+0.000 (0.00%)</div></div>\n                </div>\n            `;
            document.querySelector('.container').appendChild(card);
            // hide and reset form
            const form = document.querySelector('.add-account-form');
            if (form) form.style.display = 'none';
            if (nameInput) nameInput.value = '';
            if (typeSelect) typeSelect.selectedIndex = 0;
            buildSettingsList();
        });
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            // disable buttons to avoid double submit
            saveSettingsBtn.disabled = true;
            saveSettingsBtn.textContent = '保存中...';
            const items = Array.from(settingsList.querySelectorAll('.account-item'));
            const order = items.map(li => {
                const id = li.dataset.accountId;
                const title = li.querySelector('.account-name').textContent.trim();
                const visible = !!li.querySelector('input[type="checkbox"]').checked;
                return { id, title, visible };
            });
            localStorage.setItem('observer_accounts', JSON.stringify(order));
            // apply order to page
            const container = document.querySelector('.container');
            order.forEach(item => {
                const card = findCardByIdOrTitle(item.id, item.title);
                if (card) container.appendChild(card);
                if (card) card.style.display = item.visible ? '' : 'none';
            });

            // show saved toast inside modal
            const toast = document.createElement('div');
            toast.className = 'save-toast';
            toast.textContent = '已保存';
            toast.style.position = 'absolute';
            toast.style.right = '16px';
            toast.style.top = '56px';
            toast.style.background = 'rgba(0,0,0,0.72)';
            toast.style.color = '#fff';
            toast.style.padding = '6px 10px';
            toast.style.borderRadius = '6px';
            toast.style.zIndex = 10;
            const panel = document.querySelector('.account-settings-panel');
            if (panel) panel.appendChild(toast);

            setTimeout(() => {
                if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
                saveSettingsBtn.disabled = false;
                saveSettingsBtn.textContent = '保存';
                closeAccountSettings();
            }, 900);
        });
    }

    function findCardByIdOrTitle(id, title) {
        let card = null;
        if (id) card = document.querySelector(`.account-card[data-account-id="${id}"]`);
        if (!card) {
            // fallback by title
            const all = getAccountElements();
            card = all.find(c => (c.querySelector('.card-header h2') || {textContent: ''}).textContent.trim() === title);
        }
        return card;
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.account-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > (closest.offset || -Infinity)) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: -Infinity }).element || null;
    }

    function escapeHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

    // on load, apply stored settings (order / visibility)
    applyStoredSettings();
    
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
        
        // 不再重新初始化拖动功能，避免事件重复绑定导致拖动失效
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
