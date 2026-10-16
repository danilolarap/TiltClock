/* Podómetro interactivo con control manual y anillo SVG */
window.stepCount = 1259;
const GOAL_STEPS = 10000;
let lastAccelY = 0;
let lastStepTime = 0;

function initPedometer() {
    const watchSteps = document.getElementById("watch-steps");
    const stepInput = document.getElementById("step-input");
    const stepProgressRing = document.getElementById("step-progress-ring");

    /* Actualizar UI y anillo SVG */
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
    }

    /* Modificar pasos con botones + / - */
    window.addSteps = function (amount) {
        window.stepCount = Math.max(0, window.stepCount + amount);
        updateStepUI();
    };

    /* Cambiar pasos directamente desde el input */
    window.setStepsFromInput = function (value) {
        const parsed = parseInt(value, 10);
        window.stepCount = isNaN(parsed) ? 0 : Math.max(0, parsed);
        updateStepUI();
    };

    /* Evento para input directo */
    if (stepInput) {
        stepInput.addEventListener("input", (e) => {
            window.setStepsFromInput(e.target.value);
        });
    }

    /* Detección vía Acelerómetro Móvil */
    if (window.DeviceMotionEvent) {
        window.addEventListener("devicemotion", (event) => {
            const accel = event.accelerationIncludingGravity;
            if (!accel || accel.y === null) return;

            const currentY = accel.y;
            const deltaY = Math.abs(currentY - lastAccelY);
            const now = Date.now();

            if (deltaY > 2.5 && (now - lastStepTime) > 350) {
                window.stepCount++;
                lastStepTime = now;
                updateStepUI();
            }
            lastAccelY = currentY;
        });
    }

    /* Exponer para actualizaciones globales */
    window.updateStepUI = updateStepUI;
    updateStepUI();
}