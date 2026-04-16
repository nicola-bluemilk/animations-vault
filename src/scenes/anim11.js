import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('anim11');

if (!container) {
  throw new Error('Container #anim11 non trovato');
}

function getSize() {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight
  };
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0807);
scene.fog = new THREE.FogExp2(0x140d0b, 0.12);

const { width, height } = getSize();
const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
camera.position.set(0, 1.8, 7.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
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
controls.minDistance = 4.5;
controls.maxDistance = 11;
controls.maxPolarAngle = Math.PI * 0.48;

scene.add(new THREE.AmbientLight(0xffe3d1, 0.8));

const keyLight = new THREE.PointLight(0xffbf8a, 18, 18, 2);
keyLight.position.set(0, 2.8, 4);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x8a5a38, 12, 18, 2);
rimLight.position.set(-2.8, 1.4, -3);
scene.add(rimLight);

const base = new THREE.Mesh(
  new THREE.CylinderGeometry(1.35, 1.7, 0.28, 48),
  new THREE.MeshStandardMaterial({
    color: 0x2c1913,
    roughness: 0.78,
    metalness: 0.08
  })
);
base.position.y = -2.15;
scene.add(base);

const glowPlate = new THREE.Mesh(
  new THREE.CircleGeometry(1.25, 48),
  new THREE.MeshBasicMaterial({
    color: 0xffb07a,
    transparent: true,
    opacity: 0.26
  })
);
glowPlate.rotation.x = -Math.PI / 2;
glowPlate.position.y = -2.0;
scene.add(glowPlate);

const ribbonCount = 6;
const pointCount = 22;
const ribbonRadius = 0.08;
const ribbonMeshes = [];
const ribbonData = [];

for (let index = 0; index < ribbonCount; index++) {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.08 + index * 0.015, 0.46, 0.7),
    emissive: 0x9a5130,
    emissiveIntensity: 0.34,
    roughness: 0.92,
    metalness: 0,
    transparent: true,
    opacity: 0.34,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -2, 0),
        new THREE.Vector3(0, 2, 0)
      ]),
      40,
      ribbonRadius,
      8,
      false
    ),
    material
  );

  scene.add(mesh);
  ribbonMeshes.push(mesh);
  ribbonData.push({
    angle: (index / ribbonCount) * Math.PI * 2,
    radius: 0.34 + Math.random() * 0.3,
    heightOffset: Math.random() * 1.2,
    swirl: 0.28 + Math.random() * 0.22,
    speed: 0.65 + Math.random() * 0.35
  });
}

function rebuildRibbonGeometry(mesh, data, time) {
  const points = [];

  for (let index = 0; index < pointCount; index++) {
    const progress = index / (pointCount - 1);
    const height = -1.95 + progress * 5.4;
    const twist = time * data.speed + progress * 2.6 + data.heightOffset;
    const localRadius = data.radius * (1.0 - progress * 0.52);
    const offsetX = Math.cos(data.angle + twist) * localRadius;
    const offsetZ = Math.sin(data.angle + twist * 0.82) * localRadius;
    const driftX = Math.sin(progress * 5.8 + time * 0.45 + data.heightOffset) * data.swirl;
    const driftZ = Math.cos(progress * 4.4 + time * 0.38 + data.angle) * data.swirl * 0.7;

    points.push(
      new THREE.Vector3(
        offsetX + driftX * progress * 0.45,
        height,
        offsetZ + driftZ * progress * 0.38
      )
    );
  }

  const nextGeometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points),
    56,
    ribbonRadius * (0.95 + Math.sin(time + data.angle) * 0.08),
    10,
    false
  );

  mesh.geometry.dispose();
  mesh.geometry = nextGeometry;
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  for (let index = 0; index < ribbonMeshes.length; index++) {
    rebuildRibbonGeometry(ribbonMeshes[index], ribbonData[index], time);
  }

  glowPlate.material.opacity = 0.2 + Math.sin(time * 1.3) * 0.04;
  base.rotation.y = Math.sin(time * 0.22) * 0.08;

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