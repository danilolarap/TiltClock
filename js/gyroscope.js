window.gyroData = { beta: 0, gamma: 0 };

function initGyroscope() {
    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", (event) => {
            if (event.beta !== null && event.gamma !== null) {
                window.gyroData.beta = Math.round(event.beta);
                window.gyroData.gamma = Math.round(event.gamma);
            }
        });
    }

    // Simulación interactiva con el cursor en PC
    window.addEventListener("pointermove", (event) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        window.gyroData.gamma = Math.round(((event.clientX - cx) / cx) * 35);
        window.gyroData.beta = Math.round(((event.clientY - cy) / cy) * 35);
    });
}