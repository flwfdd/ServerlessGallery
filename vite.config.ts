import { cloudflare } from '@cloudflare/vite-plugin'
import honoBuild from '@hono/vite-build/cloudflare-workers'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import ssrHotReload from 'vite-plugin-ssr-hot-reload'

export default defineConfig(({ command, mode, isSsrBuild }) => {
  if (command === 'serve') {
    return { plugins: [tailwindcss(), vue(), ssrHotReload(), cloudflare()] }
  }

  if (mode === 'client') {
    return {
      plugins: [tailwindcss(), vue()],
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
