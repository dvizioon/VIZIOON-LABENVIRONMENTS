import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    setupFiles: ['test/setup.ts'],
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['test/**/*.test.ts'],
          exclude: ['test/gitlabDom.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'gitlab-dom',
          include: ['test/gitlabDom.test.ts'],
          environment: 'happy-dom',
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
