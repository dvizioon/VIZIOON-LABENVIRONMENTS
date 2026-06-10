import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'VIZIOON Lab Environments',
  description: 'Importe variáveis de ambiente GitLab CI/CD direto do navegador.',
  version: '0.1.0',
  permissions: ['storage', 'tabs'],
  host_permissions: ['*://*/*'],
  content_scripts: [
    {
      matches: ['*://*/*'],
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
    },
  ],
  icons: {
    16: 'public/favicon-16x16.png',
    48: 'public/android-chrome-48x48.png',
    128: 'public/android-chrome-128x128.png',
  },
  action: {
    default_title: 'VIZIOON Lab Environments',
    default_popup: 'src/popup/index.html',
    default_icon: {
      16: 'public/favicon-16x16.png',
      48: 'public/android-chrome-48x48.png',
      128: 'public/android-chrome-128x128.png',
    },
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  web_accessible_resources: [
    {
      resources: ['public/*'],
      matches: ['*://*/*'],
    },
  ],
})
