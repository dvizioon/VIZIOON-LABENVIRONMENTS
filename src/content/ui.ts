import { createApp, type App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import { addCollection } from '@iconify/vue'
import phIcons from '@iconify-json/ph/icons.json'
import FloatingShell from './FloatingShell.vue'
import { STORAGE_KEY, type AppSettings } from '@/stores/settingsStore'
import '@/style.css'

addCollection(phIcons)

let vueApp: VueApp | null = null
let rootEl: HTMLElement | null = null

async function isFloatingEnabled(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY)
    const saved = result[STORAGE_KEY] as AppSettings | undefined
    return saved?.floatingButtonEnabled !== false
  } catch {
    return true
  }
}

export function bootUi() {
  if (rootEl) return

  rootEl = document.createElement('div')
  rootEl.id = 'vizioon-root'
  document.body.appendChild(rootEl)

  vueApp = createApp(FloatingShell)
  vueApp.use(createPinia())
  vueApp.mount(rootEl)
}

export function unmountUi() {
  vueApp?.unmount()
  vueApp = null
  rootEl?.remove()
  rootEl = null
  document.body.classList.remove('vizioon-sidebar-open')
}

export async function syncUiEnabled() {
  const enabled = await isFloatingEnabled()
  if (enabled) bootUi()
  else unmountUi()
}

export function toggleSidebar() {
  window.dispatchEvent(new CustomEvent('vizioon:toggle'))
}

export function openSidebar(tab?: string) {
  window.dispatchEvent(new CustomEvent('vizioon:open', { detail: { tab } }))
}
