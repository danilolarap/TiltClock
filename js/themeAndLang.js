/**
 * @fileoverview Módulo de Gestión de Tema e Idioma (ES/EN) con persistencia en localStorage para TiltClock.
 * Controla la conmutación entre modo claro y oscuro, la traducción dinámica del DOM,
 * el soporte para nombres de días/meses y la persistencia de preferencias del usuario.
 *
 * @author Danilo Lara <danilolarap>
 */
(function () {
    /**
     * Diccionario de traducciones para español (es) e inglés (en).
     * @type {Object.<string, Object.<string, string|Array.<string>>>}
     */
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
            circular: "Round",
            square: "Apple Watch",
            band: "Xiaomi Band",
            stepsLabel: "STEPS",
            uploadInitial: "Upload .GLB Avatar",
            uploadLoaded: "Change .GLB",
            days: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
            months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
        }
    };

    /** @type {string} Tema actual recuperado de localStorage o 'light' por defecto. */
    let currentTheme = localStorage.getItem('tiltclock_theme') || 'light';

    /** @type {string} Idioma actual recuperado de localStorage o 'es' por defecto. */
    let currentLang = localStorage.getItem('tiltclock_lang') || 'es';

    /**
     * Inicializa los eventos de los botones de tema e idioma y aplica las preferencias guardadas.
     */
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

    /**
     * Alterna el tema visual actual entre 'light' y 'dark'.
     */
    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('tiltclock_theme', currentTheme);
        applyTheme(currentTheme);
    }

    /**
     * Aplica la clase 'dark-theme' al body y actualiza los estilos e iconos del botón de tema con alto contraste.
     * @param {string} theme - Nombre del tema ('light' | 'dark').
     */
    function applyTheme(theme) {
        const body = document.body;
        const themeIcon = document.getElementById('theme-icon');
        const themeBtn = document.getElementById('theme-toggle-btn');

        if (theme === 'dark') {
            body.classList.add('dark-theme');
            if (themeIcon) {
                themeIcon.className = "fa-solid fa-sun text-amber-400 text-sm";
            }
            if (themeBtn) {
                themeBtn.setAttribute('aria-checked', 'true');
                themeBtn.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-amber-400 transition-all active:scale-95 duration-150 flex items-center justify-center gap-1.5 font-clean border border-slate-700/80 shadow-sm";
            }
        } else {
            body.classList.remove('dark-theme');
            if (themeIcon) {
                themeIcon.className = "fa-solid fa-moon text-cyan-500 text-sm";
            }
            if (themeBtn) {
                themeBtn.setAttribute('aria-checked', 'false');
                themeBtn.className = "px-3 py-1.5 rounded-xl text-xs font-bold bg-white/80 hover:bg-white text-slate-800 transition-all active:scale-95 duration-150 flex items-center justify-center gap-1.5 font-clean border border-white/60 shadow-sm";
            }
        }
    }

    /**
     * Alterna el idioma entre 'es' y 'en', actualiza las traducciones y la hora del reloj.
     */
    function toggleLang() {
        currentLang = currentLang === 'es' ? 'en' : 'es';
        localStorage.setItem('tiltclock_lang', currentLang);

        updateTranslations();

        if (typeof window.updateWatchTime === 'function') {
            window.updateWatchTime();
        }
    }

    /**
     * Actualiza todos los elementos traducibles del DOM según el idioma activo.
     */
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

    /**
     * Obtiene el código del idioma activo actualmente.
     * @returns {string} Código de idioma ('es' | 'en').
     */
    function getCurrentLang() {
        return currentLang;
    }

    /**
     * Obtiene el objeto de traducción para el idioma activo.
     * @returns {Object.<string, string|Array.<string>>} Objeto con las traducciones.
     */
    function getTranslations() {
        return TRANSLATIONS[currentLang];
    }

    /* Exponer API al ámbito global window */
    window.initThemeAndLang = initThemeAndLang;
    window.getCurrentLang = getCurrentLang;
    window.getTranslations = getTranslations;

    /* Auto-inicializar cuando el DOM esté listo */
    document.addEventListener("DOMContentLoaded", initThemeAndLang);
})();