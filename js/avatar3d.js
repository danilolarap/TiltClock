let scene, camera, renderer, avatarMesh, orbitalRingsGroup;

function initAvatar3D() {
    const container = document.getElementById("avatar-canvas-container");
    if (!container) return;

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 200;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0x06b6d4, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(2, 4, 5);
    scene.add(dirLight);

    // Halo 3D Inicial
    createHoloOrbitals();

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
    avatarMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.38, 2), coreMat);
    orbitalRingsGroup.add(avatarMesh);

    scene.add(orbitalRingsGroup);
}

window.loadGLBModel = function(file) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function(e) {
        const contents = e.target.result;
        const loader = new THREE.GLTFLoader();

        loader.parse(contents, "", (gltf) => {
            if (orbitalRingsGroup) scene.remove(orbitalRingsGroup);
            if (avatarMesh) scene.remove(avatarMesh);

            avatarMesh = gltf.scene;
            avatarMesh.scale.set(1.2, 1.2, 1.2);
            avatarMesh.position.set(0, -0.2, 0);

            scene.add(avatarMesh);
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
            avatarMesh.rotation.y += 0.01;
        }
    }

    renderer.render(scene, camera);
}