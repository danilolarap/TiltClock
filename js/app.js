/**
 * @fileoverview Orquestador principal de la aplicación TiltClock.
 * Gestiona el reloj digital en tiempo real, el formateo i18n de fecha/hora,
 * la carga de modelos .GLB del usuario y la inicialización centralizada de componentes.
 *
 * @author Danilo Lara <danilolarap>
 */

/**
 * Actualiza la hora y la fecha formateada en la pantalla del smartwatch.
 * Utiliza las traducciones de días y meses según el idioma activo.
 */
function updateWatchTime() {
    const now = new Date();

    const timeElem = document.getElementById("watch-time");
    const ampmElem = document.getElementById("watch-ampm");
    const dateElem = document.getElementById("watch-date");

    /* Formato de hora de 12 horas con ceros a la izquierda */
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, "0");

    if (timeElem) timeElem.innerText = `${formattedHours}:${minutes}`;
    if (ampmElem) ampmElem.innerText = ampm;

    /* Formateo de fecha internacionalizada */
    if (dateElem) {
        const t = typeof window.getTranslations === "function" ? window.getTranslations() : null;
        
        const dayNames = t && t.days ? t.days : ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        const monthNames = t && t.months ? t.months : ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

        const dayName = dayNames[now.getDay()];
        const dayNum = now.getDate();
        const monthName = monthNames[now.getMonth()];

        dateElem.innerText = `${dayName}, ${dayNum} ${monthName}`;
    }
}

/**
 * Vincula el evento de selección de archivo local para cargar modelos custom .GLB/.GLTF.
 */
function initFileUpload() {
    const glbInput = document.getElementById("glb-input");
    if (!glbInput) return;

    glbInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file && typeof window.loadGLBModel === "function") {
            window.loadGLBModel(file);
        }
    });
}

/**
 * Inicializador global ejecutado al completar la carga del DOM.
 */
document.addEventListener("DOMContentLoaded", () => {
    updateWatchTime();
    setInterval(updateWatchTime, 1000);

    if (typeof window.initDeviceSelector === "function") {
        window.initDeviceSelector();
    }

    if (typeof window.initAvatar3D === "function") {
        window.initAvatar3D();
    }

    initFileUpload();
});

/* Exponer función de actualización de tiempo globalmente */
window.updateWatchTime = updateWatchTime;