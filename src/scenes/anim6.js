import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const container = document.getElementById('anim6');

function getSize() {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight
  };
}

// UI
const select = document.createElement('select');
select.style.position = 'absolute';
select.style.top = '20px';
select.style.left = '40px';
select.style.zIndex = '10';
select.innerHTML = `
  <option value="stylized">Stylized</option>
  <option value="realistic">Realistic</option>
  <option value="ultra">Ultra Realistic</option>
`;
container.appendChild(select);

// SCENA
const scene = new THREE.Scene();

// CAMERA
const { width, height } = getSize();
const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
camera.position.set(0, 3, 5);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.6;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = false;
container.appendChild(renderer.domElement);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);

// 🌍 HDRI ENV MAP
new RGBELoader().load(
  'https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.hdr',
  (hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdr;
    scene.background = hdr;
  }
);

// 🌊 NORMAL MAP
const normalMap = new THREE.TextureLoader().load(
  'https://threejs.org/examples/textures/waternormals.jpg'
);
normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;

// 🌈 CAUSTICS TEXTURE
const caustics = new THREE.TextureLoader().load(
  'https://threejs.org/examples/textures/caustics.png'
);
caustics.wrapS = caustics.wrapT = THREE.RepeatWrapping;

// GEOMETRIA
const geometry = new THREE.PlaneGeometry(10, 10, 200, 200);

// SHADER
const material = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  uniforms: {
    time: { value: 0 },
    mode: { value: 0 },
    cameraPos: { value: camera.position },
    normalMap: { value: normalMap },
    causticsMap: { value: caustics }
  },

  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    uniform float time;

    // Simple pseudo-noise (leggero)
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(a, b, u.x) +
             (c - a) * u.y * (1.0 - u.x) +
             (d - b) * u.x * u.y;
    }

    void main() {
      vUv = uv;

      vec3 pos = position;

      // noise base (movimento lento e naturale)
      float n = noise(pos.xz * 0.4 + time * 0.1);
  
      // onde principali (struttura)
      float wave1 = sin(pos.x * 2.0 + time) * 0.15;
      float wave2 = sin(pos.y * 1.5 + time * 1.2) * 0.1;
  
      // combinazione
      pos.z += wave1 + wave2 + n * 0.25;

      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPos.xyz;

      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,

  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    uniform float time;
    uniform float mode;
    uniform vec3 cameraPos;
    uniform sampler2D normalMap;
    uniform sampler2D causticsMap;

    void main() {

      vec2 uv = vUv;

      // 🌊 NORMAL MAP ANIMATA
      vec2 uv1 = uv + vec2(time * 0.02, time * 0.01);
      vec2 uv2 = uv - vec2(time * 0.01, time * 0.02);

      vec3 n1 = texture2D(normalMap, uv1).rgb * 2.0 - 1.0;
      vec3 n2 = texture2D(normalMap, uv2).rgb * 2.0 - 1.0;
  
      // limita distorsione (CRUCIALE)
      vec2 nXY = (n1.xy + n2.xy) * 0.5;
  
      // forza Z stabile (evita glitch angolari)
      float z = sqrt(clamp(1.0 - dot(nXY, nXY), 0.0, 1.0));
  
      vec3 normal = normalize(vec3(nXY, z));

      // 🌍 VIEW DIR
      vec3 viewDir = normalize(cameraPos - vWorldPosition);
      normal = normalize(normal);

      float ndv = max(dot(viewDir, normal), 0.0);
      float fresnelSoft = pow(1.0 - ndv, 3.0);
      fresnelSoft = smoothstep(0.1, 0.8, fresnelSoft) * 0.4;

      vec3 color;

      if (mode < 0.5) {
        // STYLIZED
        float stripes = sin(vUv.x * 30.0 + time * 3.0) * 0.1;

        vec3 base = vec3(0.0, 0.6, 1.0);

        // toon shading
        float light = dot(normalize(vec3(0.3, 1.0, 0.5)), normal);

        float toon = step(0.5, light);

        color = base * (0.5 + toon * 0.5);

        // glow animato
        color += stripes;
        
        // bordo brillante (fresnel stylized)
        color += fresnelSoft * 0.3;
        color = max(color, vec3(0.02)); // evita black crush
      } else if (mode < 1.5) {
       // REALISTIC
        vec3 base = vec3(0.0, 0.25, 0.45);

        // shading fake (tipo luce)
        vec3 lightDir = normalize(vec3(0.3, 1.0, 0.5));
        float light = max(dot(lightDir, normal), 0.0);

        // ammorbidisce le ombre dure
        light = smoothstep(0.0, 1.0, light);

        color = base * (0.5 + light * 0.8);

        // profondità
        color *= 0.7 + 0.3 * (1.0 - vUv.y);

        // riflesso leggero
        color += fresnelSoft * 0.1;
      } else {
        // ULTRA REALISTIC
        vec3 deep = vec3(0.0, 0.03, 0.08);
        vec3 shallow = vec3(0.0, 0.45, 0.7);
      
        color = mix(shallow, deep, uv.y);
      
        vec3 sky = vec3(0.6, 0.8, 1.0);
      
        // 🔥 più contrasto fresnel
        float ultraFresnel = pow(fresnelSoft, 1.5);
      
        color = mix(color, sky, ultraFresnel * 0.7);
      
        // 🔥 restituisce “gloss”
        color += ultraFresnel * 0.6;
      }

      // 🌈 CAUSTICS
      vec2 causticUV = uv * 5.0 + time * 0.1;
      float caustic = texture2D(causticsMap, causticUV).r;

      color += caustic * 0.08;
      color = pow(color, vec3(0.85));
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
});

const water = new THREE.Mesh(geometry, material);
water.rotation.x = -Math.PI / 2;
scene.add(water);

// 💡 LUCE
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5,5,5);
scene.add(light);

// ✨ POST PROCESSING (BLOOM)
const composer = new EffectComposer(renderer);

composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(width, height),
  1.2,
  0.4,
  0.85
);

composer.addPass(bloom);

// UI MODE SWITCH
function syncModeWithSelect() {
  if (select.value === 'stylized') material.uniforms.mode.value = 0;
  else if (select.value === 'realistic') material.uniforms.mode.value = 1;
  else material.uniforms.mode.value = 2;
}

select.addEventListener('change', syncModeWithSelect);
syncModeWithSelect();

// LOOP
function animate() {
  requestAnimationFrame(animate);

  controls.update();

  material.uniforms.time.value += 0.02;
  material.uniforms.cameraPos.value.copy(camera.position);

  composer.render();
}

animate();

// RESIZE
window.addEventListener('resize', () => {
  const { width, height } = getSize();

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);
});