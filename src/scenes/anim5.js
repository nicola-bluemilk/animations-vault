import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addSoftStudioLights, createSharedGltfLoader, frameObject } from '../utils/gltf-viewer.js';
import { bindResponsiveRenderer, createRenderer, getViewportSize, requireContainer } from '../utils/three-scene.js';

const container = requireContainer('anim5');

function normalizeAngle(angle) {
  const tau = Math.PI * 2;
  return ((angle + Math.PI) % tau + tau) % tau - Math.PI;
}

function stepAngle(current, target, factor) {
  const delta = normalizeAngle(target - current);
  return current + delta * factor;
}

function describePoint(position, index) {
  const vertical = position.y > 0.12 ? 'sulla parte superiore' : position.y < -0.12 ? 'nella fascia inferiore' : 'nella zona centrale';
  const lateral = position.x > 0.12 ? 'verso destra' : position.x < -0.12 ? 'verso sinistra' : 'in asse frontale';

  return {
    title: `Punto ${index + 1}`,
    body: `Hotspot generato ${vertical} e ${lateral} del modello. Serve a simulare un dettaglio annotabile con focus dedicato.`
  };
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f1e8);

const { width, height } = getViewportSize(container);
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 5;

const renderer = createRenderer(container, width, height, { antialias: true });

const overlay = document.createElement('div');
overlay.className = 'hotspot-overlay';
overlay.innerHTML = `
  <svg class="hotspot-lines" aria-hidden="true">
    <line class="hotspot-line" x1="0" y1="0" x2="0" y2="0"></line>
  </svg>
  <aside class="hotspot-panel" hidden>
    <button class="hotspot-close" type="button" aria-label="Chiudi hotspot">Chiudi</button>
    <p class="eyebrow">Dettaglio selezionato</p>
    <h2 class="hotspot-title"></h2>
    <p class="hotspot-body"></p>
  </aside>
`;
container.appendChild(overlay);

const lineElement = overlay.querySelector('.hotspot-line');
const panelElement = overlay.querySelector('.hotspot-panel');
const titleElement = overlay.querySelector('.hotspot-title');
const bodyElement = overlay.querySelector('.hotspot-body');
const closeButton = overlay.querySelector('.hotspot-close');

lineElement.style.display = 'none';

addSoftStudioLights(scene);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const markerWorldPosition = new THREE.Vector3();

const { loader, dracoLoader, ktx2Loader } = createSharedGltfLoader(renderer);

let model = null;
let activeHotspot = null;
let targetRotationY = 0;
let autoRotate = true;
const hotspots = [];

function buildHotspots(size) {
  const markerGeometry = new THREE.SphereGeometry(Math.max(size.x, size.y, size.z) * 0.035, 24, 24);
  const hotspotPositions = [
    new THREE.Vector3(0, size.y * 0.22, size.z * 0.2),
    new THREE.Vector3(size.x * 0.08, -size.y * 0.22, size.z * 0.18),
    new THREE.Vector3(-size.x * 0.24, size.y * 0.01, size.z * 0.04)
  ];

  return hotspotPositions.map((localPosition, index) => {
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: 0x0d6c74,
      depthTest: false,
      depthWrite: false
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(localPosition);
    marker.renderOrder = 10;

    const content = describePoint(localPosition, index);
    marker.userData = {
      id: `hotspot-${index + 1}`,
      title: content.title,
      body: content.body,
      localPosition,
      defaultColor: markerMaterial.color.clone(),
      activeColor: new THREE.Color(0xd45c2d)
    };

    return marker;
  });
}

function setHotspotState(hotspot, isActive) {
  hotspot.material.color.copy(isActive ? hotspot.userData.activeColor : hotspot.userData.defaultColor);
  hotspot.scale.setScalar(isActive ? 1.45 : 1);
}

function focusHotspot(hotspot) {
  if (activeHotspot && activeHotspot !== hotspot) {
    setHotspotState(activeHotspot, false);
  }

  activeHotspot = hotspot;
  setHotspotState(hotspot, true);
  titleElement.textContent = hotspot.userData.title;
  bodyElement.textContent = hotspot.userData.body;
  panelElement.hidden = false;
  lineElement.style.display = 'block';
  autoRotate = false;
  controls.enableRotate = false;
  targetRotationY = Math.atan2(-hotspot.userData.localPosition.x, hotspot.userData.localPosition.z);
}

function resetHotspotView() {
  if (activeHotspot) {
    setHotspotState(activeHotspot, false);
  }

  activeHotspot = null;
  panelElement.hidden = true;
  lineElement.style.display = 'none';
  autoRotate = true;
  controls.enableRotate = true;
}

function updateOverlay() {
  if (!activeHotspot || panelElement.hidden) {
    return;
  }

  activeHotspot.getWorldPosition(markerWorldPosition);
  markerWorldPosition.project(camera);

  const rect = container.getBoundingClientRect();
  const x = (markerWorldPosition.x * 0.5 + 0.5) * rect.width;
  const y = (-markerWorldPosition.y * 0.5 + 0.5) * rect.height;
  const panelRect = panelElement.getBoundingClientRect();
  const x2 = panelRect.left - rect.left;
  const y2 = panelRect.top - rect.top + panelRect.height * 0.5;

  lineElement.setAttribute('x1', `${x}`);
  lineElement.setAttribute('y1', `${y}`);
  lineElement.setAttribute('x2', `${x2}`);
  lineElement.setAttribute('y2', `${y2}`);
}

loader.load('/models/rolex.glb', (gltf) => {
  model = gltf.scene;

  const { size } = frameObject(camera, model, controls);

  buildHotspots(size).forEach((hotspot) => {
    hotspots.push(hotspot);
    model.add(hotspot);
  });

  scene.add(model);
}, undefined, (error) => {
  console.error('Errore nel caricamento del modello GLB:', error);
});

renderer.domElement.addEventListener('click', (event) => {
  if (hotspots.length === 0) {
    return;
  }

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(hotspots, false);

  if (intersects.length === 0) {
    return;
  }

  focusHotspot(intersects[0].object);
});

closeButton.addEventListener('click', () => {
  resetHotspotView();
});

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  if (model) {
    if (autoRotate) {
      model.rotation.y += 0.004;
    } else {
      const delta = normalizeAngle(targetRotationY - model.rotation.y);

      if (Math.abs(delta) < 0.002) {
        model.rotation.y = targetRotationY;
      } else {
        model.rotation.y = stepAngle(model.rotation.y, targetRotationY, 0.08);
      }
    }
  }

  updateOverlay();
  renderer.render(scene, camera);
}

animate();

bindResponsiveRenderer({
  container,
  camera,
  renderer,
  onResize: () => {
    updateOverlay();
  }
});

window.addEventListener('beforeunload', () => {
  dracoLoader.dispose();
  ktx2Loader.dispose();
});