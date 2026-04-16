import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { bindResponsiveRenderer, createRenderer, getViewportSize, requireContainer } from '../utils/three-scene.js';

const container = requireContainer('anim14');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x06040b);
scene.fog = new THREE.FogExp2(0x11091a, 0.06);

const { width, height } = getViewportSize(container);
const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
camera.position.set(0, 0.4, 7.5);

const renderer = createRenderer(container, width, height, { antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4.2;
controls.maxDistance = 11;

scene.add(new THREE.AmbientLight(0xffd9fa, 0.55));

const keyLight = new THREE.PointLight(0xff8dd0, 18, 20, 2);
keyLight.position.set(4.2, 2.6, 4.5);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x84d6ff, 14, 18, 2);
fillLight.position.set(-4, -1.4, 3);
scene.add(fillLight);

const backLight = new THREE.PointLight(0x8f63ff, 10, 24, 2);
backLight.position.set(0, 0, -6);
scene.add(backLight);

const backdrop = new THREE.Mesh(
  new THREE.SphereGeometry(18, 32, 32),
  new THREE.MeshBasicMaterial({
    color: 0x130a1e,
    side: THREE.BackSide
  })
);
scene.add(backdrop);

const haze = new THREE.Mesh(
  new THREE.SphereGeometry(10, 24, 24),
  new THREE.MeshBasicMaterial({
    color: 0x2f1446,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
scene.add(haze);

const starCount = 260;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);

for (let index = 0; index < starCount; index++) {
  const stride = index * 3;
  starPositions[stride] = (Math.random() - 0.5) * 18;
  starPositions[stride + 1] = (Math.random() - 0.5) * 10;
  starPositions[stride + 2] = -2 - Math.random() * 12;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

const stars = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({
    color: 0xffd8fb,
    size: 0.045,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
scene.add(stars);

const shardCount = 40;
const shards = [];
const ringGroup = new THREE.Group();
scene.add(ringGroup);

const shardGeometry = new THREE.BoxGeometry(0.3, 0.12, 0.7);
const shardOutlineGeometry = new THREE.BoxGeometry(0.34, 0.035, 0.78);

for (let index = 0; index < shardCount; index++) {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.84 + (index / shardCount) * 0.22, 0.58, 0.62),
    emissive: new THREE.Color().setHSL(0.88 + (index / shardCount) * 0.18, 0.88, 0.42),
    emissiveIntensity: 0.36,
    roughness: 0.18,
    metalness: 0.82
  });

  const shard = new THREE.Mesh(shardGeometry, material);
  const outline = new THREE.Mesh(
    shardOutlineGeometry,
    new THREE.MeshBasicMaterial({
      color: 0xff9be7,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  shard.add(outline);
  ringGroup.add(shard);
  shards.push({
    mesh: shard,
    angle: (index / shardCount) * Math.PI * 2,
    offset: Math.random() * Math.PI * 2,
    radius: 2.0 + Math.random() * 0.35,
    lift: (Math.random() - 0.5) * 0.5,
    spin: 0.6 + Math.random() * 0.9,
    wobble: 0.18 + Math.random() * 0.22,
    drift: (Math.random() - 0.5) * 0.35,
    scale: 0.85 + Math.random() * 0.55
  });
}

const coreShell = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.72, 8),
  new THREE.MeshPhysicalMaterial({
    color: 0xffc4f5,
    emissive: 0xff8fdd,
    emissiveIntensity: 0.45,
    roughness: 0.18,
    metalness: 0.15,
    transmission: 0.18,
    transparent: true,
    opacity: 0.92,
    clearcoat: 1,
    clearcoatRoughness: 0.08
  })
);
scene.add(coreShell);

const pulseCore = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.28, 4),
  new THREE.MeshBasicMaterial({
    color: 0x96d9ff,
    transparent: true,
    opacity: 0.82,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
scene.add(pulseCore);

const coreGlow = new THREE.Mesh(
  new THREE.SphereGeometry(0.86, 28, 28),
  new THREE.MeshBasicMaterial({
    color: 0xff83d8,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
scene.add(coreGlow);

const shockwave = new THREE.Mesh(
  new THREE.RingGeometry(0.95, 1.18, 64),
  new THREE.MeshBasicMaterial({
    color: 0x9fd6ff,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  })
);
shockwave.rotation.x = Math.PI / 2;
scene.add(shockwave);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();
  const pulse = 1 + Math.sin(time * 1.8) * 0.08;
  const burst = (Math.sin(time * 0.9) + 1) * 0.5;

  for (const shard of shards) {
    const radius = shard.radius + Math.sin(time * 1.4 + shard.offset) * 0.24 + burst * shard.wobble;
    const spread = Math.sin(time * 1.15 + shard.offset) * 0.32;
    shard.mesh.position.set(
      Math.cos(shard.angle + time * 0.18) * (radius + spread),
      shard.lift + Math.sin(time * 1.6 + shard.offset) * 0.22 + Math.cos(time * 0.9 + shard.offset) * shard.drift,
      Math.sin(shard.angle + time * 0.18) * (radius - spread)
    );
    shard.mesh.rotation.set(
      time * shard.spin,
      shard.angle + time * 0.45 + burst * 0.25,
      Math.sin(time * 1.4 + shard.offset) * 0.7
    );
    shard.mesh.scale.setScalar(shard.scale * (0.94 + burst * 0.12));
  }

  coreShell.scale.setScalar(pulse);
  coreShell.rotation.x += 0.004;
  coreShell.rotation.y += 0.006;
  pulseCore.scale.setScalar(0.86 + Math.sin(time * 1.8) * 0.14);
  coreGlow.scale.setScalar(0.9 + burst * 0.28);
  coreGlow.material.opacity = 0.1 + burst * 0.08;
  shockwave.scale.setScalar(0.92 + burst * 0.22);
  shockwave.material.opacity = 0.08 + burst * 0.12;
  ringGroup.rotation.y += 0.0025;
  ringGroup.rotation.x = Math.sin(time * 0.35) * 0.08;
  stars.rotation.y += 0.0006;
  haze.rotation.y -= 0.0008;

  controls.update();
  renderer.render(scene, camera);
}

animate();

bindResponsiveRenderer({ container, camera, renderer });