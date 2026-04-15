import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('anim2');

if (!container) {
  throw new Error('Container #anim2 non trovato');
}

function getContainerSize() {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight
  };
}

// MARK: scena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f1e8);

// MARK: camera
const { width, height } = getContainerSize();
const camera = new THREE.PerspectiveCamera(
  75,
  width / height,
  0.1,
  1000
);
camera.position.z = 5;

// MARK: renderer
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
renderer.domElement.style.display = 'block';
container.appendChild(renderer.domElement);

// MARK: luce
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 5, 5);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

// MARK VFX
// scene.fog = new THREE.FogExp2(0x000000, 0.15);

// MARK: MODELLO GLB
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

let model = null;

loader.load('/models/rolex.glb', (gltf) => {
  model = gltf.scene;

  // centra il modello
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);

  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const cameraDistance = Math.max((maxDim / 2) / Math.tan(fov / 2) * 1.4, 1.5);

  camera.position.set(0, maxDim * 0.35, cameraDistance);
  camera.near = Math.max(cameraDistance / 100, 0.01);
  camera.far = cameraDistance * 100;
  camera.updateProjectionMatrix();
  camera.lookAt(0, 0, 0);

  controls.target.set(0, 0, 0);
  controls.update();

  scene.add(model);
}, undefined, (error) => {
  console.error('Errore nel caricamento del modello GLB:', error);
});

// MARK: controlli
const controls = new OrbitControls(camera, renderer.domElement);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', (event) => {
  if (!model) return; // evita errori se non è ancora caricato

  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // IMPORTANTISSIMO: true per includere figli
  const intersects = raycaster.intersectObject(model, true);

  if (intersects.length > 0) {
    console.log('cliccato modello!');

    model.traverse((child) => {
      if (child.isMesh && child.material && child.material.color) {
        child.material.color.setHex(Math.random() * 0xffffff);
      }
    });
  }
});

// MARK: loop animazione
function animate() {
  requestAnimationFrame(animate);

  controls.update();

  // ruota il modello invece del cubo
  if (model) {
    model.rotation.y += 0.005;
  }

  renderer.render(scene, camera);
}

animate();

// MARK: resize responsivo
window.addEventListener('resize', () => {
  const { width, height } = getContainerSize();

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
});