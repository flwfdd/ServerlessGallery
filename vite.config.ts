import { cloudflare } from '@cloudflare/vite-plugin'
import honoBuild from '@hono/vite-build/cloudflare-workers'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import copy from 'rollup-plugin-copy'
import { defineConfig } from 'vite'

export default defineConfig(({ command, mode, isSsrBuild }) => {
  if (command === 'serve') {
    return {
      plugins: [tailwindcss(), vue(), cloudflare()]
    }
  }

  if (mode === 'client') {
    return {
      plugins: [
        tailwindcss(),
        vue(),
        copy({
          targets: [
            { src: 'public/favicon.ico', dest: 'dist' }
          ],
          hook: 'writeBundle'
        })
      ],
      build: {
        rollupOptions: {
          input: {
            client: './src/client/main.ts'
          },
          output: {
            dir: 'dist/static',
            entryFileNames: '[name].js',
            chunkFileNames: 'chunks/[name]-[hash].js',
            assetFileNames: 'assets/style.css'
          }
        },
        emptyOutDir: false,
        copyPublicDir: false
      }
    }
  }

  if (isSsrBuild) {
    return {
      publicDir: false,
      plugins: [
        honoBuild({
          entry: 'src/api/index.ts',
          outputDir: 'dist-server',
          entryContentAfterHooks: [],
          entryContentDefaultExportHook: () => ''
        })
      ]
    }
  }

  return {
    publicDir: false,
    plugins: [
      honoBuild({
        entry: 'src/index.ts',
        outputDir: 'dist-server',
        entryContentAfterHooks: [],
        entryContentDefaultExportHook: () => ''
      })
    ]
  }
})
