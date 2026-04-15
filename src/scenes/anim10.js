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
// SCENE (CINEMATIC)
// =====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07070a);
scene.fog = new THREE.Fog(0x07070a, 2, 18);

// =====================
// CAMERA (FILMIC)
// =====================
const { width, height } = getSize();

const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
camera.position.set(0, 0.5, 8);

// =====================
// RENDERER (UNREAL FEEL)
// =====================
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6; // 🔥 importantissimo (prima era troppo scuro)

container.appendChild(renderer.domElement);

// =====================
// CONTROLS (cinematic feel)
// =====================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 12;

// =====================
// LIGHTING (UNREAL STYLE)
// =====================

// key light (sun cinematic)
const key = new THREE.DirectionalLight(0xffffff, 4);
key.position.set(6, 8, 4);
scene.add(key);

// fill light (soft)
const fill = new THREE.DirectionalLight(0x6aa6ff, 1.5);
fill.position.set(-6, 2, 2);
scene.add(fill);

// rim light (VERY IMPORTANT for separation)
const rim = new THREE.DirectionalLight(0xffcc88, 2);
rim.position.set(0, 2, -8);
scene.add(rim);

// ambient (low but present)
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

// =====================
// ENV MAP (REAL REFLECTION BOOST)
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
// COFFEE BEANS (FIXED MATERIAL)
// =====================

const COUNT = 900;

// smoother geometry (important)
const geometry = new THREE.SphereGeometry(0.12, 18, 18);

// 🔥 FIX: stronger physically-based material
const material = new THREE.MeshStandardMaterial({
  color: 0x5a3a2e,        // slightly brighter coffee tone
  roughness: 0.25,        // lower = more realistic specular
  metalness: 0.05,
  envMapIntensity: 2.2    // 🔥 KEY FIX (this was missing)
});

const mesh = new THREE.InstancedMesh(geometry, material, COUNT);
scene.add(mesh);

const temp = new THREE.Object3D();

// =====================
// FLOW (SMOOTH RIVER)
// =====================
const boundsX = 6;
const boundsY = 2.5;
const speed = 0.006; // slower cinematic flow

const pos = [];
const vel = [];

for (let i = 0; i < COUNT; i++) {
  pos.push(new THREE.Vector3(
    THREE.MathUtils.lerp(-boundsX, boundsX, i / COUNT),
    (Math.random() - 0.5) * boundsY * 2,
    (Math.random() - 0.5) * 0.5
  ));

  vel.push(new THREE.Vector3(speed, 0, 0));
}

// =====================
// MOUSE FORCE (CINEMATIC FIELD)
// =====================
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const mouseWorld = new THREE.Vector3();
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

const forceRadius = 2.8;

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

    // river flow + turbulence
    p.x += speed + Math.sin(t * 0.2 + i * 0.01) * 0.002;
    p.y += Math.sin(t * 0.3 + i) * 0.001;
    p.z += Math.cos(t * 0.25 + i) * 0.001;

    // mouse field force
    const d = p.clone().sub(mouseWorld);
    const dist = d.length();

    if (dist < forceRadius) {
      const strength = 1.0 - dist / forceRadius;

      d.normalize();

      const swirl = new THREE.Vector3(-d.y, d.x, 0);

      p.add(d.multiplyScalar(strength * 0.03));
      p.add(swirl.multiplyScalar(strength * 0.02));
    }

    // wrap flow (no gaps)
    if (p.x > boundsX) {
      p.x = -boundsX;
      p.y = (Math.random() - 0.5) * boundsY * 2;
    }

    // render
    temp.position.copy(p);

    temp.rotation.set(
      Math.sin(t + i) * 0.2,
      Math.cos(t * 0.5 + i) * 0.2,
      0
    );

    temp.updateMatrix();
    mesh.setMatrixAt(i, temp.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;

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