import { discoveredModelAssets } from 'virtual:model-assets';

const modelAccentClasses = ['accent-sky', 'accent-coral', 'accent-amber', 'accent-mint', 'accent-gold', 'accent-forest'];

const modelAssetOverrides = {
  rolex: {
    id: 'rolex',
    title: 'Rolex',
    description: 'Modello principale usato nel viewer 3D della seconda animazione.',
    accentClass: 'accent-sky',
    tags: ['GLB', 'Product', 'Viewer']
  },
  coffeeMug: {
    id: 'coffeeMug',
    title: 'Coffee Mug',
    description: 'Asset GLB pronto per futuri test di materiali, luci o scene prodotto.',
    accentClass: 'accent-coral',
    tags: ['GLB', 'Props', 'Tabletop']
  },
  coffeemat: {
    id: 'coffeemat',
    title: 'Coffee Mat',
    description: 'Accessorio GLB utile per comporre una scena tabletop insieme alla tazza.',
    accentClass: 'accent-amber',
    tags: ['GLB', 'Props', 'Surface']
  }
};

export const modelAssets = discoveredModelAssets.map((asset, index) => {
  const override = modelAssetOverrides[asset.id] ?? {};

  return {
    ...asset,
    description: 'Modello GLB disponibile in public/models, pronto per test di viewer, materiali o scene dedicate.',
    accentClass: modelAccentClasses[index % modelAccentClasses.length],
    tags: ['GLB', '3D Asset', 'Auto-detected'],
    ...override
  };
});

export const textureAssets = [
  {
    id: 'hardwood',
    number: '01',
    title: 'Hardwood',
    description: 'Texture fotografica di tavolato in legno, utile come base diffuse o fondale per scene prodotto.',
    filePath: 'public/textures/hardwood.jpg',
    assetUrl: '/textures/hardwood.jpg',
    previewUrl: '/textures/hardwood.jpg',
    accentClass: 'accent-amber',
    tags: ['JPG', 'Diffuse', 'Surface']
  },
  {
    id: 'water',
    number: '02',
    title: 'Water',
    description: 'Pattern acqua adatto a shader liquidi, sfondi dinamici o piani riflettenti stilizzati.',
    filePath: 'public/textures/water.jpg',
    assetUrl: '/textures/water.jpg',
    previewUrl: '/textures/water.jpg',
    accentClass: 'accent-sky',
    tags: ['JPG', 'Surface', 'Fluid']
  },
  {
    id: 'water-normals',
    number: '03',
    title: 'Water Normals',
    description: 'Normal map pronta per aggiungere micro-increspature e riflessi piu credibili a superfici d\'acqua.',
    filePath: 'public/textures/waterNormals.jpg',
    assetUrl: '/textures/waterNormals.jpg',
    previewUrl: '/textures/waterNormals.jpg',
    accentClass: 'accent-mint',
    tags: ['JPG', 'Normal Map', 'Shading']
  },
  {
    id: 'water-caustic',
    number: '04',
    title: 'Water Caustic Vector',
    description: 'Grafica vettoriale/flat per pattern caustic, overlay luminosi o compositing grafico.',
    filePath: 'public/textures/water-caustic-vector.png',
    assetUrl: '/textures/water-caustic-vector.png',
    previewUrl: '/textures/water-caustic-vector.png',
    accentClass: 'accent-coral',
    tags: ['PNG', 'Caustic', 'Overlay']
  }
];

export const hdrAssets = [
  {
    id: 'sky',
    number: '01',
    title: 'Sky Dome',
    description: 'HDR equirettangolare per illuminazione ambientale morbida, riflessioni globali e scene outdoor pulite.',
    filePath: 'public/hdr/sky.hdr',
    assetUrl: '/hdr/sky.hdr',
    accentClass: 'accent-gold',
    tags: ['HDR', 'Environment', 'Lighting'],
    detailSectionTitle: 'Uso consigliato',
    detailCards: [
      {
        eyebrow: 'Lighting',
        title: 'Environment globale',
        body: 'Ideale come sorgente di luce ambientale per riflessi morbidi e scene prodotto pulite.'
      },
      {
        eyebrow: 'Reflections',
        title: 'Materiali metallici',
        body: 'Utile per testare subito superfici chrome, vetro o clear coat senza costruire una scena complessa.'
      },
      {
        eyebrow: 'Workflow',
        title: 'Drop-in semplice',
        body: 'Il file vive in public/hdr e puo essere caricato direttamente nei viewer usando RGBELoader.'
      }
    ]
  }
];

export const assetCategories = [
  {
    id: 'models',
    label: 'Modelli',
    singularLabel: 'Modello',
    archivePath: 'modelli.html',
    archiveTitle: 'Solo i modelli presenti in public/models.',
    archiveDescription:
      'Questa pagina raccoglie esclusivamente i file GLB del progetto, con accesso diretto agli asset disponibili per viewer, test o nuove animazioni.',
    archiveLabel: 'Modelli disponibili',
    viewerNote:
      'Viewer orbitale con illuminazione morbida, utile per controllare proporzioni, materiali e presenza del file GLB prima di usarlo in una scena.',
    stageClass: 'animation-stage light-stage'
  },
  {
    id: 'textures',
    label: 'Textures',
    singularLabel: 'Texture',
    archivePath: 'textures.html',
    archiveTitle: 'Textures disponibili in public/textures.',
    archiveDescription:
      'Anteprima diretta dei raster gia presenti nel progetto, con tag rapidi per capire a colpo d\'occhio il tipo di mappa e accesso immediato al file sorgente.',
    archiveLabel: 'Textures disponibili',
    viewerNote:
      'La view dettaglio mostra il raster a piena scala dentro uno stage dedicato, cosi puoi controllare pattern, contrasto e leggibilita prima di applicarlo come mappa.',
    stageClass: 'animation-stage texture-stage'
  },
  {
    id: 'hdrs',
    label: 'HDRs',
    singularLabel: 'HDR',
    archivePath: 'hdr.html',
    archiveTitle: 'HDR environments presenti in public/hdr.',
    archiveDescription:
      'Archivio degli environment HDR con accesso a una preview interattiva reale della luce e delle riflessioni generate dal file selezionato.',
    archiveLabel: 'HDR disponibili',
    viewerNote:
      'Muovi la camera per vedere come l\'environment reagisce sui materiali lucidi e ruvidi. Questa view carica davvero il file HDR come environment map.',
    stageClass: 'animation-stage hdr-stage'
  }
];

export const assetCollections = {
  models: modelAssets,
  textures: textureAssets,
  hdrs: hdrAssets
};

export const assetCategoryMap = new Map(assetCategories.map((category) => [category.id, category]));

export function getAssetCategory(id) {
  return assetCategoryMap.get(id) ?? null;
}

export function getAssetsByCategory(id) {
  return assetCollections[id] ?? [];
}

export function getAssetByCategoryAndId(categoryId, assetId) {
  return getAssetsByCategory(categoryId).find((asset) => asset.id === assetId) ?? null;
}

export function getAssetArchiveHref(basePath, categoryId) {
  const category = getAssetCategory(categoryId);

  if (!category) {
    throw new Error(`Categoria asset non trovata: ${categoryId}`);
  }

  return `${basePath}${category.archivePath}`;
}

export function getAssetViewHref(basePath, categoryId, assetId) {
  return `${basePath}asset/view.html?type=${categoryId}&asset=${assetId}`;
}

export function getAssetCurrentToken(categoryId, assetId) {
  return `${categoryId}:${assetId}`;
}