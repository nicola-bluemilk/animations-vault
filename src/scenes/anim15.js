import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { bindResponsiveRenderer, createRenderer, getViewportSize, requireContainer } from '../utils/three-scene.js';

const container = requireContainer('anim15');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050914);
scene.fog = new THREE.FogExp2(0x0c1323, 0.07);

const { width, height } = getViewportSize(container);
const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
camera.position.set(0, 0.1, 8.4);

const renderer = createRenderer(container, width, height, { antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 12;

scene.add(new THREE.AmbientLight(0xc6d7ff, 0.55));

const bluePoleLight = new THREE.PointLight(0x6bc8ff, 18, 20, 2);
bluePoleLight.position.set(-2.6, 0, 1.2);
scene.add(bluePoleLight);

const magentaPoleLight = new THREE.PointLight(0xff6ad5, 18, 20, 2);
magentaPoleLight.position.set(2.6, 0, -1.2);
scene.add(magentaPoleLight);

const poleRadius = 0.34;

const leftPole = new THREE.Mesh(
  new THREE.SphereGeometry(poleRadius, 24, 24),
  new THREE.MeshBasicMaterial({ color: 0x7ed3ff })
);
leftPole.position.copy(bluePoleLight.position);
scene.add(leftPole);

const rightPole = new THREE.Mesh(
  new THREE.SphereGeometry(poleRadius, 24, 24),
  new THREE.MeshBasicMaterial({ color: 0xff7ede })
);
rightPole.position.copy(magentaPoleLight.position);
scene.add(rightPole);

const filamentCount = 10;
const filamentSegments = 18;
const filaments = [];
const filamentDirection = new THREE.Vector3();
const filamentSide = new THREE.Vector3();
const filamentUp = new THREE.Vector3();
const startAnchor = new THREE.Vector3();
const endAnchor = new THREE.Vector3();
const point = new THREE.Vector3();

for (let index = 0; index < filamentCount; index++) {
  const hue = 0.55 + index * 0.03;
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(hue, 0.8, 0.72),
    emissive: new THREE.Color().setHSL(hue + 0.05, 0.85, 0.42),
    emissiveIntensity: 0.4,
    roughness: 0.45,
    metalness: 0,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(2, 0, 0)
      ]),
      90,
      0.035,
      8,
      false
    ),
    material
  );

  scene.add(mesh);
  filaments.push({
    mesh,
    phase: index * 0.7,
    arc: -1.6 + (index / (filamentCount - 1)) * 3.2,
    thickness: 0.028 + Math.random() * 0.02,
    sway: 0.35 + Math.random() * 0.2,
    lift: (Math.random() - 0.5) * 0.35
  });
}

function buildFilamentGeometry(data, time) {
  const points = [];

  filamentDirection.subVectors(rightPole.position, leftPole.position).normalize();
  filamentSide.crossVectors(filamentDirection, new THREE.Vector3(0, 1, 0));

  if (filamentSide.lengthSq() < 1e-5) {
    filamentSide.crossVectors(filamentDirection, new THREE.Vector3(0, 0, 1));
  }

  filamentSide.normalize();
  filamentUp.crossVectors(filamentSide, filamentDirection).normalize();

  startAnchor.copy(leftPole.position).addScaledVector(filamentDirection, poleRadius * 0.92);
  endAnchor.copy(rightPole.position).addScaledVector(filamentDirection, -poleRadius * 0.92);

  for (let index = 0; index < filamentSegments; index++) {
    const progress = index / (filamentSegments - 1);
    const bend = Math.sin(progress * Math.PI);
    const arcOffset = data.arc * bend * 0.26;
    const verticalWave = Math.sin(progress * Math.PI * 2 + time * 1.8 + data.phase) * data.sway * bend;
    const twist = Math.cos(progress * 7 + time * 1.2 + data.phase) * 0.12 * bend;

    point.lerpVectors(startAnchor, endAnchor, progress);
    point.addScaledVector(filamentSide, arcOffset + twist);
    point.addScaledVector(filamentUp, data.lift * bend + verticalWave);

    points.push(point.clone());
  }

  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points),
    120,
    data.thickness,
    8,
    false
  );
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();
  leftPole.position.y = Math.sin(time * 1.1) * 0.35;
  rightPole.position.y = Math.cos(time * 1.2 + 1.3) * 0.35;
  bluePoleLight.position.copy(leftPole.position);
  magentaPoleLight.position.copy(rightPole.position);

  for (const filament of filaments) {
    const nextGeometry = buildFilamentGeometry(filament, time);
    filament.mesh.geometry.dispose();
    filament.mesh.geometry = nextGeometry;
    filament.mesh.material.opacity = 0.18 + (Math.sin(time * 2 + filament.phase) + 1) * 0.08;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

bindResponsiveRenderer({ container, camera, renderer });