/* Módulo renderizado 3D con avatares predefinidos */
let scene, camera, renderer, avatarMesh, orbitalRingsGroup;
let mixer, clock, activeAction;
let isAnimationPlaying = true;
let baseTargetScale = 1.0;
let userScaleFactor = parseFloat(localStorage.getItem('tiltclock_scale')) || 1.0;

/* URLs de modelos predefinidos públicos */
const PRESET_MODELS = {
    astronaut: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Astronaut/glTF-Binary/Astronaut.glb",
    robot: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF-Binary/Fox.glb"
};

/* Inicializar escena */
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
    container.appendChild(renderer.domElement);

    /* Iluminación básica */
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(2, 4, 5);
    scene.add(dirLight);

    /* Objeto inicial */
    createHoloOrbitals();

    /* Escuchar cambios */
    window.addEventListener("resize", onWindowResize);
    animate();
}

/* Crear átomo inicial */
function createHoloOrbitals() {
    clearCurrentAvatar();

    orbitalRingsGroup = new THREE.Group();

    const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.35 });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.008, 16, 100), ringMat);
    ring1.rotation.x = Math.PI / 3;
    orbitalRingsGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.008, 16, 100), ringMat);
    ring2.rotation.y = Math.PI / 4;
    orbitalRingsGroup.add(ring2);

    const coreMat = new THREE.MeshStandardMaterial({ color: 0x0891b2, roughness: 0.2, metalness: 0.8 });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 2), coreMat);
    orbitalRingsGroup.add(core);

    orbitalRingsGroup.scale.set(userScaleFactor, userScaleFactor, userScaleFactor);
    scene.add(orbitalRingsGroup);
}

/* Cargar preset por URL */
window.loadPresetAvatar = function(type) {
    if (type === 'holo') {
        createHoloOrbitals();
        return;
    }

    const url = PRESET_MODELS[type];
    if (!url) return;

    const loader = new THREE.GLTFLoader();
    loader.load(url, (gltf) => {
        setupLoadedGLTF(gltf);
    });
};

/* Cargar modelo GLB local */
window.loadGLBModel = function(file) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function(e) {
        const contents = e.target.result;
        const loader = new THREE.GLTFLoader();

        loader.parse(contents, "", (gltf) => {
            setupLoadedGLTF(gltf);
        });
    };
};

/* Procesar y posicionar GLTF */
function setupLoadedGLTF(gltf) {
    clearCurrentAvatar();

    const rawMesh = gltf.scene;

    /* Centrar modelo */
    const box = new THREE.Box3().setFromObject(rawMesh);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    rawMesh.position.x = -center.x;
    rawMesh.position.y = -center.y - 0.02;
    rawMesh.position.z = -center.z;

    /* Escala inicial base */
    const maxDim = Math.max(size.x, size.y, size.z);
    baseTargetScale = maxDim > 0 ? (2.8 / maxDim) : 2.8;

    /* Envolver en grupo */
    avatarMesh = new THREE.Group();
    avatarMesh.add(rawMesh);

    applyAvatarScale();
    scene.add(avatarMesh);

    /* Configurar animaciones integradas si existen */
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

    /* Actualizar interfaz */
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

/* Limpiar avatar actual */
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

/* Alternar animación play/pause */
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

/* Ajustar escala manual */
window.zoomAvatar = function(delta) {
    if (!avatarMesh && !orbitalRingsGroup) return;

    userScaleFactor = Math.max(0.3, Math.min(3.0, userScaleFactor + delta));
    localStorage.setItem('tiltclock_scale', userScaleFactor.toFixed(2));

    if (avatarMesh) {
        applyAvatarScale();
    } else if (orbitalRingsGroup) {
        orbitalRingsGroup.scale.set(userScaleFactor, userScaleFactor, userScaleFactor);
    }
};

/* Aplicar escala total */
function applyAvatarScale() {
    if (!avatarMesh) return;
    const finalScale = baseTargetScale * userScaleFactor;
    avatarMesh.scale.set(finalScale, finalScale, finalScale);
}

/* Bucle animación */
function animate() {
    requestAnimationFrame(animate);

    const delta = clock ? clock.getDelta() : 0.016;

    /* Actualizar mezclador de animación */
    if (mixer && isAnimationPlaying) {
        mixer.update(delta);
    }

    if (window.gyroData) {
        const targetRotX = (window.gyroData.beta * Math.PI) / 180;
        const targetRotY = (window.gyroData.gamma * Math.PI) / 180;

        /* Rotación orbitales */
        if (orbitalRingsGroup) {
            orbitalRingsGroup.rotation.x += (targetRotX - orbitalRingsGroup.rotation.x) * 0.1;
            orbitalRingsGroup.rotation.y += (targetRotY - orbitalRingsGroup.rotation.y) * 0.1;
        }

        /* Rotación modelo */
        if (avatarMesh) {
            avatarMesh.rotation.x += (targetRotX - avatarMesh.rotation.x) * 0.1;
            avatarMesh.rotation.y += (targetRotY - avatarMesh.rotation.y) * 0.1;
        }
    }

    renderer.render(scene, camera);
}

/* Reajustar dimensiones */
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

/* Exportar función global */
window.onWindowResize = onWindowResize;