import { basename, extname, resolve } from 'node:path';
import { readdirSync } from 'node:fs';
import { defineConfig } from 'vite';

const modelAssetsVirtualModuleId = 'virtual:model-assets';
const resolvedModelAssetsVirtualModuleId = `\0${modelAssetsVirtualModuleId}`;

function formatTitleFromFileName(fileName) {
  const stem = basename(fileName, extname(fileName));

  return stem
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function createModelAssetsModule() {
  const modelDirectory = resolve(__dirname, 'public/models');
  const modelFiles = readdirSync(modelDirectory)
    .filter((fileName) => fileName.toLowerCase().endsWith('.glb'))
    .sort((left, right) => left.localeCompare(right, 'it', { numeric: true, sensitivity: 'base' }));

  const modelAssets = modelFiles.map((fileName, index) => {
    const stem = basename(fileName, extname(fileName));

    return {
      id: stem,
      number: String(index + 1).padStart(2, '0'),
      title: formatTitleFromFileName(fileName),
      filePath: `public/models/${fileName}`,
      assetUrl: `/models/${fileName}`
    };
  });

  return `export const discoveredModelAssets = ${JSON.stringify(modelAssets, null, 2)};`;
}

export default defineConfig({
  plugins: [
    {
      name: 'animation-vault-model-assets',
      resolveId(source) {
        if (source === modelAssetsVirtualModuleId) {
          return resolvedModelAssetsVirtualModuleId;
        }

        return null;
      },
      load(id) {
        if (id === resolvedModelAssetsVirtualModuleId) {
          return createModelAssetsModule();
        }

        return null;
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        models: resolve(__dirname, 'modelli.html'),
        textures: resolve(__dirname, 'textures.html'),
        hdrs: resolve(__dirname, 'hdr.html'),
        animationView: resolve(__dirname, 'animazioni/view.html'),
        assetView: resolve(__dirname, 'asset/view.html')
      }
    }
  }
});