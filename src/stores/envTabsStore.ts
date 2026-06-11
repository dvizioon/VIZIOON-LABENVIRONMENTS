import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { EnvPair } from '@/utils/parseEnv'
import {
  DEFAULT_ENV_TAB_ID,
  type EnvTab,
  slugifyTabName,
  prefixForTab,
  belongsToTab,
} from '@/utils/envPrefix'

const STORAGE_KEY = 'vizioon_env_tabs'

interface StoredState {
  tabs: EnvTab[]
  activeTabId: string
  queues: Record<string, { fileName: string | null; pairs: EnvPair[] }>
}

const defaultTab = (): EnvTab => ({
  id: DEFAULT_ENV_TAB_ID,
  label: 'Padrão',
  prefix: '',
  isDefault: true,
})

export const useEnvTabsStore = defineStore('envTabs', () => {
  const tabs = ref<EnvTab[]>([defaultTab()])
  const activeTabId = ref(DEFAULT_ENV_TAB_ID)
  const queues = ref<StoredState['queues']>({})
  const loaded = ref(false)

  const activeTab = computed(() => tabs.value.find((t) => t.id === activeTabId.value) ?? defaultTab())

  const customPrefixes = computed(() =>
    tabs.value.filter((t) => !t.isDefault).map((t) => t.prefix),
  )

  async function load() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY)
      const saved = result[STORAGE_KEY] as StoredState | undefined
      if (saved) {
        tabs.value = saved.tabs?.length ? saved.tabs : [defaultTab()]
        activeTabId.value = saved.activeTabId ?? DEFAULT_ENV_TAB_ID
        queues.value = saved.queues ?? {}
      }
    } catch {
      /* ignore */
    }
    loaded.value = true
  }

  async function persist() {
    if (!loaded.value) return
    const payload: StoredState = {
      tabs: tabs.value.map((t) => ({ ...t })),
      activeTabId: activeTabId.value,
      queues: { ...queues.value },
    }
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: payload })
    } catch {
      /* ignore */
    }
  }

  watch(
    [tabs, activeTabId, queues],
    () => {
      if (loaded.value) persist()
    },
    { deep: true },
  )

  function setActiveTab(id: string) {
    activeTabId.value = id
    persist()
  }

  function addTab(name: string): EnvTab | null {
    const slug = slugifyTabName(name)
    if (!slug || slug === DEFAULT_ENV_TAB_ID) return null
    if (tabs.value.some((t) => t.id === slug)) return null

    const tab: EnvTab = {
      id: slug,
      label: name.trim(),
      prefix: prefixForTab(slug),
      isDefault: false,
    }
    tabs.value.push(tab)
    persist()
    return tab
  }

  function removeTab(id: string) {
    if (id === DEFAULT_ENV_TAB_ID) return
    tabs.value = tabs.value.filter((t) => t.id !== id)
    delete queues.value[id]
    if (activeTabId.value === id) activeTabId.value = DEFAULT_ENV_TAB_ID
    persist()
  }

  function saveQueue(tabId: string, fileName: string | null, pairs: EnvPair[]) {
    queues.value[tabId] = { fileName, pairs }
    persist()
  }

  function loadQueue(tabId: string) {
    return queues.value[tabId] ?? { fileName: null, pairs: [] }
  }

  function clearQueue(tabId: string) {
    delete queues.value[tabId]
    persist()
  }

  function filterPageKeys(keys: { key: string; protected: boolean; persisted: boolean }[]) {
    const tab = activeTab.value
    return keys.filter((v) => belongsToTab(v.key, tab, customPrefixes.value))
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    customPrefixes,
    loaded,
    load,
    setActiveTab,
    addTab,
    removeTab,
    saveQueue,
    loadQueue,
    clearQueue,
    filterPageKeys,
  }
})
