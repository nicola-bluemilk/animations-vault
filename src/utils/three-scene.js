import * as THREE from 'three';

export function requireContainer(id) {
  const container = document.getElementById(id);

  if (!container) {
    throw new Error(`Container #${id} non trovato`);
  }

  return container;
}

export function getViewportSize(container) {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight
  };
}

export function createRenderer(container, width, height, rendererOptions = {}) {
  const renderer = new THREE.WebGLRenderer(rendererOptions);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);
  return renderer;
}

export function bindResponsiveRenderer({ container, camera, renderer, onResize, updatePixelRatio = true }) {
  function resize() {
    const { width, height } = getViewportSize(container);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    if (updatePixelRatio) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    renderer.setSize(width, height);

    if (onResize) {
      onResize({ width, height });
    }
  }

  window.addEventListener('resize', resize);
  return resize;
}