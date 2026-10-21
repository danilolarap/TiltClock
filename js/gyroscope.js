/* Módulo de Giroscopio e Inclinación con Filtro de Suavizado para Móviles y Smartwatches */
window.gyroData = null;
let isGyroPermissionGranted = false;
let isListening = false;

/* Variables para el filtro de suavizado (Low-pass filter) */
let smoothedBeta = 0;
let smoothedGamma = 0;
const SMOOTHING_FACTOR = 0.15;

function initGyroscope() {
    if (window.DeviceOrientationEvent && !isGyroPermissionGranted) {
        attachOrientationListener();
    }
}

function attachOrientationListener() {
    if (!isListening) {
        window.addEventListener("deviceorientation", handleOrientation, true);
        isListening = true;
    }
}

function handleOrientation(event) {
    /* Si el dispositivo no envía lecturas reales (ej. PC de escritorio), mantener en null */
    if (event.beta === null || event.gamma === null) {
        window.gyroData = null;
        return;
    }

    /* Limitar el rango de inclinación para evitar giros excesivos en la pantalla del reloj */
    const rawBeta = Math.max(-45, Math.min(45, event.beta));   /* Eje X (Inclinación frontal/muñeca) */
    const rawGamma = Math.max(-45, Math.min(45, event.gamma)); /* Eje Y (Inclinación lateral) */

    /* Filtro de suavizado paso bajo para eliminar el temblor natural de la mano */
    smoothedBeta += (rawBeta - smoothedBeta) * SMOOTHING_FACTOR;
    smoothedGamma += (rawGamma - smoothedGamma) * SMOOTHING_FACTOR;

    window.gyroData = {
        beta: smoothedBeta,
        gamma: smoothedGamma
    };
}

/* Solicitar permisos de sensores nativos (Compatibilidad con watchOS, Wear OS, iOS y Android) */
window.requestGyroPermission = async function () {
    if (isGyroPermissionGranted) return true;

    try {
        /* Permiso DeviceOrientation en navegadores basados en WebKit (iOS / watchOS) */
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === "granted") {
                attachOrientationListener();
                isGyroPermissionGranted = true;
            }
        } else {
            attachOrientationListener();
            isGyroPermissionGranted = true;
        }

        /* Permiso DeviceMotion para sensores de acelerómetro del podómetro */
        if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
            await DeviceMotionEvent.requestPermission();
        }

        return isGyroPermissionGranted;
    } catch (error) {
        console.warn("Permisos de giroscopio o acelerómetro denegados/no soportados:", error);
        return false;
    }
};

/* Exponer estado de permisos */
window.isGyroGranted = function () {
    return isGyroPermissionGranted;
};

document.addEventListener("DOMContentLoaded", initGyroscope);