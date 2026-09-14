import { readFileSync, writeFileSync } from 'fs'
import { defineConfig, build } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { crx } from '@crxjs/vite-plugin'
import { resolve } from 'path'
import manifest from './manifest.config'

const root = __dirname
const contentScriptFile = 'assets/content-script.js'

function contentScriptIife() {
  return {
    name: 'vizioon-content-iife',
    apply: 'build' as const,
    async closeBundle() {
      await build({
        configFile: false,
        root,
        plugins: [vue(), tailwindcss()],
        define: {
          'process.env.NODE_ENV': JSON.stringify('production'),
        },
        resolve: {
          alias: { '@': resolve(root, 'src') },
        },
        build: {
          emptyOutDir: false,
          outDir: resolve(root, 'dist/assets'),
          cssCodeSplit: false,
          lib: {
            entry: resolve(root, 'src/content/index.ts'),
            formats: ['iife'],
            name: 'VizioonContent',
            fileName: () => 'content-script.js',
          },
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
              extend: true,
            },
          },
        },
      })

      const manifestPath = resolve(root, 'dist/manifest.json')
      const built = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
        content_scripts?: Array<{ js?: string[]; css?: string[] }>
      }
      const script = built.content_scripts?.[0]
      if (!script) return
      script.js = [contentScriptFile]
      script.css = []
      writeFileSync(manifestPath, JSON.stringify(built, null, 2))
    },
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), crx({ manifest }), contentScriptIife()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
})
