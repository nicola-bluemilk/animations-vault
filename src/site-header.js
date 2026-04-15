class SiteHeader extends HTMLElement {
  connectedCallback() {
    const basePath = this.dataset.basePath || './';
    const current = this.dataset.current || 'home';
    const compact = this.dataset.compact === 'true';
    const headerClassName = compact ? 'site-header compact-header' : 'site-header';
    const isAnimationsSection = current === 'anim1' || current === 'anim2' || current === 'anim3' || current === 'anim4' || current === 'anim5' || current === 'anim6';

    this.innerHTML = `
      <header class="${headerClassName}">
        <a class="brand" href="${basePath}index.html">Animation Vault</a>
        <nav class="site-nav" aria-label="Navigazione principale">
          <a href="${basePath}index.html"${current === 'home' ? ' aria-current="page"' : ''}>Home</a>
          <details class="nav-dropdown${isAnimationsSection ? ' nav-dropdown-current' : ''}">
            <summary>Animazioni</summary>
            <div class="nav-dropdown-menu">
              <a href="${basePath}animazioni/anim1.html"${current === 'anim1' ? ' aria-current="page"' : ''}>Animazione 01</a>
              <a href="${basePath}animazioni/anim2.html"${current === 'anim2' ? ' aria-current="page"' : ''}>Animazione 02</a>
              <a href="${basePath}animazioni/anim3.html"${current === 'anim3' ? ' aria-current="page"' : ''}>Animazione 03</a>
              <a href="${basePath}animazioni/anim4.html"${current === 'anim4' ? ' aria-current="page"' : ''}>Animazione 04</a>
              <a href="${basePath}animazioni/anim5.html"${current === 'anim5' ? ' aria-current="page"' : ''}>Animazione 05</a>
              <a href="${basePath}animazioni/anim6.html"${current === 'anim6' ? ' aria-current="page"' : ''}>Animazione 06</a>
            </div>
          </details>
          <a href="${basePath}modelli.html"${current === 'models' ? ' aria-current="page"' : ''}>Modelli</a>
        </nav>
      </header>
    `;
  }
}

customElements.define('site-header', SiteHeader);