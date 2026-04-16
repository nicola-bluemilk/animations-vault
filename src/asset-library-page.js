import {
  getAssetArchiveHref,
  getAssetCategory,
  getAssetsByCategory,
  getAssetViewHref
} from './content/assets.js';

const library = document.querySelector('[data-asset-library]');

if (library) {
  const categoryId = library.dataset.assetType;
  const basePath = library.dataset.basePath || './';
  const category = getAssetCategory(categoryId);

  if (!category) {
    throw new Error(`Categoria asset non trovata: ${categoryId}`);
  }

  const title = document.querySelector('[data-asset-archive-title]');
  const description = document.querySelector('[data-asset-archive-description]');
  const eyebrow = document.querySelector('[data-asset-archive-eyebrow]');
  const grid = document.querySelector('[data-asset-grid]');

  if (!title || !description || !eyebrow || !grid) {
    throw new Error('Markup archivio asset incompleto');
  }

  document.title = `Animation Vault | ${category.label}`;
  eyebrow.textContent = 'Archivio asset';
  title.textContent = category.archiveTitle;
  description.textContent = category.archiveDescription;
  grid.setAttribute('aria-label', category.archiveLabel);

  grid.innerHTML = getAssetsByCategory(category.id)
    .map((asset) => renderAssetCard({ asset, category, basePath }))
    .join('');
}

function renderAssetCard({ asset, category, basePath }) {
  const viewHref = getAssetViewHref(basePath, category.id, asset.id);

  return `
    <article class="asset-card ${asset.accentClass}">
      <a class="asset-card-body" href="${viewHref}">
        ${renderAssetPreview(category.id, asset)}

        <div class="asset-card-header">
          <div>
            <p class="card-index">${category.singularLabel} ${asset.number}</p>
            <h2>${asset.title}</h2>
          </div>
          <p class="asset-card-copy">${asset.description}</p>
        </div>
      </a>

      <div class="tag-list">
        ${asset.tags.map((tag) => `<span class="tag-pill">${tag}</span>`).join('')}
      </div>

      <p class="file-pill">${asset.filePath}</p>

      <div class="panel-actions">
        <a class="card-link" href="${viewHref}">Apri viewer</a>
        <a class="card-link secondary-link" href="${asset.assetUrl}" target="_blank" rel="noreferrer">Apri file</a>
      </div>
    </article>
  `;
}

function renderAssetPreview(categoryId, asset) {
  if (categoryId === 'textures') {
    return `
      <div class="asset-preview">
        <img src="${asset.previewUrl}" alt="Preview texture ${asset.title}" loading="lazy" />
        <div class="asset-preview-overlay">${asset.number} · Texture</div>
      </div>
    `;
  }

  if (categoryId === 'hdrs') {
    return `
      <div class="asset-preview asset-preview-hdr">
        <span class="asset-preview-meta">Environment</span>
        <div class="asset-preview-orb" aria-hidden="true"></div>
        <div class="asset-preview-overlay">${asset.number} · HDR</div>
      </div>
    `;
  }

  return `
    <div class="asset-preview asset-preview-model">
      <span class="asset-preview-meta">GLB Asset</span>
      <div class="asset-preview-glyph" aria-hidden="true">GLB</div>
      <div class="asset-preview-overlay">${asset.number} · Modello</div>
    </div>
  `;
}