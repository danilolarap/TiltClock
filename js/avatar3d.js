let scene, camera, renderer, avatarMesh, orbitalRingsGroup;

function initAvatar3D() {
    const container = document.getElementById("avatar-canvas-container");
    if (!container) return;

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 220;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(2, 4, 5);
    scene.add(dirLight);

    // Anillos Orbitales de Inicio
    createHoloOrbitals();

    window.addEventListener("resize", onWindowResize);
    animate();
}

function createHoloOrbitals() {
    orbitalRingsGroup = new THREE.Group();

    const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.35 });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.01, 16, 100), ringMat);
    ring1.rotation.x = Math.PI / 3;
    orbitalRingsGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.01, 16, 100), ringMat);
    ring2.rotation.y = Math.PI / 4;
    orbitalRingsGroup.add(ring2);

    const coreMat = new THREE.MeshStandardMaterial({ color: 0x0891b2, roughness: 0.2, metalness: 0.8 });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.38, 2), coreMat);
    orbitalRingsGroup.add(core);

    scene.add(orbitalRingsGroup);
}

window.loadGLBModel = function(file) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function(e) {
        const contents = e.target.result;
        const loader = new THREE.GLTFLoader();

        loader.parse(contents, "", (gltf) => {
            if (orbitalRingsGroup) {
                scene.remove(orbitalRingsGroup);
                orbitalRingsGroup = null;
            }
            if (avatarMesh) {
                scene.remove(avatarMesh);
            }

            avatarMesh = gltf.scene;

            // Escala aumentada para aprovechar todo el centro
            avatarMesh.scale.set(2.2, 2.2, 2.2);
            avatarMesh.position.set(0, -0.3, 0);

            scene.add(avatarMesh);

            // Transformar el botón a Círculo Pequeño en la Esquina Inferior Derecha
            const btnWrapper = document.getElementById("upload-btn-wrapper");
            if (btnWrapper) {
                btnWrapper.className = "btn-state-mini";
            }

            onWindowResize();
        });
    };
};

function animate() {
    requestAnimationFrame(animate);

    if (window.gyroData) {
        const targetRotX = (window.gyroData.beta * Math.PI) / 180;
        const targetRotY = (window.gyroData.gamma * Math.PI) / 180;

        if (orbitalRingsGroup) {
            orbitalRingsGroup.rotation.x += (targetRotX - orbitalRingsGroup.rotation.x) * 0.1;
            orbitalRingsGroup.rotation.y += (targetRotY - orbitalRingsGroup.rotation.y) * 0.1;
        }

        if (avatarMesh) {
            avatarMesh.rotation.x += (targetRotX - avatarMesh.rotation.x) * 0.1;
            avatarMesh.rotation.y += (targetRotY - avatarMesh.rotation.y) * 0.1;
        }
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById("avatar-canvas-container");
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}