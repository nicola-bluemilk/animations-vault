import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('anim7');

if (!container) {
  throw new Error('Container #anim7 non trovato');
}

function getContainerSize() {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight
  };
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050816);
scene.fog = new THREE.FogExp2(0x050816, 0.08);

const { width, height } = getContainerSize();
const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
camera.position.set(0, 1.2, 5.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
renderer.domElement.style.display = 'block';
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.4;

const ambient = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambient);

const keyLight = new THREE.PointLight(0x5ee7ff, 18, 20, 2);
keyLight.position.set(3.5, 2, 3.5);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0xff4d8d, 16, 20, 2);
fillLight.position.set(-3, -1, 2);
scene.add(fillLight);

const geometry = new THREE.TorusKnotGeometry(1.1, 0.32, 220, 32);
const material = new THREE.MeshStandardMaterial({
  color: 0x111827,
  emissive: 0x1b6bff,
  emissiveIntensity: 1.6,
  metalness: 0.55,
  roughness: 0.2
});

const knot = new THREE.Mesh(geometry, material);
scene.add(knot);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(2.25, 0.03, 24, 160),
  new THREE.MeshBasicMaterial({ color: 0xff7a45 })
);
ring.rotation.x = Math.PI / 2;
scene.add(ring);

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  knot.rotation.x += 0.004;
  knot.rotation.y += 0.008;
  ring.rotation.z -= 0.003;

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