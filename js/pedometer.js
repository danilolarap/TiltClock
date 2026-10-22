/**
 * @fileoverview Módulo de podómetro interactivo para TiltClock.
 * Incluye detección de pasos en tiempo real vía Acelerómetro (DeviceMotion),
 * control manual con entrada de texto, botones dinámicos +/-, renderizado de anillo SVG
 * y persistencia en localStorage.
 *
 * @author Danilo Lara <danilolarap>
 */

window.stepCount = parseInt(localStorage.getItem('tiltclock_steps'), 10) || 1259;
const GOAL_STEPS = 10000;
let lastAccelY = 0;
let lastStepTime = 0;

/**
 * Inicializa los eventos del podómetro, escuchadores del acelerómetro y la interfaz.
 */
function initPedometer() {
    const watchSteps = document.getElementById("watch-steps");
    const stepInput = document.getElementById("step-input");
    const stepProgressRing = document.getElementById("step-progress-ring");

    /**
     * Actualiza la interfaz de usuario, recalcula el trazo del anillo SVG y guarda en localStorage.
     */
    function updateStepUI() {
        if (watchSteps) {
            watchSteps.innerText = window.stepCount.toLocaleString("es-ES");
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

        localStorage.setItem('tiltclock_steps', window.stepCount);
    }

    /**
     * Incrementa o decrementa la cantidad de pasos mediante los botones de la interfaz.
     * @param {number} amount - Pasos a sumar o restar.
     */
    window.addSteps = function (amount) {
        if (typeof window.requestGyroPermission === "function") {
            window.requestGyroPermission();
        }
        window.stepCount = Math.max(0, window.stepCount + amount);
        updateStepUI();
    };

    /**
     * Ajusta el conteo de pasos directamente desde el valor numérico ingresado en el input.
     * @param {string|number} value - Valor numérico ingresado por el usuario.
     */
    window.setStepsFromInput = function (value) {
        const parsed = parseInt(value, 10);
        window.stepCount = isNaN(parsed) ? 0 : Math.max(0, parsed);
        updateStepUI();
    };

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

    window.updateStepUI = updateStepUI;
    updateStepUI();
}

document.addEventListener("DOMContentLoaded", initPedometer);