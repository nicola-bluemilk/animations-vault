import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('model-stage');

if (!container) {
  throw new Error('Container #model-stage non trovato');
}

const modelUrl = container.dataset.modelUrl;

if (!modelUrl) {
  throw new Error('Attributo data-model-url mancante su #model-stage');
}

function getContainerSize() {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight
  };
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f1e8);

const { width, height } = getContainerSize();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
renderer.domElement.style.display = 'block';
container.appendChild(renderer.domElement);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(5, 8, 6);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xfff4de, 1.2);
fillLight.position.set(-4, 3, 5);
scene.add(fillLight);

const ambient = new THREE.AmbientLight(0xffffff, 0.65);
scene.add(ambient);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

let model = null;

loader.load(modelUrl, (gltf) => {
  model = gltf.scene;

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

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  if (model) {
    model.rotation.y += 0.005;
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  const { width, height } = getContainerSize();

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
});