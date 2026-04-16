class SiteHeader extends HTMLElement {
  connectedCallback() {
    const basePath = this.dataset.basePath || './';
    const current = this.dataset.current || 'home';
    const compact = this.dataset.compact === 'true';
    const headerClassName = compact ? 'site-header compact-header' : 'site-header';
    const isAnimationsSection = current === 'anim1' || current === 'anim2' || current === 'anim3' || current === 'anim4' || current === 'anim5' || current === 'anim6' || current === 'anim7' || current === 'anim8' || current === 'anim9' || current === 'anim10' || current === 'anim11' || current === 'anim12' || current === 'anim13' || current === 'anim14' || current === 'anim15' || current === 'anim16';

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
              <a href="${basePath}animazioni/anim7.html"${current === 'anim7' ? ' aria-current="page"' : ''}>Animazione 07</a>
              <a href="${basePath}animazioni/anim8.html"${current === 'anim8' ? ' aria-current="page"' : ''}>Animazione 08</a>
              <a href="${basePath}animazioni/anim9.html"${current === 'anim9' ? ' aria-current="page"' : ''}>Animazione 09</a>
              <a href="${basePath}animazioni/anim10.html"${current === 'anim10' ? ' aria-current="page"' : ''}>Animazione 10</a>
              <a href="${basePath}animazioni/anim11.html"${current === 'anim11' ? ' aria-current="page"' : ''}>Animazione 11</a>
              <a href="${basePath}animazioni/anim12.html"${current === 'anim12' ? ' aria-current="page"' : ''}>Animazione 12</a>
              <a href="${basePath}animazioni/anim13.html"${current === 'anim13' ? ' aria-current="page"' : ''}>Animazione 13</a>
              <a href="${basePath}animazioni/anim14.html"${current === 'anim14' ? ' aria-current="page"' : ''}>Animazione 14</a>
              <a href="${basePath}animazioni/anim15.html"${current === 'anim15' ? ' aria-current="page"' : ''}>Animazione 15</a>
              <a href="${basePath}animazioni/anim16.html"${current === 'anim16' ? ' aria-current="page"' : ''}>Animazione 16</a>
            </div>
          </details>
          <a href="${basePath}modelli.html"${current === 'models' ? ' aria-current="page"' : ''}>Modelli</a>
        </nav>
      </header>
    `;
  }
}

customElements.define('site-header', SiteHeader);