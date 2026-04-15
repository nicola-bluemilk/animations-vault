import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        models: resolve(__dirname, 'modelli.html'),
        modelRolex: resolve(__dirname, 'modelli/rolex.html'),
        modelCoffeeMug: resolve(__dirname, 'modelli/coffee-mug.html'),
        modelCoffeeMat: resolve(__dirname, 'modelli/coffee-mat.html'),
        anim1: resolve(__dirname, 'animazioni/anim1.html'),
        anim2: resolve(__dirname, 'animazioni/anim2.html'),
        anim3: resolve(__dirname, 'animazioni/anim3.html'),
        anim4: resolve(__dirname, 'animazioni/anim4.html'),
        anim5: resolve(__dirname, 'animazioni/anim5.html'),
        anim6: resolve(__dirname, 'animazioni/anim6.html'),
        anim7: resolve(__dirname, 'animazioni/anim7.html'),
        anim8: resolve(__dirname, 'animazioni/anim8.html'),
        anim9: resolve(__dirname, 'animazioni/anim9.html'),
        anim10: resolve(__dirname, 'animazioni/anim10.html')
      }
    }
  }
});