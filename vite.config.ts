import { defineConfig } from 'vite'
import { resolve } from 'path'
import copy from 'rollup-plugin-copy'

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.ts'),
        options: resolve(__dirname, 'src/options/options.ts')
      },
      output: {
        entryFileNames: `[name].js`,
        assetFileNames: `assets/[name].[ext]`
      },
      plugins: [
        copy({
          targets: [
            { src: 'src/manifest.json', dest: 'dist' },
            { src: 'src/icons', dest: 'dist' },
            { src: 'src/options/options.html', dest: 'dist/options' }
          ],
          hook: 'writeBundle'
        })
      ]
    }
  }
})
