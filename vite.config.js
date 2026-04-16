import { readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { defineConfig } from 'vite';

const modelPages = Object.fromEntries(
  readdirSync(resolve(__dirname, 'modelli'))
    .filter((fileName) => fileName.endsWith('.html'))
    .map((fileName) => [`model-${basename(fileName, '.html')}`, resolve(__dirname, 'modelli', fileName)])
);

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        models: resolve(__dirname, 'modelli.html'),
        animationView: resolve(__dirname, 'animazioni/view.html'),
        ...modelPages
      }
    }
  }
});