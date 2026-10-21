/* Módulo de Selección de Formato de Smartwatch con Persistencia en localStorage */
(function () {
    /* Formatos de reloj permitidos */
    const DEVICES = {
        CIRCULAR: 'circular',
        SQUARE: 'square',
        BAND: 'band'
    };

    /* Cargar dispositivo guardado previamente en localStorage */
    let currentDevice = localStorage.getItem('tiltclock_device') || DEVICES.CIRCULAR;

    /* Inicialización de eventos e interfaz */
    function initDeviceSelector() {
        const buttons = document.querySelectorAll('[data-device-target]');
        if (!buttons.length) return;

        buttons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const targetDevice = btn.getAttribute('data-device-target');
                if (targetDevice && targetDevice !== currentDevice) {
                    setDevice(targetDevice);
                }
            });
        });

        /* Aplicar estado inicial según el formato guardado */
        setDevice(currentDevice);
    }

    /* Cambiar la variante visual del smartwatch */
    function setDevice(deviceType) {
        currentDevice = deviceType;
        localStorage.setItem('tiltclock_device', deviceType);

        const watchFrame = document.getElementById('watch-frame');
        const strapTop = document.getElementById('watch-strap-top');
        const strapBottom = document.getElementById('watch-strap-bottom');
        const crownButton = document.getElementById('watch-crown');
        const sideButton = document.getElementById('watch-side-btn');

        if (!watchFrame) return;

        /* Limpiar clases de dispositivos previos */
        Object.values(DEVICES).forEach((d) => {
            watchFrame.classList.remove(`device-${d}`);
            if (strapTop) strapTop.classList.remove(`device-${d}`);
            if (strapBottom) strapBottom.classList.remove(`device-${d}`);
        });

        /* Aplicar nueva clase de variante visual */
        watchFrame.classList.add(`device-${deviceType}`);
        if (strapTop) strapTop.classList.add(`device-${deviceType}`);
        if (strapBottom) strapBottom.classList.add(`device-${deviceType}`);

        /* Ocultar o mostrar botones físicos según el formato (e.g. Band no usa corona física) */
        if (crownButton && sideButton) {
            if (deviceType === DEVICES.BAND) {
                crownButton.classList.add('hidden');
                sideButton.classList.add('hidden');
            } else {
                crownButton.classList.remove('hidden');
                sideButton.classList.remove('hidden');
            }
        }

        /* Actualizar el estado visual activo de los botones del selector */
        document.querySelectorAll('[data-device-target]').forEach((btn) => {
            const isSelected = btn.getAttribute('data-device-target') === deviceType;
            if (isSelected) {
                btn.classList.add('bg-cyan-500', 'text-white', 'shadow');
                btn.classList.remove('text-slate-600', 'hover:bg-slate-200');
            } else {
                btn.classList.remove('bg-cyan-500', 'text-white', 'shadow');
                btn.classList.add('text-slate-600', 'hover:bg-slate-200');
            }
        });

        /* Notificar al lienzo de Three.js para reajustar camara y proyeccion */
        if (typeof window.onWindowResize === 'function') {
            setTimeout(() => {
                window.onWindowResize();
            }, 350);
        }
    }

    /* Exponer funciones a la API global */
    window.initDeviceSelector = initDeviceSelector;
    window.setDevice = setDevice;

    /* Auto-inicializar cuando el DOM esté listo */
    document.addEventListener("DOMContentLoaded", initDeviceSelector);
})();