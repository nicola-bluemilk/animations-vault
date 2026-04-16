import { animations, getAnimationHref } from './content/animations.js';

class SiteHeader extends HTMLElement {
  static get observedAttributes() {
    return ['data-base-path', 'data-current', 'data-compact'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {
    const basePath = this.dataset.basePath || './';
    const current = this.dataset.current || 'home';
    const compact = this.dataset.compact === 'true';
    const headerClassName = compact ? 'site-header compact-header' : 'site-header';
    const isAnimationsSection = animations.some((animation) => animation.id === current);
    const animationLinks = animations
      .map(
        (animation) =>
          `<a href="${getAnimationHref(basePath, animation.id)}"${current === animation.id ? ' aria-current="page"' : ''}>Animazione ${animation.number}</a>`
      )
      .join('');

    this.innerHTML = `
      <header class="${headerClassName}">
        <a class="brand" href="${basePath}index.html">Animation Vault</a>
        <nav class="site-nav" aria-label="Navigazione principale">
          <a href="${basePath}index.html"${current === 'home' ? ' aria-current="page"' : ''}>Home</a>
          <details class="nav-dropdown${isAnimationsSection ? ' nav-dropdown-current' : ''}">
            <summary>Animazioni</summary>
            <div class="nav-dropdown-menu">${animationLinks}</div>
          </details>
          <a href="${basePath}modelli.html"${current === 'models' ? ' aria-current="page"' : ''}>Modelli</a>
        </nav>
      </header>
    `;
  }
}

customElements.define('site-header', SiteHeader);