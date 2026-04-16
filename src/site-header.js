import { animations, getAnimationHref } from './content/animations.js';
import {
  assetCategories,
  getAssetsByCategory,
  getAssetArchiveHref,
  getAssetCurrentToken,
  getAssetViewHref
} from './content/assets.js';

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
    const isAssetsSection = assetCategories.some(
      (category) => current === category.id || current.startsWith(`${category.id}:`)
    );
    const animationLinks = animations
      .map(
        (animation) =>
          `<a href="${getAnimationHref(basePath, animation.id)}"${current === animation.id ? ' aria-current="page"' : ''}>Animazione ${animation.number}</a>`
      )
      .join('');
    const assetLinks = assetCategories
      .map((category) => {
        const archiveLink = `<a class="nav-dropdown-archive-link" href="${getAssetArchiveHref(basePath, category.id)}"${current === category.id ? ' aria-current="page"' : ''}>Apri archivio ${category.label}</a>`;
        const itemLinks = getAssetsByCategory(category.id)
          .map((asset) => {
            const assetToken = getAssetCurrentToken(category.id, asset.id);

            return `<a href="${getAssetViewHref(basePath, category.id, asset.id)}"${current === assetToken ? ' aria-current="page"' : ''}>${asset.title}</a>`;
          })
          .join('');

        return `
          <div class="nav-dropdown-group">
            <p class="nav-dropdown-group-title">${category.label}</p>
            ${archiveLink}
            ${itemLinks}
          </div>
        `;
      })
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
          <details class="nav-dropdown${isAssetsSection ? ' nav-dropdown-current' : ''}">
            <summary>Assets</summary>
            <div class="nav-dropdown-menu nav-dropdown-menu-sectioned">${assetLinks}</div>
          </details>
        </nav>
      </header>
    `;
  }
}

customElements.define('site-header', SiteHeader);