/* Selector de dispositivos con persistencia */
(function () {
    /* Tipos permitidos */
    const DEVICES = {
        CIRCULAR: 'circular',
        SQUARE: 'square',
        BAND: 'band'
    };

    /* Cargar dispositivo guardado */
    let currentDevice = localStorage.getItem('tiltclock_device') || DEVICES.CIRCULAR;

    /* Inicializar eventos */
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

        /* Aplicar dispositivo inicial cargado de localStorage */
        if (currentDevice !== DEVICES.CIRCULAR) {
            setDevice(currentDevice);
        }
    }

    /* Cambiar dispositivo */
    function setDevice(deviceType) {
        currentDevice = deviceType;
        localStorage.setItem('tiltclock_device', deviceType);

        const watchFrame = document.getElementById('watch-frame');
        const strapTop = document.getElementById('watch-strap-top');
        const strapBottom = document.getElementById('watch-strap-bottom');
        const crownButton = document.getElementById('watch-crown');
        const sideButton = document.getElementById('watch-side-btn');

        if (!watchFrame) return;

        /* Limpiar clases */
        Object.values(DEVICES).forEach((d) => {
            watchFrame.classList.remove(`device-${d}`);
            if (strapTop) strapTop.classList.remove(`device-${d}`);
            if (strapBottom) strapBottom.classList.remove(`device-${d}`);
        });

        /* Aplicar variante */
        watchFrame.classList.add(`device-${deviceType}`);
        if (strapTop) strapTop.classList.add(`device-${deviceType}`);
        if (strapBottom) strapBottom.classList.add(`device-${deviceType}`);

        /* Ajustar botones */
        if (crownButton && sideButton) {
            if (deviceType === DEVICES.BAND) {
                crownButton.classList.add('hidden');
                sideButton.classList.add('hidden');
            } else {
                crownButton.classList.remove('hidden');
                sideButton.classList.remove('hidden');
            }
        }

        /* Actualizar botones UI */
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

        /* Redimensionar 3D al finalizar la animación CSS */
        if (typeof window.onWindowResize === 'function') {
            setTimeout(() => {
                window.onWindowResize();
            }, 350);
        }
    }

    /* Funciones globales */
    window.initDeviceSelector = initDeviceSelector;
    window.setDevice = setDevice;
})();