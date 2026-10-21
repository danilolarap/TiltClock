/* Módulo renderizado 3D con compatibilidad para Smartwatch (Hover, Arrastre Táctil y Giroscopio) */
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

function createGLTFLoader() {
    const loader = new THREE.GLTFLoader();
    
    if (typeof THREE.DRACOLoader !== 'undefined') {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.3/');
        loader.setDRACOLoader(dracoLoader);
    }

    return loader;
}

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

    createHoloOrbitals();
    setupTouchAndMouseControls(container);

    window.addEventListener("resize", onWindowResize);
    animate();
}

/* Eventos adaptados para Smartwatch y PC */
function setupTouchAndMouseControls(container) {
    /* 1. SEGUIMIENTO DE PUNTERO (Hover en PC) */
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

    /* 2. ARRASTRE TÁCTIL DEDICADO A SMARTWATCH / PANTALLAS TÁCTILES */
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

            /* Sensibilidad adaptada a pantallas pequeñas de smartwatch */
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

function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function createHoloOrbitals() {
    clearCurrentAvatar();

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

window.loadPresetAvatar = function(type) {
    if (type === 'holo') {
        createHoloOrbitals();
        return;
    }

    const sources = PRESET_MODELS[type];
    if (!sources || !sources.length) return;

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

window.loadGLBModel = function(file) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function(e) {
        const contents = e.target.result;
        const loader = createGLTFLoader();

        loader.parse(contents, "", (gltf) => {
            setupLoadedGLTF(gltf);
        });
    };
};

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

function clearCurrentAvatar() {
    if (mixer) {
        mixer.stopAllAction();
        mixer = null;
    }
    if (orbitalRingsGroup) {
        scene.remove(orbitalRingsGroup);
        orbitalRingsGroup = null;
    }
    if (avatarMesh) {
        scene.remove(avatarMesh);
        avatarMesh = null;
    }
    const animBtn = document.getElementById("anim-toggle-btn");
    if (animBtn) animBtn.classList.add("hidden");
}

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

window.zoomAvatar = function(delta) {
    if (!avatarMesh && !orbitalRingsGroup) return;

    userScaleFactor = Math.max(0.3, Math.min(3.0, userScaleFactor + delta));
    localStorage.setItem('tiltclock_scale', userScaleFactor.toFixed(2));

    applyAvatarScale();
};

window.startZoomHold = function(delta) {
    window.zoomAvatar(delta);
    window.stopZoomHold();

    zoomTimeout = setTimeout(() => {
        zoomInterval = setInterval(() => {
            window.zoomAvatar(delta * 0.3);
        }, 50);
    }, 250);
};

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

function applyAvatarScale() {
    if (avatarMesh) {
        const finalScale = baseTargetScale * userScaleFactor;
        avatarMesh.scale.set(finalScale, finalScale, finalScale);
    } else if (orbitalRingsGroup) {
        orbitalRingsGroup.scale.set(userScaleFactor, userScaleFactor, userScaleFactor);
    }
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock ? clock.getDelta() : 0.016;

    if (mixer && isAnimationPlaying) {
        mixer.update(delta);
    }

    const target = avatarMesh || orbitalRingsGroup;

    if (target) {
        /* Si el usuario está tocando/arrastrando con el dedo, priorizar la entrada táctil sobre el giroscopio */
        if (window.gyroData && window.gyroData.beta !== null && !isDragging) {
            const gyroRotX = (window.gyroData.beta * Math.PI) / 180;
            const gyroRotY = (window.gyroData.gamma * Math.PI) / 180;

            target.rotation.x += (gyroRotX - target.rotation.x) * 0.08;
            target.rotation.y += (gyroRotY - target.rotation.y) * 0.08;
        } else {
            /* Modo Arrastre Táctil (Smartwatch/Móvil) o Puntero (PC) */
            target.rotation.x += (mouseTargetX - target.rotation.x) * 0.08;
            target.rotation.y += (mouseTargetY - target.rotation.y) * 0.08;
        }
    }

    renderer.render(scene, camera);
}

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