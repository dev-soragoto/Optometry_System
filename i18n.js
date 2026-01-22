const translations = {
    'zh-CN': {
        'title': '验光系统',
        
        // 导航菜单
        'nav.calibration': '尺寸校准',
        'nav.visualAcuity': 'E视力表',
        'nav.duochrome': '红绿精调',
        'nav.astigmatism': '散光盘',
        'nav.honeycomb': '蜂窝视标',
        'nav.cross': '交叉视标',
        'nav.langSwitch': 'EN',

        // 校准视图
        'calibration.title': '物理尺寸校准',
        'calibration.testDistance': '测试距离:',
        'calibration.meters': '米',
        'calibration.custom': '自定义',
        'calibration.instruction': '请拖动滑块，使蓝色矩形等同信用卡大小 (85.6mm x 54mm)',
        'calibration.cardText': 'CREDIT CARD',
        'calibration.saveAndContinue': '保存校准并继续',

        // E视力表
        'va.startAcuity': '起始视力:',
        'va.refresh': '刷新随机方向',

        // 散光盘
        'astig.diameter': '直径 (cm):',
        'astig.dashLength': '虚线段长 (mm):',
        'astig.lineWeight': '线条粗细 (mm):',
        'astig.fontSize': '字体大小 (px):',
        'astig.refresh': '刷新散光盘',

        // 红绿精调
        'duo.startAcuity': '起始视力:',
        'duo.randomize': '随机换向',

        // 蜂窝视标
        'hc.diameter': '圆形直径 (cm):',
        'hc.dotSize': '黑点直径 (mm):',
        'hc.refresh': '刷新蜂窝视标',

        // 交叉视标
        'cross.diameter': '圆形直径 (cm):',
        'cross.lineWidth': '线宽 (px):',
        'cross.spacing': '线距 (mm):',
        'cross.refresh': '刷新交叉视标'
    },
    'en-US': {

        'title': 'Optometry System',

        // Navigation
        'nav.calibration': 'Calibration',
        'nav.visualAcuity': 'E Chart',
        'nav.duochrome': 'Duochrome',
        'nav.astigmatism': 'Astigmatism',
        'nav.honeycomb': 'Honeycomb',
        'nav.cross': 'Cross',
        'nav.langSwitch': '中文',

        // Calibration view
        'calibration.title': 'Calibration',
        'calibration.testDistance': 'Distance:',
        'calibration.meters': 'm',
        'calibration.custom': 'Custom',
        'calibration.instruction': 'Drag slider to match credit card size (85.6mm x 54mm)',
        'calibration.cardText': 'CREDIT CARD',
        'calibration.saveAndContinue': 'Save & Continue',

        // Visual Acuity
        'va.startAcuity': 'Start VA:',
        'va.refresh': 'Refresh',

        // Astigmatism
        'astig.diameter': 'Dia (cm):',
        'astig.dashLength': 'Dash (mm):',
        'astig.lineWeight': 'Width (mm):',
        'astig.fontSize': 'Font (px):',
        'astig.refresh': 'Refresh',

        // Duochrome
        'duo.startAcuity': 'Start VA:',
        'duo.randomize': 'Randomize',

        // Honeycomb
        'hc.diameter': 'Dia (cm):',
        'hc.dotSize': 'Dot (mm):',
        'hc.refresh': 'Refresh',

        // Cross
        'cross.diameter': 'Dia (cm):',
        'cross.lineWidth': 'Width (px):',
        'cross.spacing': 'Gap (mm):',
        'cross.refresh': 'Refresh'
    }
};

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('optometry_lang') || 'zh-CN';
    }

    t(key) {
        return translations[this.currentLang]?.[key] || key;
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('optometry_lang', lang);
        this.updateUI();
    }

    toggleLanguage() {
        const newLang = this.currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
        this.setLanguage(newLang);
    }

    updateUI() {
        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);

            // 根据元素类型更新文本
            if (el.tagName === 'INPUT' && el.type === 'button') {
                el.value = translation;
            } else if (el.tagName === 'BUTTON') {
                el.textContent = translation;
            } else if (el.hasAttribute('data-i18n-placeholder')) {
                el.placeholder = translation;
            } else {
                el.textContent = translation;
            }
        });

        // 更新语言切换按钮
        const langSwitcher = document.getElementById('lang-switcher');
        if (langSwitcher) {
            langSwitcher.textContent = this.t('nav.langSwitch');
        }
    }
}

// 创建全局实例
const i18n = new I18n();
