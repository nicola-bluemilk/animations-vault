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
// SCENE (better depth)
// =====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a10);
scene.fog = new THREE.Fog(0x0a0a10, 2, 14);

// =====================
// CAMERA
// =====================
const { width, height } = getSize();

const camera = new THREE.PerspectiveCamera(
  60,
  width / height,
  0.1,
  100
);

camera.position.set(0, 0, 7);

// =====================
// RENDERER
// =====================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

// =====================
// LIGHT (much better look)
// =====================
scene.add(new THREE.AmbientLight(0xffffff, 0.7));

const key = new THREE.DirectionalLight(0xffffff, 1.4);
key.position.set(5, 6, 5);
scene.add(key);

const rim = new THREE.DirectionalLight(0x4aa3ff, 1.0);
rim.position.set(-6, 2, -4);
scene.add(rim);

// =====================
// COFFEE BEANS
// =====================
const COUNT = 700;

const geometry = new THREE.SphereGeometry(0.09, 14, 14);

const material = new THREE.MeshStandardMaterial({
  color: 0x6b4a3a,
  roughness: 0.8,
  metalness: 0.05
});

const mesh = new THREE.InstancedMesh(geometry, material, COUNT);
scene.add(mesh);

const temp = new THREE.Object3D();

// =====================
// WORLD SETTINGS
// =====================
const boundsX = 6;
const boundsY = 2.2;

// IMPORTANT: slower flow
const baseSpeed = 0.0022;

// =====================
// PARTICLES STATE
// =====================
const pos = [];
const vel = [];

function respawn(i, resetX = true) {
  pos[i] = new THREE.Vector3(
    resetX ? -boundsX - Math.random() * 2 : (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * boundsY * 2,
    (Math.random() - 0.5) * 0.5
  );

  vel[i] = new THREE.Vector3(
    baseSpeed + Math.random() * 0.001,
    (Math.random() - 0.5) * 0.0008,
    0
  );
}

for (let i = 0; i < COUNT; i++) {
  respawn(i, false);
}

// =====================
// MOUSE FORCE
// =====================
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const mouseWorld = new THREE.Vector3();

const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

// bigger & softer sphere
const forceRadius = 3.2;

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
    // VERY SLOW FLOW (river)
    // =====================
    v.x += baseSpeed;
    v.y += Math.sin(t * 0.2 + p.x) * 0.00015;

    v.multiplyScalar(0.985);

    p.add(v);

    // =====================
    // MOUSE INTERACTION (soft but visible)
    // =====================
    const d = p.clone().sub(mouseWorld);
    const dist = d.length();

    if (dist < forceRadius) {
      const strength = 1.0 - dist / forceRadius;

      d.normalize();

      const swirl = new THREE.Vector3(-d.y, d.x, 0);

      p.add(d.multiplyScalar(strength * 0.08));
      p.add(swirl.multiplyScalar(strength * 0.05));
    }

    // =====================
    // REMOVE WRAP → REAL SPAWN SYSTEM
    // =====================
    if (p.x > boundsX) {
      respawn(i, true); // NEW particles
      continue;
    }

    // optional vertical clamp
    p.y = THREE.MathUtils.clamp(p.y, -boundsY, boundsY);

    // =====================
    // RENDER INSTANCE
    // =====================
    temp.position.copy(p);

    temp.rotation.y = t * 0.15;

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