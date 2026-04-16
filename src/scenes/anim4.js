import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addSoftStudioLights, createSharedGltfLoader, frameObject } from '../utils/gltf-viewer.js';
import { bindResponsiveRenderer, createRenderer, getViewportSize, requireContainer } from '../utils/three-scene.js';

const container = requireContainer('anim4');

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

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const { loader, dracoLoader, ktx2Loader } = createSharedGltfLoader(renderer);

const defaultMaterialState = new WeakMap();
let model = null;
let selectedMesh = null;

function getMaterials(mesh) {
  if (!mesh.material) {
    return [];
  }

  return Array.isArray(mesh.material) ? mesh.material : [mesh.material];
}

function storeMaterialState(mesh) {
  if (defaultMaterialState.has(mesh)) {
    return;
  }

  defaultMaterialState.set(
    mesh,
    getMaterials(mesh).map((material) => ({
      color: material.color ? material.color.clone() : null,
      emissive: material.emissive ? material.emissive.clone() : null,
      emissiveIntensity: material.emissiveIntensity ?? null
    }))
  );
}

function restoreMesh(mesh) {
  const state = defaultMaterialState.get(mesh);

  if (!state) {
    return;
  }

  getMaterials(mesh).forEach((material, index) => {
    const materialState = state[index];

    if (!materialState) {
      return;
    }

    if (material.color && materialState.color) {
      material.color.copy(materialState.color);
    }

    if (material.emissive && materialState.emissive) {
      material.emissive.copy(materialState.emissive);
    }

    if (materialState.emissiveIntensity !== null && material.emissiveIntensity !== undefined) {
      material.emissiveIntensity = materialState.emissiveIntensity;
    }
  });
}

function highlightMesh(mesh) {
  getMaterials(mesh).forEach((material) => {
    if (material.emissive) {
      material.emissive.setHex(0xd45c2d);
      if (material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = 0.85;
      }
      return;
    }

    if (material.color) {
      material.color.offsetHSL(0, 0.15, 0.12);
    }
  });
}

loader.load('/models/rolex.glb', (gltf) => {
  model = gltf.scene;

  model.traverse((child) => {
    if (child.isMesh) {
      storeMaterialState(child);
    }
  });

  frameObject(camera, model, controls);

  scene.add(model);
}, undefined, (error) => {
  console.error('Errore nel caricamento del modello GLB:', error);
});

renderer.domElement.addEventListener('click', (event) => {
  if (!model) {
    return;
  }

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(model, true);

  if (intersects.length === 0) {
    if (selectedMesh) {
      restoreMesh(selectedMesh);
      selectedMesh = null;
    }
    return;
  }

  const hitMesh = intersects[0].object;

  if (!hitMesh.isMesh) {
    return;
  }

  if (selectedMesh && selectedMesh !== hitMesh) {
    restoreMesh(selectedMesh);
  }

  if (selectedMesh === hitMesh) {
    restoreMesh(hitMesh);
    selectedMesh = null;
    return;
  }

  restoreMesh(hitMesh);
  highlightMesh(hitMesh);
  selectedMesh = hitMesh;
});

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  if (model) {
    model.rotation.y += 0.004;
  }

  renderer.render(scene, camera);
}

animate();

bindResponsiveRenderer({ container, camera, renderer });

window.addEventListener('beforeunload', () => {
  dracoLoader.dispose();
  ktx2Loader.dispose();
});