# ⌚ TiltClock 3D - Smartwatch Watchface UI

![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)
![Three.js](https://img.shields.io/badge/3D-Three.js_r128-000000?style=flat-square&logo=three.js)
![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)

**TiltClock 3D** es una interfaz interactiva de watchface para smartwatch que integra avatares 3D optimizados en formato `.glb`, decodificación Draco, giroscopio y acelerómetro nativo para dispositivos móviles y relojes inteligentes, podómetro interactivo y personalización multimodelo (Circular, Apple Watch y Xiaomi Band).

---

## 🚀 Características Principales

- **Modelos 3D e Interactividad Híbrida:** 
  - Soporte para rotación libre por puntero (*hover*), arrastre manual (*click & drag*), gestos táctiles (*pinch zoom* y *hold zoom*) y giroscopio/acelerómetro en móviles y smartwatches.
  - Carga y compresión de modelos 3D con `DRACOLoader` de Three.js (rango liviano de 5 a 9 MB por avatar).
- **Formatos de Dispositivo:** Selección dinámica entre vistas de pantalla Circular (Round), Apple Watch (Square) y Xiaomi Band.
- **Persistencia de Estado:** Guarda automáticamente en `localStorage` el formato de reloj elegido, los pasos acumulados, el escalado del avatar, el tema (Claro/Oscuro) y el idioma preferido.
- **Internacionalización y Temas:** Soporte multilenguaje (Español e Inglés) y modo oscuro nativo.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5 & CSS3:** Estructura semántica y diseño adaptativo con Tailwind CSS y FontAwesome.
- **JavaScript (ES6+):** Arquitectura modular sin dependencias pesadas de frameworks en el cliente.
- **Three.js (r128):** Motor gráfico 3D con iluminaciones PBR, mapa de sombras y decodificación Draco via Google CDN.

---

## 💻 Instalación y Uso Local

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/danilolarap/TiltClock.git](https://github.com/danilolarap/TiltClock.git)