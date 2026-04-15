import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const container = document.getElementById('anim4');

if (!container) {
  throw new Error('Container #anim4 non trovato');
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

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

const ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.183.2/examples/jsm/libs/basis/');
ktx2Loader.detectSupport(renderer);

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.setKTX2Loader(ktx2Loader);
loader.setMeshoptDecoder(MeshoptDecoder);

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

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);

  model.traverse((child) => {
    if (child.isMesh) {
      storeMaterialState(child);
    }
  });

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

window.addEventListener('resize', () => {
  const { width, height } = getContainerSize();

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
});

window.addEventListener('beforeunload', () => {
  dracoLoader.dispose();
  ktx2Loader.dispose();
});