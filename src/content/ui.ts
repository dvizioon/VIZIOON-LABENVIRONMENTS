import { createApp, type App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import { addCollection } from '@iconify/vue'
import phIcons from '@iconify-json/ph/icons.json'
import FloatingShell from './FloatingShell.vue'
import { STORAGE_KEY, normalizeSettings } from '@/stores/settingsStore'
import { shouldShowFloatingUi } from './isGitlabPage'
import contentStyles from '@/style.css?inline'

addCollection(phIcons)

let vueApp: VueApp | null = null
let rootEl: HTMLElement | null = null
let hostStyleEl: HTMLStyleElement | null = null

const HOST_CSS = `
#vizioon-root {
  position: fixed;
  inset: 0;
  width: auto;
  height: auto;
  overflow: visible;
  z-index: 2147483644;
  pointer-events: none;
}
body.vizioon-sidebar-open {
  margin-right: 400px !important;
  transition: margin-right 0.2s ease;
}
`

async function isFloatingEnabled(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY)
    return normalizeSettings(result[STORAGE_KEY]).floatingButtonEnabled
  } catch {
    return true
  }
}

export function bootUi() {
  if (rootEl?.isConnected) return
  if (!document.body) return

  if (rootEl && !rootEl.isConnected) {
    unmountUi()
  }

  hostStyleEl = document.createElement('style')
  hostStyleEl.id = 'vizioon-host-styles'
  hostStyleEl.textContent = HOST_CSS
  document.documentElement.appendChild(hostStyleEl)

  rootEl = document.createElement('div')
  rootEl.id = 'vizioon-root'

  const shadow = rootEl.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = `
#vizioon-app, #vizioon-toggle, #vizioon-sidebar { pointer-events: auto; }
${contentStyles.replaceAll(':root', ':host, :root')}
`
  shadow.appendChild(style)

  const mountPoint = document.createElement('div')
  mountPoint.id = 'vizioon-app'
  shadow.appendChild(mountPoint)

  document.body.appendChild(rootEl)

  vueApp = createApp(FloatingShell)
  vueApp.use(createPinia())
  vueApp.mount(mountPoint)
}

export function unmountUi() {
  vueApp?.unmount()
  vueApp = null
  rootEl?.remove()
  rootEl = null
  hostStyleEl?.remove()
  hostStyleEl = null
  document.body?.classList.remove('vizioon-sidebar-open')
}

export async function syncUiEnabled() {
  const enabled = await isFloatingEnabled()
  if (shouldShowFloatingUi(enabled)) {
    if (rootEl && !rootEl.isConnected) unmountUi()
    bootUi()
    return
  }
  unmountUi()
}

export function toggleSidebar() {
  window.dispatchEvent(new CustomEvent('vizioon:toggle'))
}

export function openSidebar(tab?: string) {
  window.dispatchEvent(new CustomEvent('vizioon:open', { detail: { tab } }))
}
