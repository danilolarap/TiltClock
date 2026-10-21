/* Orquestador principal de la aplicación y ciclo de vida del reloj */
document.addEventListener("DOMContentLoaded", () => {
    /* Inicializar subsistemas del proyecto */
    if (typeof window.initGyroscope === "function") window.initGyroscope();
    if (typeof window.initPedometer === "function") window.initPedometer();
    if (typeof window.initAvatar3D === "function") window.initAvatar3D();
    if (typeof window.initDeviceSelector === "function") window.initDeviceSelector();
    if (typeof window.initThemeAndLang === "function") window.initThemeAndLang();

    let lastTimeString = "";
    let lastDateString = "";

    /* Actualizar la hora y fecha en la pantalla del smartwatch */
    function updateWatchTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12;
        const formattedHours = String(hours).padStart(2, "0");
        const currentTimeString = `${formattedHours}:${minutes}`;

        const watchTimeElem = document.getElementById("watch-time");
        const watchAmpmElem = document.getElementById("watch-ampm");
        const watchDateElem = document.getElementById("watch-date");

        /* Evitar manipulaciones innecesarias del DOM si la hora no ha cambiado */
        if (watchTimeElem && currentTimeString !== lastTimeString) {
            watchTimeElem.innerText = currentTimeString;
            lastTimeString = currentTimeString;
        }

        if (watchAmpmElem) {
            watchAmpmElem.innerText = ampm;
        }

        /* Formatear y traducir fecha según el idioma activo */
        if (watchDateElem) {
            const t = typeof window.getTranslations === "function" ? window.getTranslations() : null;
            let formattedDate = "";

            if (t && t.days && t.months) {
                const dayName = t.days[now.getDay()];
                const monthName = t.months[now.getMonth()];
                const dateNum = now.getDate();
                formattedDate = `${dayName}, ${dateNum} ${monthName}`;
            } else {
                const options = { weekday: 'short', day: 'numeric', month: 'short' };
                formattedDate = now.toLocaleDateString('es-ES', options).toUpperCase();
            }

            if (formattedDate !== lastDateString) {
                watchDateElem.innerText = formattedDate;
                lastDateString = formattedDate;
            }
        }
    }

    /* Exponer función globalmente para actualizar de inmediato al cambiar idioma */
    window.updateWatchTime = updateWatchTime;

    /* Sincronización eficiente del tiempo */
    updateWatchTime();
    setInterval(updateWatchTime, 1000);

    /* Manejo del input de carga de archivos de modelos 3D (.GLB) */
    const glbInput = document.getElementById("glb-input");
    if (glbInput) {
        glbInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file && file.name.toLowerCase().endsWith(".glb")) {
                if (typeof window.loadGLBModel === "function") {
                    window.loadGLBModel(file);
                }
            } else if (file) {
                console.warn("El archivo seleccionado debe ser un modelo .GLB válido.");
            }
        });
    }
});