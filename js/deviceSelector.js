/**
 * @fileoverview Módulo selector y conmutador de formato de dispositivo para TiltClock.
 * Alterna dinámicamente el marco visual del reloj (Circular, Apple Watch, Xiaomi Band),
 * actualiza el estado activo/inactivo de los botones del modal e informa al lienzo 3D.
 *
 * @author Danilo Lara <danilolarap>
 */

/**
 * Inicializa los eventos de clic en los botones de selección de dispositivo
 * y restaura el formato previo guardado en localStorage.
 */
function initDeviceSelector() {
    const deviceButtons = document.querySelectorAll("[data-device-target]");
    if (!deviceButtons.length) return;

    /* Cargar dispositivo guardado o usar circular por defecto */
    const savedDevice = localStorage.getItem("tiltclock_device") || "circular";
    setDeviceFormat(savedDevice);

    deviceButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetDevice = btn.getAttribute("data-device-target");
            if (targetDevice) {
                setDeviceFormat(targetDevice);
            }
        });
    });
}

/**
 * Aplica las clases CSS correspondientes al marco y las correas según el formato elegido,
 * actualiza la interfaz de los botones selector e informa al renderizador WebGL.
 *
 * @param {string} deviceType - Identificador del dispositivo ('circular' | 'square' | 'band').
 */
function setDeviceFormat(deviceType) {
    const watchFrame = document.getElementById("watch-frame");
    const strapTop = document.getElementById("watch-strap-top");
    const strapBottom = document.getElementById("watch-strap-bottom");
    const deviceButtons = document.querySelectorAll("[data-device-target]");

    if (!watchFrame) return;

    /* Lista de clases soportadas para limpieza */
    const deviceClasses = ["device-circular", "device-square", "device-band"];

    /* Remover clases anteriores */
    deviceClasses.forEach((cls) => {
        watchFrame.classList.remove(cls);
        if (strapTop) strapTop.classList.remove(cls);
        if (strapBottom) strapBottom.classList.remove(cls);
    });

    /* Agregar la nueva clase del dispositivo seleccionado */
    const targetClass = `device-${deviceType}`;
    watchFrame.classList.add(targetClass);
    if (strapTop) strapTop.classList.add(targetClass);
    if (strapBottom) strapBottom.classList.add(targetClass);

    /* Guardar en localStorage */
    localStorage.setItem("tiltclock_device", deviceType);

    /* Actualizar el estado visual de los botones en el modal estilo iOS */
    deviceButtons.forEach((btn) => {
        const isTarget = btn.getAttribute("data-device-target") === deviceType;
        if (isTarget) {
            btn.className = "px-3 py-2 rounded-2xl text-xs font-bold bg-cyan-500 text-white shadow-lg ring-2 ring-cyan-500/40 transition-all active:scale-95 duration-150 flex items-center justify-center gap-1.5 font-clean";
        } else {
            btn.className = "px-3 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60 transition-all active:scale-95 duration-150 flex items-center justify-center gap-1.5 font-clean";
        }
    });

    /* Notificar al motor 3D para recalcular la relación de aspecto del lienzo */
    if (typeof window.onWindowResize === "function") {
        setTimeout(window.onWindowResize, 50);
    }
}

/* Exponer funciones en el objeto global window */
window.initDeviceSelector = initDeviceSelector;
window.setDeviceFormat = setDeviceFormat;