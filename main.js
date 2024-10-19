import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

let camera, scene, renderer, controls;
let enemies = [];
let score = 0;

const moveSpeed = 0.5;
const enemySpeed = 0.5;
const maxEnemies = 20;

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = 10;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 0, 750);

    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);

    controls = new PointerLockControls(camera, document.body);

    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');

    instructions.addEventListener('click', function () {
        controls.lock();
    });

    controls.addEventListener('lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
    });

    controls.addEventListener('unlock', function () {
        blocker.style.display = 'flex';
        instructions.style.display = 'block';
    });

    scene.add(controls.getObject());

    const onKeyDown = function (event) {
        switch (event.code) {
            case 'KeyW': controls.moveForward(moveSpeed); break;
            case 'KeyS': controls.moveForward(-moveSpeed); break;
            case 'KeyA': controls.moveRight(-moveSpeed); break;
            case 'KeyD': controls.moveRight(moveSpeed); break;
        }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onShoot);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    floorGeometry.rotateX(-Math.PI / 2);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x4CAF50 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    scene.add(floor);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    // 初期の敵を生成
    for (let i = 0; i < maxEnemies; i++) {
        createEnemy();
    }
}

function createEnemy() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://pbs.twimg.com/profile_images/1683983946911195136/oz8Wk6gz_400x400.jpg');
    const material = new THREE.SpriteMaterial({ map: texture });
    const enemy = new THREE.Sprite(material);
    enemy.scale.set(20, 20, 1);
    
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 300 + 100;
    enemy.position.set(
        Math.cos(angle) * radius,
        10,
        Math.sin(angle) * radius
    );
    
    scene.add(enemy);
    enemies.push(enemy);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onShoot() {
    if (controls.isLocked) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(), camera);

        const intersects = raycaster.intersectObjects(enemies);
        if (intersects.length > 0) {
            const hitEnemy = intersects[0].object;
            scene.remove(hitEnemy);
            enemies = enemies.filter(e => e !== hitEnemy);
            score++;
            updateScore();
            createEnemy();
        }
    }
}

function updateScore() {
    document.getElementById('score').textContent = `スコア: ${score}`;
}

function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        enemies.forEach(enemy => {
            const direction = new THREE.Vector3()
                .subVectors(controls.getObject().position, enemy.position)
                .normalize();
            enemy.position.add(direction.multiplyScalar(enemySpeed));

            if (enemy.position.distanceTo(controls.getObject().position) < 10) {
                controls.unlock();
                alert(`ゲームオーバー！ スコア: ${score}`);
                score = 0;
                updateScore();
                resetEnemies();
            }
        });
    }

    renderer.render(scene, camera);
}

function resetEnemies() {
    enemies.forEach(enemy => scene.remove(enemy));
    enemies = [];
    for (let i = 0; i < maxEnemies; i++) {
        createEnemy();
    }
}