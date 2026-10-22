# TiltClock 3D

## Descripción General

TiltClock 3D es una interfaz de usuario interactiva para esferas de reloj inteligente (watchfaces) desarrollada con tecnologías web modernas y renderizado 3D en tiempo real. El proyecto integra un motor de renderizado basado en Three.js con soporte para decodificación comprimida Draco, giroscopio y acelerómetro nativo para dispositivos móviles y smartwatches, podómetro dinámico e internacionalización.

El diseño permite alternar dinámicamente entre múltiples formatos de chasis de reloj (Circular, Apple Watch y Xiaomi Band) manteniendo la persistencia de estado del usuario mediante almacenamiento local.

---

## Características Técnicas

* **Renderizado 3D y Control Híbrido:**
  * Carga y procesamiento de modelos 3D en formato `.glb` optimizados mediante `DRACOLoader` de Three.js (rango de peso comprimido entre 5 y 9 MB).
  * Control de rotación multinivel: seguimiento orbital por posición de puntero (*hover*), rotación libre por arrastre manual (*click & drag*), gestos táctiles (*pinch zoom* y *hold zoom*) y respuesta a orientación física (*DeviceOrientation* / *DeviceMotion*).
* **Formatos de Dispositivo:**
  * Variaciones visuales adaptativas para pantallas circulares, rectangulares (Apple Watch) y formato banda (Xiaomi Band) con ajuste dinámico del viewport WebGL.
* **Persistencia de Estado:**
  * Almacenamiento local mediante `localStorage` para el registro de pasos, modelo de reloj seleccionado, factor de escala del avatar, tema preferido e idioma.
* **Internacionalización y Tematización:**
  * Sistema de traducción dinámico para español e inglés sin recarga de página.
  * Selector de tema claro y oscuro con ajuste de contraste y sombreado PBR.

---

## Tecnologías Utilizadas

* **Motor Gráfico:** Three.js (r128) con mapa de sombras suaves (`PCFSoftShadowMap`) y mapeo de tonos (`ACESFilmicToneMapping`).
* **Compresión 3D:** Google Draco Decoder CDN (1.4.3).
* **Diseño y Estilos:** HTML5, CSS3, Tailwind CSS y FontAwesome.
* **Lógica del Cliente:** JavaScript modular (ES6+) estructurado en arquitectura orientada a eventos.

---

## Estructura del Proyecto

```text
TiltClock/
├── assets/
│   └── models/          # Modelos 3D comprimidos (.glb)
├── css/
│   └── styles.css       # Hojas de estilo personalizadas y animaciones
├── js/
│   ├── app.js           # Orquestador principal y ciclo de vida de la aplicación
│   ├── avatar3d.js      # Escena, luces, renderizador WebGL y controles de interacción
│   ├── deviceSelector.js# Gestión de formatos de chasis de reloj
│   ├── gyroscope.js     # Captura de orientación de dispositivo y gestión de permisos
│   ├── pedometer.js     # Lógica del podómetro, acelerómetro y calculador SVG
│   └── themeAndLang.js  # Gestor de internacionalización (i18n) y tema visual
├── .editorconfig        # Estandarización de formato de código
├── .gitignore           # Reglas de exclusión para control de versiones
├── index.html           # Estructura principal DOM
├── LICENSE              # Licencia de código abierto MIT
└── README.md            # Documentación técnica del repositorio

## Instalación y Uso

1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/danilolarap/TiltClock.git](https://github.com/danilolarap/TiltClock.git)

## Autor

Desarrollado por [Danilo Lara](https://github.com/danilolarap).

## Licencia

Este proyecto se encuentra bajo la Licencia MIT. Para más detalles, consulte el archivo `LICENSE`.