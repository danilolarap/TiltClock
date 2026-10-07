document.addEventListener("DOMContentLoaded", () => {
    initGyroscope();
    initPedometer();
    initAvatar3D();

    // Actualizar Reloj en Tiempo Real
    function updateWatchTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12;
        const formattedHours = String(hours).padStart(2, "0");

        document.getElementById("watch-time").innerText = `${formattedHours}:${minutes}`;
        document.getElementById("watch-ampm").innerText = ampm;

        // Fecha
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        const dateStr = now.toLocaleDateString('es-ES', options).toUpperCase();
        document.getElementById("watch-date").innerText = dateStr;
    }

    setInterval(updateWatchTime, 1000);
    updateWatchTime();

    // Evento para Cargar Archivo .GLB
    const glbInput = document.getElementById("glb-input");
    if (glbInput) {
        glbInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                window.loadGLBModel(file);
            }
        });
    }
});