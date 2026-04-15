class SiteHeader extends HTMLElement {
  connectedCallback() {
    const basePath = this.dataset.basePath || './';
    const current = this.dataset.current || 'home';
    const compact = this.dataset.compact === 'true';
    const headerClassName = compact ? 'site-header compact-header' : 'site-header';
    const isAnimationsSection = current === 'anim1' || current === 'anim2';

    this.innerHTML = `
      <header class="${headerClassName}">
        <a class="brand" href="${basePath}index.html">Animation Vault</a>
        <nav class="site-nav" aria-label="Navigazione principale">
          <a href="${basePath}index.html"${current === 'home' ? ' aria-current="page"' : ''}>Home</a>
          <details class="nav-dropdown${isAnimationsSection ? ' nav-dropdown-current' : ''}"${isAnimationsSection ? ' open' : ''}>
            <summary>Animazioni</summary>
            <div class="nav-dropdown-menu">
              <a href="${basePath}animazioni/anim1.html"${current === 'anim1' ? ' aria-current="page"' : ''}>Animazione 01</a>
              <a href="${basePath}animazioni/anim2.html"${current === 'anim2' ? ' aria-current="page"' : ''}>Animazione 02</a>
            </div>
          </details>
          <a href="${basePath}modelli.html"${current === 'models' ? ' aria-current="page"' : ''}>Modelli</a>
        </nav>
      </header>
    `;
  }
}

customElements.define('site-header', SiteHeader);