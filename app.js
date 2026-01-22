/**
 * --- 状态管理 ---
 */
const state = {
    ppiScale: parseFloat(localStorage.getItem('optometry_ppi')) || 1.0,
    testDistance: parseFloat(localStorage.getItem('optometry_distance')) || 5.0,
    currentView: 'calibration'
};

/**
 * --- 路由逻辑 ---
 */
const viewOrder = ['calibration', 'visual-acuity', 'duochrome', 'astigmatism', 'honeycomb', 'cross'];

function switchView(target) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));

    document.getElementById(target).classList.add('active');
    const targetLink = document.querySelector(`nav a[data-target="${target}"]`);
    if (targetLink) {
        targetLink.classList.add('active');
    }
    state.currentView = target;

    // 自动触发当前视图的渲染函数
    if (target === 'visual-acuity') renderVA();
    if (target === 'astigmatism') renderAstig();
    if (target === 'duochrome') renderDuo();
    if (target === 'honeycomb') renderHoneycomb();
    if (target === 'cross') renderCross();
}

/**
 * --- 初始化函数 ---
 */
function initApp() {
    // 设置导航链接事件
    document.querySelectorAll('nav a').forEach(link => {
        link.onclick = () => {
            const target = link.getAttribute('data-target');
            if (target) switchView(target);
        };
    });

    // 语言切换
    const langSwitcher = document.getElementById('lang-switcher');
    if (langSwitcher) {
        langSwitcher.onclick = () => {
            i18n.toggleLanguage();
        };
    }

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        const currentIndex = viewOrder.indexOf(state.currentView);

        // 左右键切换视图
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            e.preventDefault();
            switchView(viewOrder[currentIndex - 1]);
        } else if (e.key === 'ArrowRight' && currentIndex < viewOrder.length - 1) {
            e.preventDefault();
            switchView(viewOrder[currentIndex + 1]);
        }

        // 上下键调整起始视力
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            let targetInput = null;
            if (state.currentView === 'visual-acuity') {
                targetInput = document.getElementById('va-start');
            } else if (state.currentView === 'duochrome') {
                targetInput = document.getElementById('duo-start');
            }

            if (targetInput) {
                e.preventDefault();
                let currentVal = parseFloat(targetInput.value) || 0.7;
                if (e.key === 'ArrowUp') {
                    currentVal = Math.max(0.1, currentVal - 0.1);
                } else {
                    currentVal = Math.min(1.3, currentVal + 0.1);
                }
                targetInput.value = currentVal.toFixed(1);
                targetInput.dispatchEvent(new Event('input'));
            }
        }

        // 回车键触发按钮点击
        if (e.key === 'Enter') {
            const activeButtons = document.querySelectorAll(`#${state.currentView} button:not([style*="display: none"])`);
            if (activeButtons.length > 0) {
                e.preventDefault();
                activeButtons[0].click();
            }
        }
    });

    // 初始化校准
    initCalibration();

    // 更新UI语言
    i18n.updateUI();

    // 激活校准视图
    switchView('calibration');
}

/**
 * --- 校准模块 ---
 */
function initCalibration() {
    const ppiSlider = document.getElementById('ppi-slider');
    const calCard = document.getElementById('calibration-card');
    const ppiText = document.getElementById('ppi-text');
    const calDistanceSelect = document.getElementById('cal-distance');
    const calDistanceCustom = document.getElementById('cal-distance-custom');

    // 从localStorage恢复所有配置
    const savedConfig = {
        vaStart: parseFloat(localStorage.getItem('optometry_va_start')) || 0.7,
        astigDiameter: parseFloat(localStorage.getItem('optometry_astig_diameter')) || 20,
        astigDash: parseFloat(localStorage.getItem('optometry_astig_dash')) || 5,
        astigWeight: parseFloat(localStorage.getItem('optometry_astig_weight')) || 0.2,
        astigFontSize: parseFloat(localStorage.getItem('optometry_astig_fontsize')) || 30,
        duoStart: parseFloat(localStorage.getItem('optometry_duo_start')) || 0.6,
        hcDiameter: parseFloat(localStorage.getItem('optometry_hc_diameter')) || 20,
        hcDotSize: parseFloat(localStorage.getItem('optometry_hc_dotsize')) || 10,
        crossDiameter: parseFloat(localStorage.getItem('optometry_cross_diameter')) || 20,
        crossWidth: parseFloat(localStorage.getItem('optometry_cross_width')) || 2,
        crossSpacing: parseFloat(localStorage.getItem('optometry_cross_spacing')) || 8
    };

    // 初始化显示
    ppiSlider.value = state.ppiScale * 100;
    ppiText.innerText = (state.ppiScale * 100) + '%';
    calCard.style.width = (85.6 * state.ppiScale) + 'mm';
    calCard.style.height = (54 * state.ppiScale) + 'mm';

    // 恢复各视图的配置
    document.getElementById('va-start').value = savedConfig.vaStart;
    document.getElementById('astig-diameter').value = savedConfig.astigDiameter;
    document.getElementById('astig-dash').value = savedConfig.astigDash;
    document.getElementById('astig-weight').value = savedConfig.astigWeight;
    document.getElementById('astig-font-size').value = savedConfig.astigFontSize;
    document.getElementById('duo-start').value = savedConfig.duoStart;
    document.getElementById('hc-diameter').value = savedConfig.hcDiameter;
    document.getElementById('hc-dot-size').value = savedConfig.hcDotSize;
    document.getElementById('cross-diameter').value = savedConfig.crossDiameter;
    document.getElementById('cross-width').value = savedConfig.crossWidth;
    document.getElementById('cross-spacing').value = savedConfig.crossSpacing;

    // 滑块事件
    ppiSlider.addEventListener('input', () => {
        state.ppiScale = ppiSlider.value / 100;
        calCard.style.width = (85.6 * state.ppiScale) + 'mm';
        calCard.style.height = (54 * state.ppiScale) + 'mm';
        ppiText.innerText = ppiSlider.value + '%';
    });

    // 距离选择事件
    calDistanceSelect.addEventListener('change', () => {
        if (calDistanceSelect.value === 'custom') {
            calDistanceCustom.style.display = 'inline';
            state.testDistance = parseFloat(calDistanceCustom.value) || 5;
        } else {
            calDistanceCustom.style.display = 'none';
            state.testDistance = parseFloat(calDistanceSelect.value);
        }
    });

    calDistanceCustom.addEventListener('input', () => {
        state.testDistance = parseFloat(calDistanceCustom.value) || 5;
    });

    // 添加配置保存事件监听器
    const configInputs = [
        { id: 'va-start', key: 'optometry_va_start' },
        { id: 'astig-diameter', key: 'optometry_astig_diameter' },
        { id: 'astig-dash', key: 'optometry_astig_dash' },
        { id: 'astig-weight', key: 'optometry_astig_weight' },
        { id: 'astig-font-size', key: 'optometry_astig_fontsize' },
        { id: 'duo-start', key: 'optometry_duo_start' },
        { id: 'hc-diameter', key: 'optometry_hc_diameter' },
        { id: 'hc-dot-size', key: 'optometry_hc_dotsize' },
        { id: 'cross-diameter', key: 'optometry_cross_diameter' },
        { id: 'cross-width', key: 'optometry_cross_width' },
        { id: 'cross-spacing', key: 'optometry_cross_spacing' }
    ];

    configInputs.forEach(({ id, key }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', function () {
                localStorage.setItem(key, this.value);
            });
        }
    });

    // 初始化距离选择器
    if (state.testDistance === 3 || state.testDistance === 5) {
        calDistanceSelect.value = state.testDistance.toString();
    } else {
        calDistanceSelect.value = 'custom';
        calDistanceCustom.value = state.testDistance;
        calDistanceCustom.style.display = 'inline';
    }
}

function saveCalibration() {
    localStorage.setItem('optometry_ppi', state.ppiScale);
    localStorage.setItem('optometry_distance', state.testDistance);
    switchView('visual-acuity');
}

/**
 * --- E视力表模块 ---
 */
function renderVA() {
    const container = document.getElementById('va-container');
    container.innerHTML = '';
    const start = parseFloat(document.getElementById('va-start').value);

    // 从state获取测试距离
    const distance = state.testDistance;

    const baseSize5M = 7.272; // 标准 1.0 在 5m 处的 mm 尺寸

    // 计算视力级别标签的字体大小（使用0.5视力的E字大小）
    const labelRefAcuity = 0.3;
    const labelPhysicalSizeMm = (baseSize5M * (distance / 5)) / labelRefAcuity;
    const labelDisplaySizeMm = labelPhysicalSizeMm * state.ppiScale;
    const labelFontSizeMm = labelDisplaySizeMm;

    // 渲染 3 排
    for (let i = 0; i < 3; i++) {
        const acuity = (start + i * 0.1).toFixed(1);
        if (acuity > 2.0) break;

        const row = document.createElement('div');
        row.className = 'chart-row';
        row.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 30px; padding: 40px 0; border-bottom: 1px solid #f9f9f9; width: 100%;';

        // 左侧视力标签
        const headerLeft = document.createElement('div');
        headerLeft.style.cssText = `font-size: ${labelFontSizeMm}mm; font-weight: bold; color: #d9534f; min-width: 60px; text-align: right;`;
        headerLeft.innerText = acuity;

        // 视标容器
        const eContainer = document.createElement('div');
        eContainer.className = 'e-container';
        eContainer.style.cssText = 'display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 15px;';

        // 计算该行视标的物理高度
        let physicalSizeMm = (baseSize5M * (distance / 5)) / acuity;
        let displaySizeMm = physicalSizeMm * state.ppiScale;

        // 逻辑：视标越大，显示个数越少，防止出屏
        const count = acuity < 0.3 ? 1 : 5;

        // 单元格宽度策略：固定宽度以实现纵向对齐效果
        const cellBaseWidth = Math.max(30, physicalSizeMm * 1.5);

        for (let j = 0; j < count; j++) {
            const cell = document.createElement('div');
            cell.className = 'e-cell';
            cell.style.width = (cellBaseWidth * state.ppiScale) + 'mm';
            cell.style.height = (cellBaseWidth * state.ppiScale) + 'mm';

            const rot = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
            cell.innerHTML = `
                <svg width="${displaySizeMm}mm" height="${displaySizeMm}mm" viewBox="0 0 5 5" style="transform: rotate(${rot}deg)">
                    <path d="M0,0 H5 V1 H1 V2 H4 V3 H1 V4 H5 V5 H0 Z" fill="black" />
                </svg>
            `;
            eContainer.appendChild(cell);
        }

        // 右侧视力标签
        const headerRight = document.createElement('div');
        headerRight.style.cssText = `font-size: ${labelFontSizeMm}mm; font-weight: bold; color: #d9534f; min-width: 60px; text-align: left;`;
        headerRight.innerText = acuity;

        row.appendChild(headerLeft);
        row.appendChild(eContainer);
        row.appendChild(headerRight);
        container.appendChild(row);
    }
}

/**
 * --- 散光盘模块 ---
 */
function renderAstig() {
    const container = document.getElementById('astig-container');
    const diameterCm = parseFloat(document.getElementById('astig-diameter').value);
    const diameterMm = diameterCm * 10; // cm 转 mm
    const dashLen = parseFloat(document.getElementById('astig-dash').value);
    const weight = parseFloat(document.getElementById('astig-weight').value);
    const fontSizePx = parseFloat(document.getElementById('astig-font-size').value);

    // 更新显示值
    document.getElementById('astig-dash-val').textContent = dashLen;
    document.getElementById('astig-weight-val').textContent = weight;
    document.getElementById('astig-font-val').textContent = fontSizePx;

    const displaySizeMm = diameterMm * state.ppiScale;
    const radius = displaySizeMm / 2;
    const center = radius;

    let linesHtml = '';

    // 绘制 24 条虚线 - 圆周阵列，确保轴对称
    for (let i = 0; i < 360; i += 15) {
        const angleRad = (i - 90) * Math.PI / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);

        // 从圆心到边缘的放射线
        const x1 = center;
        const y1 = center;
        const x2 = center + radius * cos;
        const y2 = center + radius * sin;

        const dashPx = dashLen * state.ppiScale;
        const gapPx = (dashLen * 0.5) * state.ppiScale;

        linesHtml += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                      stroke="black" 
                      stroke-width="${weight}mm" 
                      stroke-dasharray="${dashPx},${gapPx}" />`;
    }

    // 绘制数字标注
    let labels = '';
    for (let i = 0; i < 360; i += 30) {
        const hour = i === 0 ? 12 : i / 30;
        const angleRad = (i - 90) * Math.PI / 180;
        const labelR = radius * 1.15;
        const lx = center + labelR * Math.cos(angleRad);
        const ly = center + labelR * Math.sin(angleRad);

        labels += `<text x="${lx}" y="${ly}" font-size="${fontSizePx}px" 
                   text-anchor="middle" dominant-baseline="middle" font-weight="bold" font-family="Arial">${hour}</text>`;
    }

    const padding = diameterMm * 0.25;
    const totalSize = displaySizeMm + (padding * 2 * state.ppiScale);
    const offsetVal = padding * state.ppiScale;

    // 中心圆大小与直径成比例：直径的 5%
    const centerCircleRadius = (diameterMm * 0.1) * state.ppiScale;

    container.innerHTML = `
        <svg width="${totalSize}mm" height="${totalSize}mm" viewBox="${-offsetVal} ${-offsetVal} ${totalSize} ${totalSize}">
            <!-- 外圈辅助圆 -->
            <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#eee" stroke-width="1" />
            ${linesHtml}
            <!-- 中心注视空白区 -->
            <circle cx="${center}" cy="${center}" r="${centerCircleRadius}" fill="white" />
            ${labels}
        </svg>
    `;
}

/**
 * --- 红绿精调模块 ---
 */
function renderDuo() {
    const startAcuity = parseFloat(document.getElementById('duo-start').value);
    const baseSize5M = 7.272;
    const distance = state.testDistance;

    const redEl = document.getElementById('duo-red');
    const greenEl = document.getElementById('duo-green');
    const gridEl = document.getElementById('duo-grid');

    // 清空内容
    redEl.innerHTML = '';
    greenEl.innerHTML = '';
    gridEl.innerHTML = '';

    // 生成9个随机方向
    const rotations = [];
    for (let i = 0; i < 9; i++) {
        rotations.push([0, 90, 180, 270][Math.floor(Math.random() * 4)]);
    }

    // 计算最大视标尺寸
    const maxAcuity = startAcuity;
    const maxPhysicalSizeMm = (baseSize5M * (distance / 5)) / maxAcuity;
    const maxDisplaySizeMm = maxPhysicalSizeMm * state.ppiScale;

    // 单元格尺寸
    const cellSize = maxDisplaySizeMm * 1.2;

    // 创建7x3的统一网格容器
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `display: grid; grid-template-columns: repeat(7, ${cellSize}mm); grid-template-rows: repeat(3, ${cellSize}mm); align-items: center; justify-items: center; justify-content: center; align-content: center; height: 100%;`;

    // 生成3行内容
    let optotypeIndex = 0;
    for (let row = 0; row < 3; row++) {
        const acuity = startAcuity + (row * 0.1);
        const physicalSizeMm = (baseSize5M * (distance / 5)) / acuity;
        const displaySizeMm = physicalSizeMm * state.ppiScale;
        const strokeWidthMm = displaySizeMm / 5;

        // 前3列：红色区域视标
        for (let col = 0; col < 3; col++) {
            const svg = `<svg width="${displaySizeMm}mm" height="${displaySizeMm}mm" viewBox="0 0 5 5" style="transform:rotate(${rotations[optotypeIndex]}deg)">
                <path d="M0,0 H5 V1 H1 V2 H4 V3 H1 V4 H5 V5 H0 Z" fill="black"/></svg>`;
            gridContainer.innerHTML += svg;
            optotypeIndex++;
        }

        // 第4列：中间圆圈
        const circleWrapper = document.createElement('div');
        circleWrapper.style.cssText = `display: flex; align-items: center; justify-content: center;`;
        circleWrapper.innerHTML = `<svg width="${displaySizeMm}mm" height="${displaySizeMm}mm" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="black" stroke-width="${(strokeWidthMm / displaySizeMm) * 100}"/></svg>`;
        gridContainer.appendChild(circleWrapper);

        // 后3列：绿色区域视标
        optotypeIndex -= 3;
        for (let col = 0; col < 3; col++) {
            const svg = `<svg width="${displaySizeMm}mm" height="${displaySizeMm}mm" viewBox="0 0 5 5" style="transform:rotate(${rotations[optotypeIndex]}deg)">
                <path d="M0,0 H5 V1 H1 V2 H4 V3 H1 V4 H5 V5 H0 Z" fill="black"/></svg>`;
            gridContainer.innerHTML += svg;
            optotypeIndex++;
        }
    }

    gridEl.appendChild(gridContainer);
}

/**
 * --- 蜂窝视标模块 ---
 */
function renderHoneycomb() {
    const diameterCm = parseFloat(document.getElementById('hc-diameter').value);
    const dotSizeMm = parseFloat(document.getElementById('hc-dot-size').value);

    const container = document.getElementById('hc-container');
    container.innerHTML = '';

    // 转换为显示尺寸
    const diameterMm = diameterCm * 10;
    const displayDiameterMm = diameterMm * state.ppiScale;
    const displayDotSizeMm = dotSizeMm * state.ppiScale;

    // 将mm转换为像素
    const mmToPx = 96 / 25.4;
    const diameterPx = displayDiameterMm * mmToPx;
    const dotSizePx = displayDotSizeMm * mmToPx;
    const radiusPx = diameterPx / 2;

    // 创建SVG容器
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.display = 'block';

    container.appendChild(svg);
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    // 黑色背景
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', 'black');
    svg.appendChild(bgRect);

    // 白色圆形区域
    const whiteCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    whiteCircle.setAttribute('cx', centerX);
    whiteCircle.setAttribute('cy', centerY);
    whiteCircle.setAttribute('r', radiusPx);
    whiteCircle.setAttribute('fill', 'white');
    svg.appendChild(whiteCircle);

    // 蜂窝状黑点
    const dotPattern = [3, 4, 5, 4, 3];
    const totalRows = 5;

    const centerDistance = dotSizePx * 2;
    const horizontalSpacing = centerDistance;
    const verticalSpacing = centerDistance * Math.sqrt(3) / 2;

    const totalHeight = (totalRows - 1) * verticalSpacing;
    const startY = centerY - totalHeight / 2;

    for (let row = 0; row < totalRows; row++) {
        const dotsInRow = dotPattern[row];
        const y = startY + row * verticalSpacing;

        const totalWidth = (dotsInRow - 1) * horizontalSpacing;
        const startX = centerX - totalWidth / 2;

        for (let col = 0; col < dotsInRow; col++) {
            const x = startX + col * horizontalSpacing;

            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', x);
            dot.setAttribute('cy', y);
            dot.setAttribute('r', dotSizePx / 2);
            dot.setAttribute('fill', 'black');
            svg.appendChild(dot);
        }
    }
}

/**
 * --- 交叉视标模块 ---
 */
function renderCross() {
    const diameterCm = parseFloat(document.getElementById('cross-diameter').value);
    const lineWidthPx = parseFloat(document.getElementById('cross-width').value);
    const spacingMm = parseFloat(document.getElementById('cross-spacing').value);

    const container = document.getElementById('cross-container');
    container.innerHTML = '';

    // 转换为显示尺寸
    const diameterMm = diameterCm * 10;
    const displayDiameterMm = diameterMm * state.ppiScale;
    const displaySpacingMm = spacingMm * state.ppiScale;

    // 将mm转换为像素
    const mmToPx = 96 / 25.4;
    const diameterPx = displayDiameterMm * mmToPx;
    const spacingPx = displaySpacingMm * mmToPx;
    const radiusPx = diameterPx / 2;

    // 创建SVG容器
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.display = 'block';

    container.appendChild(svg);
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    // 黑色背景
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', 'black');
    svg.appendChild(bgRect);

    // 白色圆形区域
    const whiteCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    whiteCircle.setAttribute('cx', centerX);
    whiteCircle.setAttribute('cy', centerY);
    whiteCircle.setAttribute('r', radiusPx);
    whiteCircle.setAttribute('fill', 'white');
    svg.appendChild(whiteCircle);

    // 创建圆形蒙版
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clipPath.setAttribute('id', 'cross-circle-clip');
    const clipCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    clipCircle.setAttribute('cx', centerX);
    clipCircle.setAttribute('cy', centerY);
    clipCircle.setAttribute('r', radiusPx);
    clipPath.appendChild(clipCircle);
    defs.appendChild(clipPath);
    svg.appendChild(defs);

    // 生成5x5交叉线条
    const linesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    linesGroup.setAttribute('clip-path', 'url(#cross-circle-clip)');

    // 5条横线
    for (let i = 0; i < 5; i++) {
        const y = centerY - 2 * spacingPx + i * spacingPx;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', centerX - radiusPx);
        line.setAttribute('y1', y);
        line.setAttribute('x2', centerX + radiusPx);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', lineWidthPx);
        linesGroup.appendChild(line);
    }

    // 5条竖线
    for (let i = 0; i < 5; i++) {
        const x = centerX - 2 * spacingPx + i * spacingPx;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', centerY - radiusPx);
        line.setAttribute('x2', x);
        line.setAttribute('y2', centerY + radiusPx);
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', lineWidthPx);
        linesGroup.appendChild(line);
    }

    svg.appendChild(linesGroup);
}

/**
 * --- DOM加载完成后初始化 ---
 */
document.addEventListener('DOMContentLoaded', initApp);
