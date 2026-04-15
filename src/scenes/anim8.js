import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const container = document.getElementById('anim8');

if (!container) {
  throw new Error('Container #anim8 non trovato');
}

function getContainerSize() {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight
  };
}

// =====================
// SCENA
// =====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);

// 🌫️ FOG CINEMATICA
scene.fog = new THREE.Fog(0x0a0a0f, 2, 12);

// =====================
// CAMERA
// =====================
const { width, height } = getContainerSize();

const camera = new THREE.PerspectiveCamera(
  75,
  width / height,
  0.1,
  1000
);
camera.position.set(0, 1.5, 0);

// =====================
// RENDERER
// =====================
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

container.appendChild(renderer.domElement);

// =====================
// LUCI CINEMATICHE
// =====================

// key light
const keyLight = new THREE.DirectionalLight(0xffffff, 2);
keyLight.position.set(5, 5, 5);
scene.add(keyLight);

// rim light (blu cinematica)
const rimLight = new THREE.DirectionalLight(0x4aa3ff, 1.5);
rimLight.position.set(-5, 2, -5);
scene.add(rimLight);

// ambient soft
const ambient = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambient);

// =====================
// OGGETTO
// =====================
const geometry = new THREE.BoxGeometry();

const material = new THREE.MeshStandardMaterial({
  color: 0x999150,
  roughness: 0.4,
  metalness: 0.2
});

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// =====================
// CONTROLS
// =====================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// =====================
// RAYCAST
// =====================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(cube);

  if (intersects.length > 0) {
    console.log('cliccato oggetto!');

    if (intersects[0].object.material.color) {
      intersects[0].object.material.color.setHex(
        Math.random() * 0xffffff
      );
    }
  }
});

// =====================
// POST PROCESSING (BLOOM)
// =====================
const composer = new EffectComposer(renderer);

composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(width, height),
  0.8,   // strength
  0.5,   // radius
  0.85   // threshold
);

composer.addPass(bloom);

// =====================
// ANIMAZIONE
// =====================
function animate() {
  requestAnimationFrame(animate);

  controls.update();

  cube.rotation.x += 0.005;
  cube.rotation.y += 0.005;

  composer.render();
}

animate();

// =====================
// RESIZE
// =====================
window.addEventListener('resize', () => {
  const { width, height } = getContainerSize();

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  composer.setSize(width, height);
});