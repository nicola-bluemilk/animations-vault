import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addSoftStudioLights, createSharedGltfLoader, frameObject } from '../utils/gltf-viewer.js';
import { bindResponsiveRenderer, createRenderer, getViewportSize, requireContainer } from '../utils/three-scene.js';

const container = requireContainer('anim2');

// MARK: scena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f1e8);

// MARK: camera
const { width, height } = getViewportSize(container);
const camera = new THREE.PerspectiveCamera(
  75,
  width / height,
  0.1,
  1000
);
camera.position.z = 5;

// MARK: renderer
const renderer = createRenderer(container, width, height);

// MARK: luce
const { keyLight, ambient } = addSoftStudioLights(scene);
keyLight.intensity = 2;
ambient.intensity = 0.5;

// MARK VFX
// scene.fog = new THREE.FogExp2(0x000000, 0.15);

// MARK: MODELLO GLB
const { loader, dracoLoader, ktx2Loader } = createSharedGltfLoader(renderer);

let model = null;

loader.load('/models/rolex.glb', (gltf) => {
  model = gltf.scene;

  frameObject(camera, model, controls);

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
bindResponsiveRenderer({ container, camera, renderer });

window.addEventListener('beforeunload', () => {
  dracoLoader.dispose();
  ktx2Loader.dispose();
});