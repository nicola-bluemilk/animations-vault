import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('anim12');

if (!container) {
  throw new Error('Container #anim12 non trovato');
}

function getSize() {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight
  };
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1120);
scene.fog = new THREE.FogExp2(0x13203a, 0.026);

const { width, height } = getSize();
const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
camera.position.set(0, 0.35, 5.6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.domElement.style.display = 'block';
container.appendChild(renderer.domElement);

const modeBadge = document.createElement('div');
modeBadge.style.position = 'absolute';
modeBadge.style.top = '20px';
modeBadge.style.left = '20px';
modeBadge.style.zIndex = '8';
modeBadge.style.padding = '10px 14px';
modeBadge.style.border = '1px solid rgba(196, 216, 255, 0.18)';
modeBadge.style.borderRadius = '999px';
modeBadge.style.background = 'rgba(8, 14, 24, 0.62)';
modeBadge.style.backdropFilter = 'blur(12px)';
modeBadge.style.color = '#dfe9ff';
modeBadge.style.font = '500 0.92rem "Avenir Next", "Segoe UI", sans-serif';
modeBadge.style.letterSpacing = '0.03em';
container.appendChild(modeBadge);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 3.6;
controls.maxDistance = 9;

scene.add(new THREE.AmbientLight(0xc8dcff, 0.55));

const keyLight = new THREE.PointLight(0xe3f0ff, 22, 18, 2);
keyLight.position.set(3.8, 2.6, 4.5);
scene.add(keyLight);

const coolLight = new THREE.PointLight(0x6ba8ff, 18, 18, 2);
coolLight.position.set(-4, -1.6, 3);
scene.add(coolLight);

const backLight = new THREE.PointLight(0x2c6cff, 10, 24, 2);
backLight.position.set(0, 0, -6);
scene.add(backLight);

const backdropShell = new THREE.Mesh(
  new THREE.SphereGeometry(18, 32, 32),
  new THREE.MeshBasicMaterial({
    color: 0x13203a,
    side: THREE.BackSide
  })
);
scene.add(backdropShell);

const starCount = 900;
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);
const starColor = new THREE.Color();

for (let index = 0; index < starCount; index++) {
  const stride = index * 3;
  const radius = 10 + Math.random() * 7;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  starPositions[stride] = Math.sin(phi) * Math.cos(theta) * radius;
  starPositions[stride + 1] = Math.cos(phi) * radius * 0.75;
  starPositions[stride + 2] = Math.sin(phi) * Math.sin(theta) * radius - 3;

  starColor.setHSL(0.56 + Math.random() * 0.1, 0.35, 0.7 + Math.random() * 0.2);
  starColors[stride] = starColor.r;
  starColors[stride + 1] = starColor.g;
  starColors[stride + 2] = starColor.b;
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

const starField = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({
    size: 0.06,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
scene.add(starField);

const nebulaField = new THREE.Mesh(
  new THREE.SphereGeometry(10.5, 24, 24),
  new THREE.MeshBasicMaterial({
    color: 0x233759,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
scene.add(nebulaField);

const orbGeometry = new THREE.IcosahedronGeometry(1.35, 64);
const basePositions = orbGeometry.attributes.position.array.slice();

const orbMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x7c889e,
  metalness: 1,
  roughness: 0.18,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  reflectivity: 1,
  sheen: 0.2,
  sheenColor: 0xcdd9e8,
  envMapIntensity: 1.25
});

const orb = new THREE.Mesh(orbGeometry, orbMaterial);
scene.add(orb);

const halo = new THREE.Mesh(
  new THREE.TorusGeometry(2.2, 0.025, 16, 180),
  new THREE.MeshBasicMaterial({
    color: 0x6fafff,
    transparent: true,
    opacity: 0.22
  })
);
halo.rotation.x = Math.PI / 2;
scene.add(halo);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(3.6, 60),
  new THREE.MeshBasicMaterial({ color: 0x182437, transparent: true, opacity: 0.48 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.1;
scene.add(floor);

const clock = new THREE.Clock();
const normal = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const physicsModes = [
  {
    label: 'Mercury Drift',
    rippleSpeed: 0.95,
    rippleAmount: 0.028,
    rippleFreqX: 2.2,
    rippleFreqY: 1.6,
    pulseSpeed: 1.1,
    pulseAmount: 0.018,
    pulseFreq: 2.4,
    driftSpeed: 0.55,
    driftAmount: 0.012,
    driftFreqX: 1.4,
    driftFreqZ: 1.2,
    warpSpeed: 0.7,
    warpAmount: 0.008,
    warpFreqX: 1.2,
    warpFreqY: 1.5,
    warpFreqZ: 1.0,
    shearSpeed: 0.5,
    shearAmount: 0.004,
    shearFreq: 1.8,
    detailSpeed: 1.4,
    detailAmount: 0.006,
    detailFreq: 4.2,
    spin: 0.004
  },
  {
    label: 'Dense Pulse',
    rippleSpeed: 1.35,
    rippleAmount: 0.016,
    rippleFreqX: 1.1,
    rippleFreqY: 1.0,
    pulseSpeed: 2.8,
    pulseAmount: 0.042,
    pulseFreq: 6.4,
    driftSpeed: 0.9,
    driftAmount: 0.006,
    driftFreqX: 0.8,
    driftFreqZ: 0.9,
    warpSpeed: 1.9,
    warpAmount: 0.014,
    warpFreqX: 3.6,
    warpFreqY: 3.1,
    warpFreqZ: 2.8,
    shearSpeed: 1.4,
    shearAmount: 0.004,
    shearFreq: 3.2,
    detailSpeed: 2.4,
    detailAmount: 0.008,
    detailFreq: 6.8,
    spin: 0.003
  },
  {
    label: 'Tidal Shear',
    rippleSpeed: 1.2,
    rippleAmount: 0.026,
    rippleFreqX: 0.9,
    rippleFreqY: 3.8,
    pulseSpeed: 0.95,
    pulseAmount: 0.014,
    pulseFreq: 2.1,
    driftSpeed: 1.4,
    driftAmount: 0.022,
    driftFreqX: 2.9,
    driftFreqZ: 3.6,
    warpSpeed: 1.1,
    warpAmount: 0.016,
    warpFreqX: 0.8,
    warpFreqY: 4.4,
    warpFreqZ: 1.7,
    shearSpeed: 1.9,
    shearAmount: 0.014,
    shearFreq: 5.0,
    detailSpeed: 1.8,
    detailAmount: 0.007,
    detailFreq: 5.4,
    spin: 0.0048
  },
  {
    label: 'Viscous Fold',
    rippleSpeed: 0.65,
    rippleAmount: 0.018,
    rippleFreqX: 1.4,
    rippleFreqY: 1.8,
    pulseSpeed: 0.72,
    pulseAmount: 0.012,
    pulseFreq: 1.6,
    driftSpeed: 0.95,
    driftAmount: 0.016,
    driftFreqX: 1.7,
    driftFreqZ: 1.5,
    warpSpeed: 0.85,
    warpAmount: 0.018,
    warpFreqX: 2.2,
    warpFreqY: 2.5,
    warpFreqZ: 2.1,
    shearSpeed: 0.9,
    shearAmount: 0.008,
    shearFreq: 2.7,
    detailSpeed: 1.1,
    detailAmount: 0.009,
    detailFreq: 7.6,
    spin: 0.0026
  },
  {
    label: 'Glass Ripple',
    rippleSpeed: 1.7,
    rippleAmount: 0.014,
    rippleFreqX: 4.2,
    rippleFreqY: 4.6,
    pulseSpeed: 2.1,
    pulseAmount: 0.011,
    pulseFreq: 4.1,
    driftSpeed: 1.25,
    driftAmount: 0.006,
    driftFreqX: 2.4,
    driftFreqZ: 2.2,
    warpSpeed: 2.2,
    warpAmount: 0.012,
    warpFreqX: 5.2,
    warpFreqY: 5.8,
    warpFreqZ: 4.9,
    shearSpeed: 1.55,
    shearAmount: 0.004,
    shearFreq: 4.4,
    detailSpeed: 3.1,
    detailAmount: 0.008,
    detailFreq: 9.2,
    spin: 0.0052
  }
];

let activeModeIndex = 0;
let currentMode = { ...physicsModes[0] };
let sourceMode = { ...physicsModes[0] };
let targetMode = { ...physicsModes[0] };
let modeBlend = 1;

function updateModeBadge() {
  modeBadge.textContent = `Liquid Mode: ${physicsModes[activeModeIndex].label}`;
}

function beginModeTransition(nextIndex) {
  activeModeIndex = nextIndex;
  sourceMode = { ...currentMode };
  targetMode = { ...physicsModes[nextIndex] };
  modeBlend = 0;
  updateModeBadge();
}

function syncCurrentMode(deltaTime) {
  modeBlend = Math.min(modeBlend + deltaTime * 1.1, 1);

  const easedBlend = modeBlend * modeBlend * (3 - 2 * modeBlend);

  currentMode = {
    label: targetMode.label,
    rippleSpeed: THREE.MathUtils.lerp(sourceMode.rippleSpeed, targetMode.rippleSpeed, easedBlend),
    rippleAmount: THREE.MathUtils.lerp(sourceMode.rippleAmount, targetMode.rippleAmount, easedBlend),
    pulseSpeed: THREE.MathUtils.lerp(sourceMode.pulseSpeed, targetMode.pulseSpeed, easedBlend),
    pulseAmount: THREE.MathUtils.lerp(sourceMode.pulseAmount, targetMode.pulseAmount, easedBlend),
    pulseFreq: THREE.MathUtils.lerp(sourceMode.pulseFreq, targetMode.pulseFreq, easedBlend),
    driftSpeed: THREE.MathUtils.lerp(sourceMode.driftSpeed, targetMode.driftSpeed, easedBlend),
    driftAmount: THREE.MathUtils.lerp(sourceMode.driftAmount, targetMode.driftAmount, easedBlend),
    rippleFreqX: THREE.MathUtils.lerp(sourceMode.rippleFreqX, targetMode.rippleFreqX, easedBlend),
    rippleFreqY: THREE.MathUtils.lerp(sourceMode.rippleFreqY, targetMode.rippleFreqY, easedBlend),
    driftFreqX: THREE.MathUtils.lerp(sourceMode.driftFreqX, targetMode.driftFreqX, easedBlend),
    driftFreqZ: THREE.MathUtils.lerp(sourceMode.driftFreqZ, targetMode.driftFreqZ, easedBlend),
    warpSpeed: THREE.MathUtils.lerp(sourceMode.warpSpeed, targetMode.warpSpeed, easedBlend),
    warpAmount: THREE.MathUtils.lerp(sourceMode.warpAmount, targetMode.warpAmount, easedBlend),
    warpFreqX: THREE.MathUtils.lerp(sourceMode.warpFreqX, targetMode.warpFreqX, easedBlend),
    warpFreqY: THREE.MathUtils.lerp(sourceMode.warpFreqY, targetMode.warpFreqY, easedBlend),
    warpFreqZ: THREE.MathUtils.lerp(sourceMode.warpFreqZ, targetMode.warpFreqZ, easedBlend),
    shearSpeed: THREE.MathUtils.lerp(sourceMode.shearSpeed, targetMode.shearSpeed, easedBlend),
    shearAmount: THREE.MathUtils.lerp(sourceMode.shearAmount, targetMode.shearAmount, easedBlend),
    shearFreq: THREE.MathUtils.lerp(sourceMode.shearFreq, targetMode.shearFreq, easedBlend),
    detailSpeed: THREE.MathUtils.lerp(sourceMode.detailSpeed, targetMode.detailSpeed, easedBlend),
    detailAmount: THREE.MathUtils.lerp(sourceMode.detailAmount, targetMode.detailAmount, easedBlend),
    detailFreq: THREE.MathUtils.lerp(sourceMode.detailFreq, targetMode.detailFreq, easedBlend),
    spin: THREE.MathUtils.lerp(sourceMode.spin, targetMode.spin, easedBlend)
  };
}

function handleOrbClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  if (raycaster.intersectObject(orb).length > 0) {
    beginModeTransition((activeModeIndex + 1) % physicsModes.length);
  }
}

renderer.domElement.addEventListener('click', handleOrbClick);
updateModeBadge();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();
  const time = clock.elapsedTime;
  const position = orbGeometry.attributes.position;

  syncCurrentMode(deltaTime);

  for (let index = 0; index < position.count; index++) {
    const stride = index * 3;
    const x = basePositions[stride];
    const y = basePositions[stride + 1];
    const z = basePositions[stride + 2];
    const radial = Math.sqrt(x * x + y * y + z * z);

    normal.set(x, y, z).normalize();

    const ripple = Math.sin(
      time * currentMode.rippleSpeed +
      x * currentMode.rippleFreqX +
      y * currentMode.rippleFreqY
    ) * currentMode.rippleAmount;
    const pulse = Math.cos(
      time * currentMode.pulseSpeed +
      radial * currentMode.pulseFreq +
      z * 0.6
    ) * currentMode.pulseAmount;
    const drift = Math.sin(
      time * currentMode.driftSpeed +
      x * currentMode.driftFreqX +
      z * currentMode.driftFreqZ
    ) * currentMode.driftAmount;
    const warp = Math.sin(
      time * currentMode.warpSpeed +
      x * currentMode.warpFreqX +
      y * currentMode.warpFreqY +
      z * currentMode.warpFreqZ
    ) * currentMode.warpAmount;
    const shear = Math.sin(time * currentMode.shearSpeed + y * currentMode.shearFreq + x * 0.8) * currentMode.shearAmount * normal.y;
    const detail = Math.sin(time * currentMode.detailSpeed + (x - y + z) * currentMode.detailFreq) * currentMode.detailAmount;
    const radius = 1 + ripple + pulse + drift + warp + shear + detail;

    position.setXYZ(
      index,
      normal.x * radius * 1.35,
      normal.y * radius * 1.35,
      normal.z * radius * 1.35
    );
  }

  position.needsUpdate = true;
  orbGeometry.computeVertexNormals();

  orb.rotation.y += currentMode.spin;
  orb.rotation.x = Math.sin(time * 0.6) * 0.12;
  halo.rotation.z += 0.0035;
  halo.material.opacity = 0.18 + Math.sin(time * 1.5) * 0.04;
  starField.rotation.y += 0.00035;
  starField.rotation.x = Math.sin(time * 0.08) * 0.06;
  nebulaField.rotation.y -= 0.0007;
  nebulaField.material.opacity = 0.08 + Math.sin(time * 0.35) * 0.018;

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  const { width, height } = getSize();

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
});