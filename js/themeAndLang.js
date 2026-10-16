/* Tema e idioma con traducción de controles de pasos */
(function () {
    /* Textos por idioma */
    const TRANSLATIONS = {
        es: {
            modelLabel: "Modelo:",
            avatarLabel: "Avatar:",
            stepsControlLabel: "Pasos:",
            circular: "Circular",
            square: "Apple Watch",
            band: "Xiaomi Band",
            stepsLabel: "PASOS",
            uploadInitial: "Cargar Avatar .GLB",
            uploadLoaded: "Cambiar .GLB",
            days: ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'],
            months: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
        },
        en: {
            modelLabel: "Model:",
            avatarLabel: "Avatar:",
            stepsControlLabel: "Steps:",
            circular: "Circular",
            square: "Apple Watch",
            band: "Xiaomi Band",
            stepsLabel: "STEPS",
            uploadInitial: "Upload .GLB Avatar",
            uploadLoaded: "Change .GLB",
            days: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
            months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
        }
    };

    /* Cargar preferencias guardadas */
    let currentTheme = localStorage.getItem('tiltclock_theme') || 'light';
    let currentLang = localStorage.getItem('tiltclock_lang') || 'es';

    /* Inicializar controles */
    function initThemeAndLang() {
        const themeBtn = document.getElementById('theme-toggle-btn');
        const langBtn = document.getElementById('lang-toggle-btn');

        if (themeBtn) {
            themeBtn.addEventListener('click', toggleTheme);
        }

        if (langBtn) {
            langBtn.addEventListener('click', toggleLang);
        }

        applyTheme(currentTheme);
        updateTranslations();
    }

    /* Alternar tema */
    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('tiltclock_theme', currentTheme);
        applyTheme(currentTheme);
    }

    /* Aplicar estado visual del tema */
    function applyTheme(theme) {
        const body = document.body;
        const themeIcon = document.getElementById('theme-icon');

        if (theme === 'dark') {
            body.classList.add('dark-theme');
            if (themeIcon) themeIcon.className = "fa-solid fa-sun text-amber-400";
        } else {
            body.classList.remove('dark-theme');
            if (themeIcon) themeIcon.className = "fa-solid fa-moon text-slate-600";
        }
    }

    /* Alternar idioma */
    function toggleLang() {
        currentLang = currentLang === 'es' ? 'en' : 'es';
        localStorage.setItem('tiltclock_lang', currentLang);

        const langText = document.getElementById('lang-text');
        if (langText) langText.innerText = currentLang.toUpperCase();

        updateTranslations();

        if (typeof window.updateWatchTime === 'function') {
            window.updateWatchTime();
        }
    }

    /* Actualizar UI */
    function updateTranslations() {
        const t = TRANSLATIONS[currentLang];

        const modelLabel = document.getElementById('model-label');
        const avatarLabel = document.getElementById('avatar-label');
        const stepsControlLabel = document.getElementById('steps-control-label');
        const btnCircular = document.getElementById('btn-label-circular');
        const btnSquare = document.getElementById('btn-label-square');
        const btnBand = document.getElementById('btn-label-band');
        const stepsLabel = document.getElementById('steps-label');
        const uploadBtnText = document.getElementById('upload-btn-text');
        const langText = document.getElementById('lang-text');

        if (langText) langText.innerText = currentLang.toUpperCase();
        if (modelLabel) modelLabel.innerText = t.modelLabel;
        if (avatarLabel) avatarLabel.innerText = t.avatarLabel;
        if (stepsControlLabel) stepsControlLabel.innerText = t.stepsControlLabel;
        if (btnCircular) btnCircular.innerText = t.circular;
        if (btnSquare) btnSquare.innerText = t.square;
        if (btnBand) btnBand.innerText = t.band;
        if (stepsLabel) stepsLabel.innerText = t.stepsLabel;

        if (uploadBtnText) {
            const isLoaded = document.getElementById('upload-btn-wrapper')?.classList.contains('btn-state-loaded');
            uploadBtnText.innerText = isLoaded ? t.uploadLoaded : t.uploadInitial;
        }
    }

    /* Obtener idioma */
    function getCurrentLang() {
        return currentLang;
    }

    /* Obtener traducciones */
    function getTranslations() {
        return TRANSLATIONS[currentLang];
    }

    /* Exportar funciones */
    window.initThemeAndLang = initThemeAndLang;
    window.getCurrentLang = getCurrentLang;
    window.getTranslations = getTranslations;
})();