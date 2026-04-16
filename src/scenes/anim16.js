import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('anim16');

if (!container) {
  throw new Error('Container #anim16 non trovato');
}

function getSize() {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight
  };
}

function createCausticTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Impossibile creare il contesto 2D per la texture caustic');
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(canvas.width / 2, canvas.height / 2);

  const core = context.createRadialGradient(0, 0, 40, 0, 0, 350);
  core.addColorStop(0, 'rgba(255,255,255,0.96)');
  core.addColorStop(0.12, 'rgba(255,255,255,0.56)');
  core.addColorStop(0.32, 'rgba(255,255,255,0.14)');
  core.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = core;
  context.fillRect(-420, -420, 840, 840);

  context.globalCompositeOperation = 'lighter';

  for (let index = 0; index < 22; index++) {
    context.save();
    context.rotate(-0.95 + index * 0.09 + (index % 3) * 0.03);
    context.scale(1.2 + (index % 4) * 0.14, 0.2 + (index % 5) * 0.03);

    const streak = context.createLinearGradient(-360, 0, 360, 0);
    streak.addColorStop(0, 'rgba(255,255,255,0)');
    streak.addColorStop(0.2, 'rgba(255,255,255,0.05)');
    streak.addColorStop(0.48, 'rgba(255,255,255,0.36)');
    streak.addColorStop(0.52, 'rgba(255,255,255,0.72)');
    streak.addColorStop(0.8, 'rgba(255,255,255,0.05)');
    streak.addColorStop(1, 'rgba(255,255,255,0)');

    context.fillStyle = streak;
    context.beginPath();
    context.ellipse(0, 0, 360, 48, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  for (let index = 0; index < 90; index++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 320;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const radius = 10 + Math.random() * 40;
    const alpha = 0.02 + Math.random() * 0.06;
    const blob = context.createRadialGradient(x, y, 0, x, y, radius);
    blob.addColorStop(0, `rgba(255,255,255,${alpha})`);
    blob.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = blob;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function setBeamTransform(mesh, start, end, radiusX, radiusZ) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();

  if (length < 0.001) {
    mesh.visible = false;
    return;
  }

  mesh.visible = true;
  mesh.position.copy(start).addScaledVector(direction, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.scale.set(radiusX, length, radiusZ);
}

function intersectRayWithY(origin, direction, y) {
  if (Math.abs(direction.y) < 0.0001) {
    return null;
  }

  const distance = (y - origin.y) / direction.y;
  if (distance <= 0) {
    return null;
  }

  return origin.clone().addScaledVector(direction, distance);
}

function intersectRayWithZ(origin, direction, z) {
  if (Math.abs(direction.z) < 0.0001) {
    return null;
  }

  const distance = (z - origin.z) / direction.z;
  if (distance <= 0) {
    return null;
  }

  return origin.clone().addScaledVector(direction, distance);
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050912);
scene.fog = new THREE.FogExp2(0x09101b, 0.017);

const { width, height } = getSize();
const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
camera.position.set(0.15, 0.95, 7.4);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.98;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.style.display = 'block';
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4.8;
controls.maxDistance = 9.6;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(0, 0.45, 0);

const ambientLight = new THREE.AmbientLight(0x9fb6d4, 0.14);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0x415d84, 0x0a0d12, 0.22);
scene.add(hemiLight);

const keyLight = new THREE.SpotLight(0xf4f7ff, 75, 28, Math.PI * 0.13, 0.32, 1.35);
keyLight.position.set(2.7, 5.6, 3.4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.bias = -0.00008;
keyLight.shadow.radius = 6;
keyLight.target.position.set(0, 0.2, 0.15);
scene.add(keyLight);
scene.add(keyLight.target);

const fillLight = new THREE.PointLight(0x78b8ff, 3.8, 16, 2);
fillLight.position.set(-2.9, 0.4, 2.7);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xffd4b0, 2.6, 12, 2);
rimLight.position.set(1.8, 1.6, -3.1);
scene.add(rimLight);

const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0x0a1320,
  roughness: 0.92,
  metalness: 0.04
});

const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x0d1520,
  roughness: 0.34,
  metalness: 0.08
});

const backWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), wallMaterial);
backWall.position.set(0, 1.2, -5.2);
backWall.receiveShadow = true;
scene.add(backWall);

const floor = new THREE.Mesh(new THREE.CircleGeometry(6.6, 96), floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.82;
floor.receiveShadow = true;
scene.add(floor);

const leftPanel = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), wallMaterial.clone());
leftPanel.position.set(-4.8, 1.0, -1.6);
leftPanel.rotation.y = Math.PI * 0.34;
scene.add(leftPanel);

const rightPanel = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), wallMaterial.clone());
rightPanel.position.set(4.8, 1.0, -1.2);
rightPanel.rotation.y = -Math.PI * 0.34;
scene.add(rightPanel);

const wallHalo = new THREE.Mesh(
  new THREE.CircleGeometry(2.8, 64),
  new THREE.MeshBasicMaterial({
    color: 0x2f5f8d,
    transparent: true,
    opacity: 0.11,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
wallHalo.position.set(0.15, 1.5, -5.08);
scene.add(wallHalo);

const floorReflection = new THREE.Mesh(
  new THREE.CircleGeometry(2.4, 64),
  new THREE.MeshBasicMaterial({
    color: 0x72b8ff,
    transparent: true,
    opacity: 0.05,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
floorReflection.rotation.x = -Math.PI / 2;
floorReflection.position.y = -1.815;
scene.add(floorReflection);

const contactShadow = new THREE.Mesh(
  new THREE.CircleGeometry(1.45, 48),
  new THREE.MeshBasicMaterial({
    color: 0x02050c,
    transparent: true,
    opacity: 0.3,
    depthWrite: false
  })
);
contactShadow.rotation.x = -Math.PI / 2;
contactShadow.position.y = -1.81;
scene.add(contactShadow);

const prismGroup = new THREE.Group();
scene.add(prismGroup);

const prism = new THREE.Mesh(
  new THREE.CylinderGeometry(1.08, 1.08, 2.35, 3, 1, false),
  new THREE.MeshPhysicalMaterial({
    color: 0xe6f1ff,
    transmission: 0.98,
    transparent: true,
    opacity: 1,
    roughness: 0.02,
    metalness: 0,
    thickness: 1.6,
    ior: 1.46,
    reflectivity: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    attenuationDistance: 2.2,
    attenuationColor: new THREE.Color(0x97cfff)
  })
);
prism.castShadow = true;
prism.receiveShadow = true;
prism.rotation.y = Math.PI / 6;
prismGroup.add(prism);

const prismInnerGlow = new THREE.Mesh(
  new THREE.CylinderGeometry(0.62, 0.62, 1.45, 3, 1, false),
  new THREE.MeshBasicMaterial({
    color: 0xbfe1ff,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
prismInnerGlow.rotation.y = Math.PI / 6;
prismGroup.add(prismInnerGlow);

const prismEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.CylinderGeometry(1.085, 1.085, 2.355, 3, 1, false)),
  new THREE.LineBasicMaterial({
    color: 0xf6fbff,
    transparent: true,
    opacity: 0.22
  })
);
prismEdges.rotation.y = Math.PI / 6;
prismGroup.add(prismEdges);

const beamGeometry = new THREE.CylinderGeometry(1, 1, 1, 24, 1, true);

const incomingBeam = new THREE.Mesh(
  beamGeometry,
  new THREE.MeshBasicMaterial({
    color: 0xd8ebff,
    transparent: true,
    opacity: 0.07,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  })
);
scene.add(incomingBeam);

const refractedBeam = new THREE.Mesh(
  beamGeometry,
  new THREE.MeshBasicMaterial({
    color: 0x84c8ff,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  })
);
scene.add(refractedBeam);

const causticTexture = createCausticTexture();

const floorCausticGroup = new THREE.Group();
floorCausticGroup.position.y = -1.815;
floorCausticGroup.rotation.x = -Math.PI / 2;
scene.add(floorCausticGroup);

const wallCausticGroup = new THREE.Group();
wallCausticGroup.position.z = -5.16;
scene.add(wallCausticGroup);

const floorCaustics = [
  { color: 0x7ecfff, opacity: 0.16, size: [2.6, 1.2], offset: -0.38 },
  { color: 0xffcf8c, opacity: 0.1, size: [2.1, 0.92], offset: 0.02 },
  { color: 0xff8dc7, opacity: 0.08, size: [1.8, 0.82], offset: 0.42 }
].map(({ color, opacity, size, offset }) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size[0], size[1]),
    new THREE.MeshBasicMaterial({
      color,
      map: causticTexture,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  mesh.userData.offset = offset;
  floorCausticGroup.add(mesh);
  return mesh;
});

const wallCaustics = [
  { color: 0x9fdcff, opacity: 0.08, size: [1.8, 1.28], offset: -0.24 },
  { color: 0xffc0df, opacity: 0.06, size: [1.46, 1.02], offset: 0.05 },
  { color: 0xffe7a2, opacity: 0.05, size: [1.22, 0.86], offset: 0.28 }
].map(({ color, opacity, size, offset }) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size[0], size[1]),
    new THREE.MeshBasicMaterial({
      color,
      map: causticTexture,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  mesh.userData.offset = offset;
  wallCausticGroup.add(mesh);
  return mesh;
});

const dustCount = 120;
const dustPositions = new Float32Array(dustCount * 3);

for (let index = 0; index < dustCount; index++) {
  dustPositions[index * 3] = (Math.random() - 0.5) * 3.2 + 0.6;
  dustPositions[index * 3 + 1] = -1 + Math.random() * 5.2;
  dustPositions[index * 3 + 2] = -1.2 + (Math.random() - 0.5) * 2.8;
}

const dust = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({
    color: 0xdbeaff,
    size: 0.03,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
);
dust.geometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
scene.add(dust);

const floorLevel = -1.815;
const wallDepth = -5.16;
const clock = new THREE.Clock();
const defaultFloorHit = new THREE.Vector3(0.55, floorLevel, -0.8);
const defaultWallHit = new THREE.Vector3(-0.35, 1.05, wallDepth);
const refractedDirection = new THREE.Vector3();
const floorTangent = new THREE.Vector3();
const wallTangent = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();
  prismGroup.position.y = 0.18 + Math.sin(time * 0.7) * 0.06;
  prismGroup.position.x = Math.sin(time * 0.35) * 0.08;
  prismGroup.rotation.y = Math.PI / 6 + time * 0.23;
  prismGroup.rotation.z = Math.sin(time * 0.55) * 0.075;
  prismGroup.rotation.x = Math.cos(time * 0.42) * 0.04;

  const prismWorldPosition = prismGroup.getWorldPosition(new THREE.Vector3());

  refractedDirection.set(0.5, -0.86, -0.42).applyQuaternion(prismGroup.quaternion).normalize();

  const floorHit = intersectRayWithY(prismWorldPosition, refractedDirection, floorLevel) ?? defaultFloorHit;
  const wallHit = intersectRayWithZ(prismWorldPosition, refractedDirection, wallDepth) ?? defaultWallHit;

  floorReflection.position.set(floorHit.x, floorLevel + 0.001, floorHit.z);
  floorReflection.scale.setScalar(1.05 + Math.sin(time * 1.1) * 0.05);
  floorReflection.material.opacity = 0.045 + Math.sin(time * 0.8) * 0.01;

  contactShadow.position.set(prismGroup.position.x * 0.46, floorLevel + 0.002, prismGroup.position.z * 0.3);
  contactShadow.scale.setScalar(1 + Math.sin(time * 0.7) * 0.03);

  setBeamTransform(incomingBeam, keyLight.position, prismWorldPosition, 0.12, 0.2);
  setBeamTransform(refractedBeam, prismWorldPosition, floorHit, 0.14, 0.24);
  incomingBeam.material.opacity = 0.06 + Math.sin(time * 0.9) * 0.008;
  refractedBeam.material.opacity = 0.055 + Math.cos(time * 1.0) * 0.008;

  floorCausticGroup.position.set(floorHit.x, floorLevel + 0.003, floorHit.z);
  floorTangent.set(refractedDirection.z, 0, -refractedDirection.x).normalize();
  if (floorTangent.lengthSq() < 0.001) {
    floorTangent.set(1, 0, 0);
  }

  const floorAngle = Math.atan2(floorTangent.z, floorTangent.x);
  floorCausticGroup.rotation.z = floorAngle;

  floorCaustics.forEach((mesh, index) => {
    const pulse = Math.sin(time * (0.9 + index * 0.18) + index) * 0.06;
    mesh.position.set(mesh.userData.offset, pulse * 0.6, 0);
    mesh.rotation.z = (index - 1) * 0.12 + Math.sin(time * 0.45 + index) * 0.04;
    mesh.scale.set(1 + pulse, 1 + pulse * 0.4, 1);
  });

  wallCausticGroup.position.set(wallHit.x, wallHit.y, wallDepth + 0.01);
  wallTangent.set(1, refractedDirection.y * 0.55, 0).normalize();
  const wallAngle = Math.atan2(wallTangent.y, wallTangent.x);
  wallCausticGroup.rotation.z = wallAngle;

  wallCaustics.forEach((mesh, index) => {
    const sway = Math.cos(time * (0.7 + index * 0.2) + index * 0.8) * 0.04;
    mesh.position.set(mesh.userData.offset, sway, 0);
    mesh.rotation.z = (index - 1) * 0.1 + Math.sin(time * 0.35 + index) * 0.035;
    mesh.scale.set(1 + sway * 0.8, 1 + sway * 0.4, 1);
  });

  wallHalo.material.opacity = 0.09 + Math.sin(time * 0.55) * 0.018;
  dust.rotation.y = time * 0.04;
  dust.position.x = Math.sin(time * 0.18) * 0.08;

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