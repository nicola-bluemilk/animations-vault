import {
  assetCategories,
  getAssetArchiveHref,
  getAssetByCategoryAndId,
  getAssetCategory,
  getAssetCurrentToken,
  getAssetsByCategory
} from './content/assets.js';

const rendererLoaders = {
  models: () => import('./asset-renderers/model-stage.js'),
  textures: () => import('./asset-renderers/texture-stage.js'),
  hdrs: () => import('./asset-renderers/hdr-stage.js')
};

const params = new URLSearchParams(window.location.search);
let requestedType = params.get('type');

if (!getAssetCategory(requestedType)) {
  requestedType = assetCategories[0]?.id ?? null;
}

if (!requestedType) {
  throw new Error('Nessuna categoria asset disponibile nel catalogo');
}

const category = getAssetCategory(requestedType);
const categoryAssets = getAssetsByCategory(category.id);
const requestedAssetId = params.get('asset');
const asset = getAssetByCategoryAndId(category.id, requestedAssetId) ?? categoryAssets[0];

if (!asset) {
  throw new Error(`Nessun asset disponibile per la categoria ${category.id}`);
}

if (params.get('type') !== category.id || params.get('asset') !== asset.id) {
  params.set('type', category.id);
  params.set('asset', asset.id);
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
}

const header = document.querySelector('site-header');
const eyebrow = document.querySelector('[data-asset-number]');
const title = document.querySelector('[data-asset-title]');
const description = document.querySelector('[data-asset-description]');
const tags = document.querySelector('[data-asset-tags]');
const path = document.querySelector('[data-asset-path]');
const note = document.querySelector('[data-asset-note]');
const download = document.querySelector('[data-asset-download]');
const back = document.querySelector('[data-asset-back]');
const stage = document.querySelector('[data-asset-stage]');
const status = document.querySelector('[data-asset-status]');
const detailsSection = document.querySelector('[data-asset-details]');
const detailsTitle = document.querySelector('[data-asset-details-title]');
const detailGrid = document.querySelector('[data-asset-detail-grid]');

if (
  !header ||
  !eyebrow ||
  !title ||
  !description ||
  !tags ||
  !path ||
  !note ||
  !download ||
  !back ||
  !stage ||
  !status ||
  !detailsSection ||
  !detailsTitle ||
  !detailGrid
) {
  throw new Error('Markup della pagina asset incompleto');
}

document.title = `Animation Vault | ${asset.title}`;
header.dataset.current = getAssetCurrentToken(category.id, asset.id);
eyebrow.textContent = `${category.singularLabel} ${asset.number}`;
title.textContent = asset.title;
description.textContent = asset.description;
tags.innerHTML = asset.tags.map((tag) => `<span class="tag-pill">${tag}</span>`).join('');
path.textContent = asset.filePath;
note.textContent = category.viewerNote;
download.href = asset.assetUrl;
back.href = getAssetArchiveHref('../', category.id);
stage.className = category.stageClass;
stage.setAttribute('aria-label', `Viewer ${asset.title}`);

const detailCards = asset.detailCards ?? category.detailCards ?? [];
const detailSectionTitle = asset.detailSectionTitle ?? category.detailSectionTitle ?? 'Dettagli';

if (detailCards.length) {
  detailsSection.hidden = false;
  detailsTitle.textContent = detailSectionTitle;
  detailGrid.innerHTML = detailCards
    .map(
      (card) => `
        <article class="asset-detail-card">
          <p class="card-index">${card.eyebrow}</p>
          <h3>${card.title}</h3>
          <p>${card.body}</p>
        </article>
      `
    )
    .join('');
} else {
  detailsSection.hidden = true;
  detailGrid.innerHTML = '';
}

const loadRenderer = rendererLoaders[category.id];

if (!loadRenderer) {
  throw new Error(`Renderer asset non trovato per ${category.id}`);
}

const { renderAssetStage } = await loadRenderer();

await renderAssetStage({ asset, stage, status });