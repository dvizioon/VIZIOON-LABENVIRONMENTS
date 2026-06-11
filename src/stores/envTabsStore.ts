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

function isEnvTab(value: unknown): value is EnvTab {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const t = value as Record<string, unknown>
  return (
    typeof t.id === 'string' &&
    typeof t.label === 'string' &&
    typeof t.prefix === 'string' &&
    typeof t.isDefault === 'boolean'
  )
}

function normalizeTabs(raw: unknown): EnvTab[] {
  if (!Array.isArray(raw)) return [defaultTab()]
  const tabs = raw.filter(isEnvTab)
  if (!tabs.some((t) => t.id === DEFAULT_ENV_TAB_ID)) {
    tabs.unshift(defaultTab())
  }
  return tabs.length ? tabs : [defaultTab()]
}

function normalizePairs(raw: unknown): EnvPair[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (p) =>
      p &&
      typeof p === 'object' &&
      !Array.isArray(p) &&
      typeof (p as EnvPair).key === 'string' &&
      typeof (p as EnvPair).value === 'string',
  ) as EnvPair[]
}

function normalizeQueues(raw: unknown): StoredState['queues'] {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const queues: StoredState['queues'] = {}
  for (const [tabId, entry] of Object.entries(raw as Record<string, unknown>)) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue
    const e = entry as Record<string, unknown>
    queues[tabId] = {
      fileName: typeof e.fileName === 'string' ? e.fileName : null,
      pairs: normalizePairs(e.pairs),
    }
  }
  return queues
}

function normalizeStoredState(raw: unknown): StoredState {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { tabs: [defaultTab()], activeTabId: DEFAULT_ENV_TAB_ID, queues: {} }
  }
  const saved = raw as Record<string, unknown>
  const tabs = normalizeTabs(saved.tabs)
  const activeTabId =
    typeof saved.activeTabId === 'string' && tabs.some((t) => t.id === saved.activeTabId)
      ? saved.activeTabId
      : DEFAULT_ENV_TAB_ID
  return {
    tabs,
    activeTabId,
    queues: normalizeQueues(saved.queues),
  }
}

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
      const saved = normalizeStoredState(result[STORAGE_KEY])
      tabs.value = saved.tabs
      activeTabId.value = saved.activeTabId
      queues.value = saved.queues
    } catch {
      tabs.value = [defaultTab()]
      activeTabId.value = DEFAULT_ENV_TAB_ID
      queues.value = {}
    }
    loaded.value = true
  }

  async function persist() {
    if (!loaded.value) return
    const payload: StoredState = {
      tabs: tabs.value.map((t) => ({ ...t })),
      activeTabId: activeTabId.value,
      queues: Object.fromEntries(
        Object.entries(queues.value).map(([id, q]) => [
          id,
          { fileName: q.fileName, pairs: q.pairs.map((p) => ({ ...p })) },
        ]),
      ),
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
