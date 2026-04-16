import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('anim13');

if (!container) {
  throw new Error('Container #anim13 non trovato');
}

function getSize() {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight
  };
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040711);
scene.fog = new THREE.FogExp2(0x09101d, 0.085);

const { width, height } = getSize();
const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 100);
camera.position.set(0, 0, 9.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.domElement.style.display = 'block';
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 14;

scene.add(new THREE.AmbientLight(0xaec4ff, 0.7));

const keyLight = new THREE.PointLight(0x79d7ff, 22, 28, 2);
keyLight.position.set(3.5, 2.5, 6);
scene.add(keyLight);

const magentaLight = new THREE.PointLight(0xff5ece, 18, 28, 2);
magentaLight.position.set(-4, -1.5, 2);
scene.add(magentaLight);

const backLight = new THREE.PointLight(0x4b7dff, 12, 30, 2);
backLight.position.set(0, 0, -8);
scene.add(backLight);

const ribbonCount = 8;
const loopPoints = 34;
const baseRadius = 1.7;
const ribbonMeshes = [];
const ribbonData = [];

for (let index = 0; index < ribbonCount; index++) {
  const hue = 0.53 + index * 0.055;
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(hue, 0.8, 0.68),
    emissive: new THREE.Color().setHSL(hue + 0.05, 0.85, 0.45),
    emissiveIntensity: 0.48,
    roughness: 0.4,
    metalness: 0,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 1, 0)
      ], true),
      120,
      0.05,
      10,
      true
    ),
    material
  );

  scene.add(mesh);
  ribbonMeshes.push(mesh);
  ribbonData.push({
    depth: -9 + index * 2.2,
    phase: index * 0.55,
    radius: baseRadius + (Math.random() - 0.5) * 0.35,
    wobble: 0.18 + Math.random() * 0.16,
    speed: 0.45 + Math.random() * 0.4,
    thickness: 0.04 + Math.random() * 0.025,
    tilt: (Math.random() - 0.5) * 0.18
  });
}

function buildLoopGeometry(data, time) {
  const points = [];

  for (let index = 0; index < loopPoints; index++) {
    const progress = index / loopPoints;
    const angle = progress * Math.PI * 2;
    const pulse = Math.sin(angle * 3 + time * data.speed + data.phase) * data.wobble;
    const radius = data.radius + pulse;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * (0.75 + Math.cos(angle * 2 + data.phase) * 0.08);
    const z = data.depth + Math.sin(angle * 2 + time * 0.8 + data.phase) * 0.45;

    points.push(new THREE.Vector3(x, y, z));
  }

  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points, true),
    140,
    data.thickness * (0.92 + Math.sin(time * 1.2 + data.phase) * 0.08),
    10,
    true
  );
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  for (let index = 0; index < ribbonMeshes.length; index++) {
    const mesh = ribbonMeshes[index];
    const data = ribbonData[index];

    const nextGeometry = buildLoopGeometry(data, time);
    mesh.geometry.dispose();
    mesh.geometry = nextGeometry;
    mesh.rotation.z = data.tilt;
    mesh.rotation.x = 0;
    mesh.material.opacity = 0.2 + (Math.sin(time * 1.1 + data.phase) + 1) * 0.06;
  }

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