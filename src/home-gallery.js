import { animations, getAnimationHref } from './content/animations.js';

const gallery = document.querySelector('[data-scene-gallery]');

if (gallery) {
  const basePath = gallery.dataset.basePath || './';

  gallery.innerHTML = animations
    .map(
      (animation) => `
        <article class="gallery-card ${animation.accentClass}">
          <p class="card-index">${animation.number}</p>
          <h2>${animation.title}</h2>
          <p>${animation.description}</p>
          <a class="card-link" href="${getAnimationHref(basePath, animation.id)}">Apri pagina</a>
        </article>
      `
    )
    .join('');
}