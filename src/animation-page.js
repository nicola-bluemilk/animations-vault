import { animations, getAnimationById } from './content/animations.js';

const sceneModules = import.meta.glob('./scenes/anim*.js');
const params = new URLSearchParams(window.location.search);
const requestedId = params.get('scene');
const animation = getAnimationById(requestedId) ?? animations[0];

if (!animation) {
  throw new Error('Nessuna animazione disponibile nel catalogo');
}

if (requestedId !== animation.id) {
  params.set('scene', animation.id);
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
}

const header = document.querySelector('site-header');
const eyebrow = document.querySelector('[data-animation-number]');
const title = document.querySelector('[data-animation-title]');
const description = document.querySelector('[data-animation-description]');
const stage = document.querySelector('[data-animation-stage]');

if (!header || !eyebrow || !title || !description || !stage) {
  throw new Error('Markup della pagina animazione incompleto');
}

document.title = `Animation Vault | ${animation.title}`;
header.dataset.current = animation.id;
eyebrow.textContent = `Animazione ${animation.number}`;
title.textContent = animation.title;
description.textContent = animation.description;
stage.id = animation.id;
stage.className = animation.stageClass;
stage.setAttribute('aria-label', `Canvas ${animation.title}`);

const sceneModulePath = `./scenes/${animation.id}.js`;
const loadScene = sceneModules[sceneModulePath];

if (!loadScene) {
  throw new Error(`Modulo scena non trovato per ${animation.id}`);
}

await loadScene();