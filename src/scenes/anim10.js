import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const container = document.getElementById('anim10');

if (!container) throw new Error('Container #anim10 non trovato');

function getSize() {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight
  };
}

// =====================
// SCENE (UE STYLE)
// =====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060a);
scene.fog = new THREE.FogExp2(0x05060a, 0.12);

// =====================
// CAMERA (cinematic lens feel)
// =====================
const { width, height } = getSize();

const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
camera.position.set(0, 0.5, 8);

// =====================
// RENDERER (IMPORTANT FOR UE LOOK)
// =====================
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;

container.appendChild(renderer.domElement);

// =====================
// LIGHTING (UE STYLE)
// =====================
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

const key = new THREE.DirectionalLight(0xfff2dd, 3.2);
key.position.set(6, 5, 4);
scene.add(key);

const rim = new THREE.DirectionalLight(0x7fb2ff, 2.5);
rim.position.set(-6, 2, -6);
scene.add(rim);

// soft fill from below
const fill = new THREE.PointLight(0xffcba8, 1.2, 20);
fill.position.set(0, -3, 2);
scene.add(fill);

// =====================
// PARTICLES (RIVER VOLUME)
// =====================
const COUNT = 1800;

const geometry = new THREE.IcosahedronGeometry(0.1, 2);

const material = new THREE.MeshStandardMaterial({
  roughness: 0.55,
  metalness: 0.1,
  vertexColors: true
});

const mesh = new THREE.InstancedMesh(geometry, material, COUNT);
scene.add(mesh);

const temp = new THREE.Object3D();

// =====================
// COLORS (UE VARIATION)
// =====================
const colors = new Float32Array(COUNT * 3);

// =====================
// FLOW VOLUME (IMPORTANT)
// =====================
const boundsX = 7;
const boundsY = 3;
const boundsZ = 3;

const pos = [];
const vel = [];

for (let i = 0; i < COUNT; i++) {
  pos.push(new THREE.Vector3(
    THREE.MathUtils.lerp(-boundsX, boundsX, i / COUNT),
    (Math.random() - 0.5) * boundsY * 2,
    (Math.random() - 0.5) * boundsZ
  ));

  vel.push(new THREE.Vector3(
    0.012 + Math.random() * 0.006,
    0,
    0
  ));

  // UE coffee look (slight warm variation)
  const base = 0.25 + Math.random() * 0.35;

  colors[i * 3 + 0] = base + 0.15;
  colors[i * 3 + 1] = base * 0.6;
  colors[i * 3 + 2] = base * 0.35;
}

mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);

// =====================
// MOUSE FIELD (UE FORCE FIELD)
// =====================
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const mouseWorld = new THREE.Vector3();

const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const forceRadius = 4.5;

window.addEventListener('mousemove', (e) => {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(plane, mouseWorld);
});

// =====================
// BLOOM (UE SIGNATURE LOOK)
// =====================
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(width, height),
  1.35,  // strength
  0.5,   // radius
  0.85   // threshold
);

composer.addPass(bloom);

// =====================
// ANIMATION
// =====================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  // subtle camera drift (UE cinematic feel)
  camera.position.x = Math.sin(t * 0.1) * 0.4;
  camera.position.y = Math.cos(t * 0.07) * 0.25;
  camera.lookAt(0, 0, 0);

  for (let i = 0; i < COUNT; i++) {
    const p = pos[i];
    const v = vel[i];

    // fluid motion field
    v.x = 0.012 + Math.sin(t * 0.2 + i * 0.01) * 0.003;

    p.add(v);

    // volumetric drift
    p.y += Math.sin(t * 0.25 + i) * 0.0025;
    p.z += Math.cos(t * 0.22 + i) * 0.0025;

    // mouse force field (UE-style)
    const d = p.clone().sub(mouseWorld);
    const dist = d.length();

    if (dist < forceRadius) {
      const s = 1.0 - dist / forceRadius;

      d.normalize();

      const swirl = new THREE.Vector3(-d.y, d.x, d.z);

      p.add(d.multiplyScalar(s * 0.07));
      p.add(swirl.multiplyScalar(s * 0.04));
    }

    // wrap system (continuous river)
    if (p.x > boundsX) {
      p.x = -boundsX;
      p.y = (Math.random() - 0.5) * boundsY * 2;
      p.z = (Math.random() - 0.5) * boundsZ;
    }

    temp.position.copy(p);

    // subtle rotation for specular variation
    temp.rotation.y = t * 0.15;

    temp.updateMatrix();
    mesh.setMatrixAt(i, temp.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;

  // UE LOOK: postprocessing only
  composer.render();
}

animate();

// =====================
// RESIZE
// =====================
window.addEventListener('resize', () => {
  const { width, height } = getSize();

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  composer.setSize(width, height);
});