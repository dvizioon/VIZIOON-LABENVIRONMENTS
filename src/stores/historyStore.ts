import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EnvPair } from '@/utils/parseEnv'

export const HISTORY_STORAGE_KEY = 'vizioon_upload_history'
const MAX_ENTRIES = 80

export interface HistoryEntry {
  id: string
  createdAt: string
  fileName: string | null
  pageTitle: string
  pageUrl: string
  envTabId: string
  envTabLabel: string
  pairs: EnvPair[]
  importedCount: number
  saved: boolean
}

export interface HistoryExport {
  version: 1
  exportedAt: string
  entries: HistoryEntry[]
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useHistoryStore = defineStore('history', () => {
  const entries = ref<HistoryEntry[]>([])
  const loaded = ref(false)

  async function load() {
    try {
      const result = await chrome.storage.local.get(HISTORY_STORAGE_KEY)
      const saved = result[HISTORY_STORAGE_KEY] as HistoryEntry[] | undefined
      entries.value = Array.isArray(saved) ? saved : []
    } catch {
      entries.value = []
    }
    loaded.value = true
  }

  async function persist() {
    try {
      const payload = JSON.parse(JSON.stringify(entries.value))
      await chrome.storage.local.set({ [HISTORY_STORAGE_KEY]: payload })
    } catch {
      /* ignore */
    }
  }

  async function addEntry(data: Omit<HistoryEntry, 'id' | 'createdAt'>) {
    const entry: HistoryEntry = {
      ...data,
      id: newId(),
      createdAt: new Date().toISOString(),
      pairs: data.pairs.map((p) => ({ ...p })),
    }
    entries.value = [entry, ...entries.value].slice(0, MAX_ENTRIES)
    await persist()
    return entry
  }

  async function removeEntry(id: string) {
    entries.value = entries.value.filter((e) => e.id !== id)
    await persist()
  }

  async function clearAll() {
    entries.value = []
    await persist()
  }

  function exportJson(selected?: HistoryEntry[]): string {
    const payload: HistoryExport = {
      version: 1,
      exportedAt: new Date().toISOString(),
      entries: (selected ?? entries.value).map((e) => ({
        ...e,
        pairs: e.pairs.map((p) => ({ ...p })),
      })),
    }
    return JSON.stringify(payload, null, 2)
  }

  async function importJson(raw: string, merge = true): Promise<number> {
    const parsed = JSON.parse(raw) as HistoryExport | HistoryEntry[]
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.entries)
        ? parsed.entries
        : []

    const valid = list.filter(
      (e) => e && typeof e === 'object' && Array.isArray((e as HistoryEntry).pairs),
    ) as HistoryEntry[]

    const normalized = valid.map((e) => ({
      ...e,
      id: e.id || newId(),
      createdAt: e.createdAt || new Date().toISOString(),
      pairs: e.pairs.map((p) => ({ ...p })),
    }))

    entries.value = merge
      ? [...normalized, ...entries.value].slice(0, MAX_ENTRIES)
      : normalized.slice(0, MAX_ENTRIES)

    await persist()
    return normalized.length
  }

  return {
    entries,
    loaded,
    load,
    addEntry,
    removeEntry,
    clearAll,
    exportJson,
    importJson,
  }
})
