import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import {
  bindResponsiveRenderer,
  createRenderer,
  getViewportSize
} from '../utils/three-scene.js';

export async function renderAssetStage({ asset, stage, status }) {
  status.hidden = false;
  status.textContent = 'Caricamento environment HDR...';

  const scene = new THREE.Scene();
  const { width, height } = getViewportSize(stage);
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
  camera.position.set(0, 1.3, 5.2);

  const renderer = createRenderer(stage, width, height, { antialias: true });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 2.5;
  controls.maxDistance = 10;
  controls.target.set(0, 0.9, 0);

  const hemisphere = new THREE.HemisphereLight(0xffffff, 0x1a1f29, 0.35);
  scene.add(hemisphere);

  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(2.8, 3.4, 0.22, 64),
    new THREE.MeshStandardMaterial({
      color: 0xd7d1c5,
      roughness: 0.92,
      metalness: 0.04
    })
  );
  floor.position.y = -0.12;
  scene.add(floor);

  const chromeSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 64, 64),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.03,
      metalness: 1,
      clearcoat: 1,
      clearcoatRoughness: 0
    })
  );
  chromeSphere.position.set(-1.2, 0.95, 0);
  scene.add(chromeSphere);

  const matteSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.82, 64, 64),
    new THREE.MeshStandardMaterial({
      color: 0xc97c54,
      roughness: 0.68,
      metalness: 0.08
    })
  );
  matteSphere.position.set(1.15, 0.88, 0.1);
  scene.add(matteSphere);

  const ring = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.42, 0.13, 180, 24),
    new THREE.MeshPhysicalMaterial({
      color: 0xf6e5c5,
      roughness: 0.18,
      metalness: 0.72,
      clearcoat: 0.75
    })
  );
  ring.position.set(0, 1.15, -1.1);
  ring.rotation.x = 0.35;
  scene.add(ring);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const loader = new RGBELoader();

  loader.load(
    asset.assetUrl,
    (texture) => {
      const environmentMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = environmentMap;
      scene.background = environmentMap;
      texture.dispose();
      pmremGenerator.dispose();
      status.hidden = true;
    },
    undefined,
    (error) => {
      console.error('Errore nel caricamento del file HDR:', error);
      status.hidden = false;
      status.textContent = 'Impossibile caricare il file HDR. Controlla il file o il percorso configurato.';
    }
  );

  function animate() {
    requestAnimationFrame(animate);
    chromeSphere.rotation.y += 0.004;
    matteSphere.rotation.y -= 0.003;
    ring.rotation.y += 0.008;
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  bindResponsiveRenderer({ container: stage, camera, renderer });
}