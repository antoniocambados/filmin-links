import { defineConfig } from 'vite'
import { resolve } from 'path'
import copy from 'rollup-plugin-copy'

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    rollupOptions: {
      // Especifica las entradas si tienes más de un punto de entrada.
      input: {
        content: resolve(__dirname, 'src/main.ts')
        // Puedes agregar más entradas si fuera necesario.
      },
      output: {
        entryFileNames: `main.js`,
        assetFileNames: `assets/[name].[ext]`
      },
      plugins: [
        copy({
          targets: [
            { src: 'src/manifest.json', dest: 'dist' },
            { src: 'src/icons', dest: 'dist' }
          ],
          hook: 'writeBundle'
        })
      ]
    }
  }
});
