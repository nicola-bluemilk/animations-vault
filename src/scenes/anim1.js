import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('anim1');

if (!container) {
  throw new Error('Container #anim1 non trovato');
}

function getContainerSize() {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight
  };
}

// MARK: scena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// MARK: camera
const { width, height } = getContainerSize();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 5;

// MARK: renderer
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
renderer.domElement.style.display = 'block';
container.appendChild(renderer.domElement);

// MARK: luce
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

// MARK VFX
scene.fog = new THREE.FogExp2(0x000000, 0.15);

// MARK: oggetto // Geometry + Material = Mesh

/*
  MeshBasicMaterial → no luci
  MeshStandardMaterial → realistico
*/

const geometry = new THREE.BoxGeometry();
// const geometry = new THREE.SphereGeometry();
// const geometry = new THREE.PlaneGeometry();
// const geometry = new THREE.TorusGeometry();

// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
// const material = new THREE.MeshStandardMaterial({
//   color: 0x999150,
//   roughness: 0.4,
//   metalness: 0.9
// });

const texture = new THREE.TextureLoader().load('/textures/hardwood.jpg');
// const material = new THREE.MeshStandardMaterial({
//   map: texture
// });

const material = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 }
  },

  vertexShader: `
    varying vec2 vUv;
    uniform float time;

    void main() {
      vUv = uv;

      vec3 pos = position;

      // effetto onda
      pos.z += sin(pos.x * 5.0 + time) * 0.3;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,

  fragmentShader: `
    varying vec2 vUv;
    uniform float time;

    void main() {
      float r = 0.5 + 0.5 * sin(time + vUv.x * 5.0);
      float g = 0.5 + 0.5 * sin(time + vUv.y * 5.0);
      float b = 0.5 + 0.5 * sin(time);

      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `
});

const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

// MARK: controlli
const controls = new OrbitControls(camera, renderer.domElement);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(cube);

  if (intersects.length > 0) {
    console.log('cliccato oggetto!');

    if (intersects[0].object.material.color) {
      intersects[0].object.material.color.set('red');
    }
  }
});

// MARK: loop animazione
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  cube.rotation.x += 0.005;
  cube.rotation.y += 0.005;
  material.uniforms.time.value += 0.05;

  renderer.render(scene, camera);
}

animate();

// MARK: resize responsivo
window.addEventListener('resize', () => {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
});