import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('anim10');

if (!container) throw new Error('Container #anim10 non trovato');

function getSize() {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight
  };
}

// =====================
// SCENE
// =====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a10);
scene.fog = new THREE.Fog(0x0a0a10, 2, 14);

// =====================
// CAMERA
// =====================
const { width, height } = getSize();

const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
camera.position.set(0, 0, 7);

// =====================
// RENDERER (IMPORTANT: better shading feel)
// =====================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
container.appendChild(renderer.domElement);

// =====================
// LIGHTING (GLOBAL UPGRADE)
// =====================
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const key = new THREE.DirectionalLight(0xffffff, 2.5);
key.position.set(5, 6, 4);
scene.add(key);

const rim = new THREE.DirectionalLight(0x88aaff, 1.5);
rim.position.set(-6, 2, -5);
scene.add(rim);

// =====================
// ENVIRONMENT (SOFT REFLECTIONS)
// =====================
const env = new THREE.CubeTextureLoader().load([
  'https://threejs.org/examples/textures/cube/skybox/px.jpg',
  'https://threejs.org/examples/textures/cube/skybox/nx.jpg',
  'https://threejs.org/examples/textures/cube/skybox/py.jpg',
  'https://threejs.org/examples/textures/cube/skybox/ny.jpg',
  'https://threejs.org/examples/textures/cube/skybox/pz.jpg',
  'https://threejs.org/examples/textures/cube/skybox/nz.jpg'
]);

scene.environment = env;

// =====================
// COFFEE BEANS (HIGHER QUALITY LOOK)
// =====================
const COUNT = 900;

// bigger + more segments = less “low poly feel”
const geometry = new THREE.IcosahedronGeometry(0.12, 2);

const material = new THREE.MeshStandardMaterial({
  color: 0x6b4a3a,
  roughness: 0.55,
  metalness: 0.1,
  envMapIntensity: 1.4
});

const mesh = new THREE.InstancedMesh(geometry, material, COUNT);
scene.add(mesh);

const temp = new THREE.Object3D();

// =====================
// FLOW SETTINGS (SLOW + SMOOTH)
// =====================
const boundsX = 6;
const boundsY = 2.4;

// MUCH slower than before
const baseSpeed = 0.01;

// =====================
// STATE
// =====================
const pos = [];
const vel = [];

// distribute evenly to avoid “gaps”
for (let i = 0; i < COUNT; i++) {
  const x = THREE.MathUtils.lerp(-boundsX, boundsX, i / COUNT);
  const y = (Math.random() - 0.5) * boundsY * 2;

  pos.push(new THREE.Vector3(x, y, 0));

  vel.push(new THREE.Vector3(
    baseSpeed,
    (Math.random() - 0.5) * 0.0003,
    0
  ));
}

// =====================
// MOUSE FORCE
// =====================
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const mouseWorld = new THREE.Vector3();

const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

// bigger sphere feel
const forceRadius = 3.5;

window.addEventListener('mousemove', (e) => {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(plane, mouseWorld);
});

// =====================
// ANIMATION
// =====================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  for (let i = 0; i < COUNT; i++) {
    const p = pos[i];
    const v = vel[i];

    // =====================
    // VERY SMOOTH FLOW (NO SPIKES)
    // =====================
    v.x = baseSpeed * (0.8 + Math.sin(t * 0.1) * 0.2);
    v.y += Math.sin(t * 0.2 + i * 0.01) * 0.00005;

    v.multiplyScalar(0.98);

    p.add(v);

    // =====================
    // MOUSE FORCE (SMOOTHER)
    // =====================
    const d = p.clone().sub(mouseWorld);
    const dist = d.length();

    if (dist < forceRadius) {
      const s = 1.0 - dist / forceRadius;

      d.normalize();

      const swirl = new THREE.Vector3(-d.y, d.x, 0);

      p.add(d.multiplyScalar(s * 0.04));
      p.add(swirl.multiplyScalar(s * 0.03));
    }

    // =====================
    // CONTINUOUS FLOW (NO GAPS)
    // =====================
    if (p.x > boundsX) {
      p.x = -boundsX;
      p.y = (Math.random() - 0.5) * boundsY * 2;
    }

    if (p.x < -boundsX) {
      p.x = boundsX;
      p.y = (Math.random() - 0.5) * boundsY * 2;
    }

    // =====================
    // RENDER
    // =====================
    temp.position.copy(p);

    // subtle rotation = realism
    temp.rotation.y = t * 0.1;

    temp.updateMatrix();
    mesh.setMatrixAt(i, temp.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;

  renderer.render(scene, camera);
}

animate();

// =====================
// RESIZE
// =====================
window.addEventListener('resize', () => {
  const { width, height } = getSize();

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
});