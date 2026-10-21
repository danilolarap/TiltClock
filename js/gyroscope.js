/* Módulo de Giroscopio e Inclinación para Móviles y Smartwatches */
window.gyroData = null;
let isGyroPermissionGranted = false;

function initGyroscope() {
    if (window.DeviceOrientationEvent && !isGyroPermissionGranted) {
        window.addEventListener("deviceorientation", handleOrientation, true);
    }
}

function handleOrientation(event) {
    /* Si el dispositivo no envía lecturas de inclinación reales (ej. PC de escritorio), mantener en null */
    if (event.beta === null || event.gamma === null) {
        window.gyroData = null;
        return;
    }

    /* Limitar el rango de inclinación para evitar giros excesivos en la pantalla del reloj */
    const beta = Math.max(-45, Math.min(45, event.beta));   /* Eje X (Inclinación frontal/muñeca) */
    const gamma = Math.max(-45, Math.min(45, event.gamma)); /* Eje Y (Inclinación lateral) */

    window.gyroData = {
        beta: beta,
        gamma: gamma
    };
}

/* Solicitar permisos de sensores nativos (Compatibilidad con watchOS, Wear OS, iOS y Android en Vercel) */
window.requestGyroPermission = async function () {
    if (isGyroPermissionGranted) return true;

    try {
        /* Permiso DeviceOrientation */
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === "granted") {
                window.addEventListener("deviceorientation", handleOrientation, true);
                isGyroPermissionGranted = true;
            }
        } else {
            window.addEventListener("deviceorientation", handleOrientation, true);
            isGyroPermissionGranted = true;
        }

        /* Permiso DeviceMotion para Podómetro */
        if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
            await DeviceMotionEvent.requestPermission();
        }

        return isGyroPermissionGranted;
    } catch (error) {
        console.warn("Permisos de sensores no soportados o denegados en este dispositivo:", error);
        return false;
    }
};

document.addEventListener("DOMContentLoaded", initGyroscope);