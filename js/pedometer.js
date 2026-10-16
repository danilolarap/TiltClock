/* Podómetro con actualización de anillo de meta */
window.stepCount = 1259;
const GOAL_STEPS = 10000;
let lastAccelY = 0;
let lastStepTime = 0;

function initPedometer() {
    const watchSteps = document.getElementById("watch-steps");
    const stepProgressRing = document.getElementById("step-progress-ring");

    function updateStepUI() {
        if (watchSteps) {
            watchSteps.innerText = window.stepCount.toLocaleString();
        }

        /* Actualizar anillo SVG */
        if (stepProgressRing) {
            const radius = 80;
            const circumference = 2 * Math.PI * radius;
            const progress = Math.min(window.stepCount / GOAL_STEPS, 1);
            const offset = circumference - progress * circumference;

            stepProgressRing.style.strokeDasharray = `${circumference} ${circumference}`;
            stepProgressRing.style.strokeDashoffset = offset;
        }
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

    /* Incremento simulado */
    setInterval(() => {
        window.stepCount += Math.floor(Math.random() * 2);
        updateStepUI();
    }, 4000);

    updateStepUI();
}