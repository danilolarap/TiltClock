window.stepCount = 1259;
let lastAccelY = 0;
let lastStepTime = 0;

function initPedometer() {
    const watchSteps = document.getElementById("watch-steps");

    function updateStepUI() {
        if (watchSteps) {
            watchSteps.innerText = window.stepCount.toLocaleString();
        }
    }

    // Detección real vía Acelerómetro Móvil
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

    // Incremento suave periódico
    setInterval(() => {
        window.stepCount += Math.floor(Math.random() * 2);
        updateStepUI();
    }, 4000);

    updateStepUI();
}