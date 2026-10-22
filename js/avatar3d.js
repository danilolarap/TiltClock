/**
 * @fileoverview Módulo de renderizado 3D para TiltClock.
 * Gestiona el lienzo WebGL con Three.js, la carga e instanciación de modelos GLB/GLTF,
 * el control de escala dinámico, la decodificación Draco y las lecturas del giroscopio.
 *
 * @author Danilo Lara <danilolarap>
 */

let scene, camera, renderer, avatarMesh, orbitalRingsGroup, shadowPlane;
let mixer, clock, activeAction;
let isAnimationPlaying = true;
let baseTargetScale = 1.0;
let userScaleFactor = parseFloat(localStorage.getItem('tiltclock_scale')) || 1.0;

let zoomInterval = null;
let zoomTimeout = null;

/* Coordenadas para seguimiento en PC (Hover) */
let mouseTargetX = 0;
let mouseTargetY = 0;

/* Variables de interacción táctil (Smartwatches / Móviles) */
let isDragging = false;
let previousTouchPosition = { x: 0, y: 0 };
let initialPinchDistance = null;
let initialScaleOnPinch = 1.0;

/**
 * Diccionario de fuentes para los modelos 3D predefinidos (Presets).
 * Contiene URLs de respaldos y rutas locales.
 * @type {Object.<string, Array.<string>>}
 */
const PRESET_MODELS = {
    fox: [
        "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/Fox/glTF-Binary/Fox.glb",
        "assets/models/fox.glb"
    ],
    pajaro: ["assets/models/pajaro.glb"],
    mapache: ["assets/models/mapache.glb"],
    moneda: ["assets/models/moneda.glb"],
    riot: ["assets/models/riot.glb"]
};

/**
 * Instancia y configura un cargador GLTFLoader con soporte para decodificación Draco.
 * @returns {THREE.GLTFLoader} Cargador Three.js configurado.
 */
function createGLTFLoader() {
    const loader = new THREE.GLTFLoader();
    
    if (typeof THREE.DRACOLoader !== 'undefined') {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.3/');
        loader.setDRACOLoader(dracoLoader);
    }

    return loader;
}

/**
 * Inicializa el entorno 3D, cámaras, luces, sombras y renderizador WebGL.
 */
function initAvatar3D() {
    const container = document.getElementById("avatar-canvas-container");
    if (!container) return;

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 340;

    clock = new THREE.Clock();
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.8);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(2, 4, 3);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 10;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2.5, 6);
    pointLight.position.set(-2, 0, 2);
    scene.add(pointLight);

    const planeGeo = new THREE.PlaneGeometry(5, 5);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.25 });
    shadowPlane = new THREE.Mesh(planeGeo, planeMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.1;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    /* Restaurar avatar guardado previamente o cargar átomo por defecto */
    const savedAvatar = localStorage.getItem('tiltclock_avatar') || 'holo';
    if (savedAvatar === 'holo') {
        createHoloOrbitals();
    } else if (PRESET_MODELS[savedAvatar]) {
        window.loadPresetAvatar(savedAvatar);
    } else {
        createHoloOrbitals();
    }

    setupTouchAndMouseControls(container);

    window.addEventListener("resize", onWindowResize);
    animate();
}

/* Optimización de Energía: Pausar reloj de animación cuando la pestaña pierde foco */
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        if (clock && clock.running) clock.stop();
    } else {
        if (clock && !clock.running) clock.start();
    }
});

/**
 * Configura los eventos de interacción mouse y gestos táctiles (Pinch zoom / Drag).
 * @param {HTMLElement} container - Contenedor DOM del canvas.
 */
function setupTouchAndMouseControls(container) {
    window.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousTouchPosition.x;
            const deltaY = e.clientY - previousTouchPosition.y;

            mouseTargetY += deltaX * 0.008;
            mouseTargetX += deltaY * 0.008;

            previousTouchPosition = { x: e.clientX, y: e.clientY };
        } else {
            const windowHalfX = window.innerWidth / 2;
            const windowHalfY = window.innerHeight / 2;

            mouseTargetY = ((e.clientX - windowHalfX) / windowHalfX) * 0.8;
            mouseTargetX = ((e.clientY - windowHalfY) / windowHalfY) * 0.8;
        }
    });

    container.addEventListener("mousedown", (e) => {
        isDragging = true;
        previousTouchPosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    const canvasElement = container.querySelector('canvas') || container;

    canvasElement.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            previousTouchPosition = { 
                x: e.touches[0].clientX || e.touches[0].pageX, 
                y: e.touches[0].clientY || e.touches[0].pageY 
            };
        } else if (e.touches.length === 2) {
            isDragging = false;
            initialPinchDistance = getTouchDistance(e.touches);
            initialScaleOnPinch = userScaleFactor;
        }
    }, { passive: true });

    canvasElement.addEventListener("touchmove", (e) => {
        if (isDragging && e.touches.length === 1) {
            const currentX = e.touches[0].clientX || e.touches[0].pageX;
            const currentY = e.touches[0].clientY || e.touches[0].pageY;

            const deltaX = currentX - previousTouchPosition.x;
            const deltaY = currentY - previousTouchPosition.y;

            mouseTargetY += deltaX * 0.015;
            mouseTargetX += deltaY * 0.015;

            previousTouchPosition = { x: currentX, y: currentY };
        } else if (e.touches.length === 2 && initialPinchDistance) {
            const currentDistance = getTouchDistance(e.touches);
            const scaleFactor = currentDistance / initialPinchDistance;
            
            userScaleFactor = Math.max(0.3, Math.min(3.0, initialScaleOnPinch * scaleFactor));
            localStorage.setItem('tiltclock_scale', userScaleFactor.toFixed(2));
            applyAvatarScale();
        }
    }, { passive: true });

    canvasElement.addEventListener("touchend", () => {
        isDragging = false;
        initialPinchDistance = null;
    });

    canvasElement.addEventListener("touchcancel", () => {
        isDragging = false;
        initialPinchDistance = null;
    });
}

/**
 * Calcula la distancia en píxeles entre dos puntos táctiles para el gesto pinch-to-zoom.
 * @param {TouchList} touches - Lista de puntos de contacto táctil.
 * @returns {number} Distancia entre puntos.
 */
function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Actualiza la apariencia de los botones del selector de avatares en el header.
 * @param {string} activeType - Identificador del avatar actualmente activo.
 */
function updateAvatarButtonsUI(activeType) {
    const avatarButtons = document.querySelectorAll('button[onclick*="loadPresetAvatar"]');
    if (!avatarButtons.length) return;

    avatarButtons.forEach((btn) => {
        const onClickAttr = btn.getAttribute('onclick') || '';
        const isSelected = onClickAttr.includes(`'${activeType}'`);

        if (isSelected) {
            btn.classList.add('border-cyan-500', 'bg-cyan-500/10', 'ring-2', 'ring-cyan-500/40');
            btn.classList.remove('bg-slate-100', 'border-slate-200');
        } else {
            btn.classList.remove('border-cyan-500', 'bg-cyan-500/10', 'ring-2', 'ring-cyan-500/40');
            btn.classList.add('bg-slate-100', 'border-slate-200');
        }
    });
}

/**
 * Construye la escena 3D procedural del átomo holográfico por defecto.
 */
function createHoloOrbitals() {
    clearCurrentAvatar();
    localStorage.setItem('tiltclock_avatar', 'holo');
    updateAvatarButtonsUI('holo');

    orbitalRingsGroup = new THREE.Group();

    const ringMat = new THREE.MeshStandardMaterial({ 
        color: 0x06b6d4, 
        metalness: 0.9, 
        roughness: 0.1, 
        wireframe: true 
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.012, 16, 100), ringMat);
    ring1.rotation.x = Math.PI / 3;
    ring1.castShadow = true;
    orbitalRingsGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.012, 16, 100), ringMat);
    ring2.rotation.y = Math.PI / 4;
    ring2.castShadow = true;
    orbitalRingsGroup.add(ring2);

    const coreMat = new THREE.MeshStandardMaterial({ 
        color: 0x0891b2, 
        roughness: 0.15, 
        metalness: 0.85 
    });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 2), coreMat);
    core.castShadow = true;
    core.receiveShadow = true;
    orbitalRingsGroup.add(core);

    orbitalRingsGroup.scale.set(userScaleFactor, userScaleFactor, userScaleFactor);
    scene.add(orbitalRingsGroup);
}

/**
 * Carga un modelo 3D predefinido por su clave (ej. 'fox', 'pajaro', etc.).
 * @param {string} type - Clave del modelo preset.
 */
window.loadPresetAvatar = function(type) {
    if (type === 'holo') {
        createHoloOrbitals();
        return;
    }

    const sources = PRESET_MODELS[type];
    if (!sources || !sources.length) return;

    localStorage.setItem('tiltclock_avatar', type);
    updateAvatarButtonsUI(type);

    const loader = createGLTFLoader();

    function tryLoadSource(index) {
        if (index >= sources.length) {
            console.warn("No se pudo cargar el modelo preset.");
            return;
        }

        loader.load(
            sources[index],
            (gltf) => {
                setupLoadedGLTF(gltf);
            },
            undefined,
            (err) => {
                console.error("Error al cargar modelo:", err);
                tryLoadSource(index + 1);
            }
        );
    }

    tryLoadSource(0);
};

/**
 * Carga un archivo .GLB local proporcionado mediante un input file.
 * @param {File} file - Archivo binario de modelo 3D.
 */
window.loadGLBModel = function(file) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function(e) {
        const contents = e.target.result;
        const loader = createGLTFLoader();

        loader.parse(contents, "", (gltf) => {
            setupLoadedGLTF(gltf);
            updateAvatarButtonsUI('custom');
        });
    };
};

/**
 * Configura las propiedades de sombra, centrado y escala de un modelo GLTF cargado.
 * @param {Object} gltf - Objeto GLTF procesado por Three.js.
 */
function setupLoadedGLTF(gltf) {
    clearCurrentAvatar();

    const rawMesh = gltf.scene;

    rawMesh.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    const box = new THREE.Box3().setFromObject(rawMesh);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    rawMesh.position.x = -center.x;
    rawMesh.position.y = -center.y - 0.02;
    rawMesh.position.z = -center.z;

    const maxDim = Math.max(size.x, size.y, size.z);
    baseTargetScale = maxDim > 0 ? (2.8 / maxDim) : 2.8;

    avatarMesh = new THREE.Group();
    avatarMesh.add(rawMesh);

    applyAvatarScale();
    scene.add(avatarMesh);

    const animBtn = document.getElementById("anim-toggle-btn");
    if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(rawMesh);
        activeAction = mixer.clipAction(gltf.animations[0]);
        activeAction.play();
        isAnimationPlaying = true;

        if (animBtn) animBtn.classList.remove("hidden");
    } else {
        if (animBtn) animBtn.classList.add("hidden");
    }

    const btnWrapper = document.getElementById("upload-btn-wrapper");
    const btnText = document.getElementById("upload-btn-text");
    if (btnWrapper) {
        btnWrapper.className = "btn-state-loaded w-full flex justify-center";
    }
    if (btnText) {
        const t = typeof window.getTranslations === "function" ? window.getTranslations() : null;
        btnText.innerText = t ? t.uploadLoaded : "Cambiar .GLB";
    }

    onWindowResize();
}

/**
 * Recorre y libera de la memoria GPU todas las geometrías y materiales de un objeto.
 * @param {THREE.Object3D} group - Objeto o grupo a destruir.
 */
function disposeGroup(group) {
    if (!group) return;
    group.traverse((child) => {
        if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => disposeMaterial(mat));
                } else {
                    disposeMaterial(child.material);
                }
            }
        }
    });
}

/**
 * Destruye un material y sus mapas de textura asociados.
 * @param {THREE.Material} mat - Material Three.js.
 */
function disposeMaterial(mat) {
    if (!mat) return;
    Object.keys(mat).forEach((prop) => {
        if (mat[prop] && typeof mat[prop].dispose === 'function') {
            mat[prop].dispose();
        }
    });
    mat.dispose();
}

/**
 * Limpia el avatar activo, detiene sus animaciones y remueve mallas de la escena.
 */
function clearCurrentAvatar() {
    if (mixer) {
        mixer.stopAllAction();
        mixer = null;
    }
    if (orbitalRingsGroup) {
        disposeGroup(orbitalRingsGroup);
        scene.remove(orbitalRingsGroup);
        orbitalRingsGroup = null;
    }
    if (avatarMesh) {
        disposeGroup(avatarMesh);
        scene.remove(avatarMesh);
        avatarMesh = null;
    }
    const animBtn = document.getElementById("anim-toggle-btn");
    if (animBtn) animBtn.classList.add("hidden");
}

/**
 * Alterna el estado de pausa / reproducción de la animación esquelética.
 */
window.toggleAvatarAnimation = function() {
    if (!mixer || !activeAction) return;

    const animIcon = document.getElementById("anim-icon");
    if (isAnimationPlaying) {
        activeAction.paused = true;
        isAnimationPlaying = false;
        if (animIcon) animIcon.className = "fa-solid fa-play";
    } else {
        activeAction.paused = false;
        isAnimationPlaying = true;
        if (animIcon) animIcon.className = "fa-solid fa-pause";
    }
};

/**
 * Modifica el factor de escala del avatar y actualiza su almacenamiento local.
 * @param {number} delta - Variación de escala.
 */
window.zoomAvatar = function(delta) {
    if (!avatarMesh && !orbitalRingsGroup) return;

    userScaleFactor = Math.max(0.3, Math.min(3.0, userScaleFactor + delta));
    localStorage.setItem('tiltclock_scale', userScaleFactor.toFixed(2));

    applyAvatarScale();
};

/**
 * Inicia el zoom continuo mientras se mantenga presionado un botón.
 * @param {number} delta - Dirección e intensidad del zoom.
 */
window.startZoomHold = function(delta) {
    window.zoomAvatar(delta);
    window.stopZoomHold();

    zoomTimeout = setTimeout(() => {
        zoomInterval = setInterval(() => {
            window.zoomAvatar(delta * 0.3);
        }, 50);
    }, 250);
};

/**
 * Detiene los intervalos de zoom sostenido.
 */
window.stopZoomHold = function() {
    if (zoomTimeout) {
        clearTimeout(zoomTimeout);
        zoomTimeout = null;
    }
    if (zoomInterval) {
        clearInterval(zoomInterval);
        zoomInterval = null;
    }
};

/**
 * Aplica la escala calculada a la malla o grupo activo.
 */
function applyAvatarScale() {
    if (avatarMesh) {
        const finalScale = baseTargetScale * userScaleFactor;
        avatarMesh.scale.set(finalScale, finalScale, finalScale);
    } else if (orbitalRingsGroup) {
        orbitalRingsGroup.scale.set(userScaleFactor, userScaleFactor, userScaleFactor);
    }
}

/**
 * Bucle principal de renderizado WebGL (Render Loop).
 * Sincroniza animaciones de mezcla y suavizado de inclinación por giroscopio/mouse.
 */
function animate() {
    requestAnimationFrame(animate);

    /* Solo actualizar si la página es visible */
    if (document.hidden) return;

    const delta = clock ? clock.getDelta() : 0.016;

    if (mixer && isAnimationPlaying) {
        mixer.update(delta);
    }

    const target = avatarMesh || orbitalRingsGroup;

    if (target) {
        if (window.gyroData && window.gyroData.beta !== null && !isDragging) {
            const gyroRotX = (window.gyroData.beta * Math.PI) / 180;
            const gyroRotY = (window.gyroData.gamma * Math.PI) / 180;

            /* Calcular delta y limitar velocidad máxima de rotación (Max step 0.05 rad/frame) */
            const deltaRotX = Math.max(-0.05, Math.min(0.05, (gyroRotX - target.rotation.x) * 0.08));
            const deltaRotY = Math.max(-0.05, Math.min(0.05, (gyroRotY - target.rotation.y) * 0.08));

            target.rotation.x += deltaRotX;
            target.rotation.y += deltaRotY;
        } else {
            target.rotation.x += (mouseTargetX - target.rotation.x) * 0.08;
            target.rotation.y += (mouseTargetY - target.rotation.y) * 0.08;
        }
    }

    renderer.render(scene, camera);
}

/**
 * Ajusta la relación de aspecto de la cámara y las dimensiones del renderizador
 * ante cambios de tamaño de ventana o cambio de formato de dispositivo.
 */
function onWindowResize() {
    const container = document.getElementById("avatar-canvas-container");
    if (!container || !renderer || !camera) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.position.set(0, 0, 3.8);
    camera.fov = 50;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

window.onWindowResize = onWindowResize;