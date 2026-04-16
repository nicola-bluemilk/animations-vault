import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addSoftStudioLights, createSharedGltfLoader, frameObject } from '../utils/gltf-viewer.js';
import { bindResponsiveRenderer, createRenderer, getViewportSize, requireContainer } from '../utils/three-scene.js';

const container = requireContainer('model-stage');

const modelUrl = container.dataset.modelUrl;

if (!modelUrl) {
  throw new Error('Attributo data-model-url mancante su #model-stage');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f1e8);

const { width, height } = getViewportSize(container);
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 5;

const renderer = createRenderer(container, width, height, { antialias: true });

addSoftStudioLights(scene);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const { loader, dracoLoader, ktx2Loader } = createSharedGltfLoader(renderer);

let model = null;

loader.load(modelUrl, (gltf) => {
  model = gltf.scene;

  frameObject(camera, model, controls);

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

bindResponsiveRenderer({ container, camera, renderer });

window.addEventListener('beforeunload', () => {
  dracoLoader.dispose();
  ktx2Loader.dispose();
});