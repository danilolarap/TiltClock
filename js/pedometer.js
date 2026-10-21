/* Podómetro interactivo con control manual, acelerómetro móvil, persistencia y anillo SVG */
window.stepCount = parseInt(localStorage.getItem('tiltclock_steps'), 10) || 1259;
const GOAL_STEPS = 10000;
let lastAccelY = 0;
let lastStepTime = 0;

function initPedometer() {
    const watchSteps = document.getElementById("watch-steps");
    const stepInput = document.getElementById("step-input");
    const stepProgressRing = document.getElementById("step-progress-ring");

    /* Actualizar UI, progreso del anillo SVG y guardar en localStorage */
    function updateStepUI() {
        if (watchSteps) {
            watchSteps.innerText = window.stepCount.toLocaleString();
        }

        if (stepInput && document.activeElement !== stepInput) {
            stepInput.value = window.stepCount;
        }

        if (stepProgressRing) {
            const radius = 80;
            const circumference = 2 * Math.PI * radius;
            const progress = Math.min(Math.max(window.stepCount, 0) / GOAL_STEPS, 1);
            const offset = circumference - progress * circumference;

            stepProgressRing.style.strokeDasharray = `${circumference} ${circumference}`;
            stepProgressRing.style.strokeDashoffset = offset;
        }

        /* Guardar conteo actual de pasos en el almacenamiento local */
        localStorage.setItem('tiltclock_steps', window.stepCount);
    }

    /* Modificar pasos mediante botones + / - */
    window.addSteps = function (amount) {
        if (typeof window.requestGyroPermission === "function") {
            window.requestGyroPermission();
        }
        window.stepCount = Math.max(0, window.stepCount + amount);
        updateStepUI();
    };

    /* Ajustar pasos directamente desde el campo numérico */
    window.setStepsFromInput = function (value) {
        const parsed = parseInt(value, 10);
        window.stepCount = isNaN(parsed) ? 0 : Math.max(0, parsed);
        updateStepUI();
    };

    /* Escuchar cambios directos en el input */
    if (stepInput) {
        stepInput.addEventListener("input", (e) => {
            window.setStepsFromInput(e.target.value);
        });
    }

    /* Detección física vía Acelerómetro en dispositivos móviles y Smartwatches */
    if (window.DeviceMotionEvent) {
        window.addEventListener("devicemotion", (event) => {
            const accel = event.accelerationIncludingGravity || event.acceleration;
            if (!accel || accel.y === null) return;

            const currentY = accel.y;
            const deltaY = Math.abs(currentY - lastAccelY);
            const now = Date.now();

            /* Umbral para contar un paso por movimiento/caminata */
            if (deltaY > 2.2 && (now - lastStepTime) > 320) {
                window.stepCount++;
                lastStepTime = now;
                updateStepUI();
            }
            lastAccelY = currentY;
        }, true);
    }

    /* Exponer función de actualización de interfaz globalmente */
    window.updateStepUI = updateStepUI;
    updateStepUI();
}

document.addEventListener("DOMContentLoaded", initPedometer);