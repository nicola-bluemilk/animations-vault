import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        anim1: resolve(__dirname, 'animazioni/anim1.html'),
        anim2: resolve(__dirname, 'animazioni/anim2.html')
      }
    }
  }
});