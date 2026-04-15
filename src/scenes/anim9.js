import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('anim9');

if (!container) {
  throw new Error('Container #anim9 non trovato');
}

// =====================
// SIZE
// =====================
function getSize() {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight
  };
}

// =====================
// SCENA
// =====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070d);
scene.fog = new THREE.FogExp2(0x070a14, 0.04);

// =====================
// CAMERA
// =====================
const { width, height } = getSize();

const camera = new THREE.PerspectiveCamera(
  75,
  width / height,
  0.1,
  100
);

camera.position.set(0, 0, 8);

// =====================
// RENDERER
// =====================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);

// =====================
// CONTROLS (debug)
// =====================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.035;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 14;

// =====================
// LIGHT (soft cinematic)
// =====================
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(5, 5, 5);
scene.add(light);

const fillLight = new THREE.DirectionalLight(0x7aa2ff, 0.8);
fillLight.position.set(-4, 1, -3);
scene.add(fillLight);

scene.add(new THREE.AmbientLight(0xb9c6ff, 0.42));

// =====================
// PARTICLES (STAR FIELD)
// =====================
const COUNT = 1200;

const geometry = new THREE.SphereGeometry(0.02, 6, 6);
const material = new THREE.MeshStandardMaterial({
  color: 0xf3f6ff,
  emissive: 0x8fb5ff,
  emissiveIntensity: 1.2,
  roughness: 0.25,
  metalness: 0.0
});

const instancedMesh = new THREE.InstancedMesh(geometry, material, COUNT);
scene.add(instancedMesh);

// =====================
// POSITIONS + VELOCITIES
// =====================
const positions = [];
const velocities = [];
const baseScales = [];
const twinkleOffsets = [];
const starColor = new THREE.Color();
const tempObj = new THREE.Object3D();

for (let i = 0; i < COUNT; i++) {
  const pos = new THREE.Vector3(
    (Math.random() - 0.5) * 14,
    (Math.random() - 0.5) * 14,
    (Math.random() - 0.5) * 14
  );

  const vel = new THREE.Vector3(
    (Math.random() - 0.5) * 0.004,
    (Math.random() - 0.5) * 0.004,
    (Math.random() - 0.5) * 0.004
  );

  const scale = 0.35 + Math.random() * 1.65;

  positions.push(pos);
  velocities.push(vel);
  baseScales.push(scale);
  twinkleOffsets.push(Math.random() * Math.PI * 2);

  starColor.setHSL(0.56 + Math.random() * 0.08, 0.35, 0.8 + Math.random() * 0.14);

  tempObj.position.copy(pos);
  tempObj.scale.setScalar(scale);
  tempObj.updateMatrix();
  instancedMesh.setMatrixAt(i, tempObj.matrix);
  instancedMesh.setColorAt(i, starColor);
}

if (instancedMesh.instanceColor) {
  instancedMesh.instanceColor.needsUpdate = true;
}

// =====================
// ANIMATION
// =====================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  for (let i = 0; i < COUNT; i++) {
    const pos = positions[i];
    const vel = velocities[i];
    const baseScale = baseScales[i];
    const twinkleOffset = twinkleOffsets[i];

    // =====================
    // FLOW FIELD BASE
    // =====================
    vel.x += Math.sin(time * 0.14 + pos.y * 0.35) * 0.00008;
    vel.y += Math.cos(time * 0.16 + pos.x * 0.3) * 0.00008;
    vel.z += Math.sin(time * 0.1 + pos.x * 0.22) * 0.00006;

    // damping (floating)
    vel.multiplyScalar(0.992);

    pos.add(vel);

    // =====================
    // BOUNDARY WRAP
    // =====================
    const limit = 7;

    if (pos.x > limit) pos.x = -limit;
    if (pos.x < -limit) pos.x = limit;
    if (pos.y > limit) pos.y = -limit;
    if (pos.y < -limit) pos.y = limit;
    if (pos.z > limit) pos.z = -limit;
    if (pos.z < -limit) pos.z = limit;

    // update instance
    const twinkle = 0.9 + Math.sin(time * 1.4 + twinkleOffset) * 0.12;

    tempObj.position.copy(pos);
    tempObj.scale.setScalar(baseScale * twinkle);
    tempObj.rotation.set(time * 0.18 + i * 0.002, time * 0.12 + i * 0.0015, 0);
    tempObj.updateMatrix();

    instancedMesh.setMatrixAt(i, tempObj.matrix);
  }

  instancedMesh.instanceMatrix.needsUpdate = true;

  controls.update();
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