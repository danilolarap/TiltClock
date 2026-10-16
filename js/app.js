/* Carga inicial */
document.addEventListener("DOMContentLoaded", () => {
    initGyroscope();
    initPedometer();
    initAvatar3D();
    if (typeof window.initDeviceSelector === "function") {
        window.initDeviceSelector();
    }
    if (typeof window.initThemeAndLang === "function") {
        window.initThemeAndLang();
    }

    /* Actualizar tiempo */
    function updateWatchTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12;
        const formattedHours = String(hours).padStart(2, "0");

        const watchTimeElem = document.getElementById("watch-time");
        const watchAmpmElem = document.getElementById("watch-ampm");
        const watchDateElem = document.getElementById("watch-date");

        if (watchTimeElem) watchTimeElem.innerText = `${formattedHours}:${minutes}`;
        if (watchAmpmElem) watchAmpmElem.innerText = ampm;

        /* Formatear fecha */
        if (watchDateElem) {
            const t = typeof window.getTranslations === "function" ? window.getTranslations() : null;
            if (t) {
                const dayName = t.days[now.getDay()];
                const monthName = t.months[now.getMonth()];
                const dateNum = now.getDate();
                watchDateElem.innerText = `${dayName}, ${dateNum} ${monthName}`;
            } else {
                const options = { weekday: 'short', day: 'numeric', month: 'short' };
                watchDateElem.innerText = now.toLocaleDateString('es-ES', options).toUpperCase();
            }
        }
    }

    /* Exponer función */
    window.updateWatchTime = updateWatchTime;

    /* Bucle tiempo */
    setInterval(updateWatchTime, 1000);
    updateWatchTime();

    /* Cargar GLB */
    const glbInput = document.getElementById("glb-input");
    if (glbInput) {
        glbInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file && typeof window.loadGLBModel === "function") {
                window.loadGLBModel(file);
            }
        });
    }
});