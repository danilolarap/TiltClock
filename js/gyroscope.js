/**
 * @fileoverview Módulo de captura y procesamiento de datos del giroscopio para TiltClock.
 * Captura la orientación del dispositivo (DeviceOrientation), aplica un filtro de
 * suavizado paso bajo (Low-Pass Filter) para atenuar ruido y gestiona la solicitud
 * de permisos explícitos en navegadores móviles (iOS / Safari).
 *
 * @author Danilo Lara <danilolarap>
 */

/**
 * Objeto global con los ángulos de rotación suavizados.
 * @type {{beta: number|null, gamma: number|null, alpha: number|null}}
 */
window.gyroData = {
    beta: null,
    gamma: null,
    alpha: null
};

/** @type {boolean} Estado de permisos concedidos para la orientación del dispositivo. */
let gyroPermissionGranted = false;

/**
 * Solicita permisos explícitos al usuario para acceder a DeviceOrientationEvent (requerido en iOS 13+).
 */
function requestGyroPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then((response) => {
                if (response === 'granted') {
                    gyroPermissionGranted = true;
                    bindGyroEvents();
                }
            })
            .catch(console.error);
    } else {
        gyroPermissionGranted = true;
        bindGyroEvents();
    }
}

/**
 * Vincula los escuchadores de eventos para la orientación del dispositivo y aplica el filtro paso bajo.
 */
function bindGyroEvents() {
    if (!window.DeviceOrientationEvent) return;

    window.addEventListener('deviceorientation', (e) => {
        if (e.beta === null || e.gamma === null) return;

        /* Filtro paso bajo (alpha = 0.15) para suavizar pequeñas vibraciones */
        const filterFactor = 0.15;

        if (window.gyroData.beta === null) {
            window.gyroData.beta = e.beta;
            window.gyroData.gamma = e.gamma;
            window.gyroData.alpha = e.alpha;
        } else {
            window.gyroData.beta += (e.beta - window.gyroData.beta) * filterFactor;
            window.gyroData.gamma += (e.gamma - window.gyroData.gamma) * filterFactor;
            if (e.alpha !== null && window.gyroData.alpha !== null) {
                window.gyroData.alpha += (e.alpha - window.gyroData.alpha) * filterFactor;
            }
        }
    }, true);
}

/**
 * Inicializa el módulo de giroscopio al cargar la página.
 */
function initGyroscope() {
    bindGyroEvents();
}

/* Exponer funciones en el ámbito global window */
window.requestGyroPermission = requestGyroPermission;
window.initGyroscope = initGyroscope;

document.addEventListener("DOMContentLoaded", initGyroscope);