/* Módulo de Giroscopio e Inclinación 3D para móviles y Vercel */
window.gyroData = { beta: 0, gamma: 0 };
let isGyroPermissionGranted = false;

function initGyroscope() {
    /* Escuchar orientación en navegadores que no requieren permiso previo */
    if (window.DeviceOrientationEvent && !isGyroPermissionGranted) {
        window.addEventListener("deviceorientation", handleOrientation, true);
    }
}

function handleOrientation(event) {
    if (event.beta === null || event.gamma === null) return;

    /* Limitar rango de inclinación para mantener el avatar dentro del marco del reloj */
    const beta = Math.max(-45, Math.min(45, event.beta));   /* Inclinación eje X (arriba/abajo) */
    const gamma = Math.max(-45, Math.min(45, event.gamma)); /* Inclinación eje Y (izquierda/derecha) */

    window.gyroData.beta = beta;
    window.gyroData.gamma = gamma;
}

/* Solicitar permiso explícito de sensores (Obligatorio en iOS 13+ y recomendación en HTTPS) */
window.requestGyroPermission = async function () {
    if (isGyroPermissionGranted) return true;

    try {
        /* Solicitud para iOS DeviceOrientationEvent */
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === "granted") {
                window.addEventListener("deviceorientation", handleOrientation, true);
                isGyroPermissionGranted = true;
            }
        } else {
            /* Android / Navegadores estándar */
            window.addEventListener("deviceorientation", handleOrientation, true);
            isGyroPermissionGranted = true;
        }

        /* Solicitud para Acelerómetro/Podómetro en iOS */
        if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
            await DeviceMotionEvent.requestPermission();
        }

        return isGyroPermissionGranted;
    } catch (error) {
        console.warn("Permiso de sensores no concedido o no soportado en este dispositivo:", error);
        return false;
    }
};

/* Inicializar al cargar */
document.addEventListener("DOMContentLoaded", initGyroscope);