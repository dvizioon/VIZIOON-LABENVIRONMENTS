import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { parseEnvContent, type EnvPair } from '@/utils/parseEnv'
import type { ImportResult } from '@/types/messages'

export interface ImportProgress {
  total: number
  done: number
  current?: string
  failed: { key: string; error: string }[]
}

export const useImportStore = defineStore('import', () => {
  const fileName = ref<string | null>(null)
  const pairs = ref<EnvPair[]>([])
  const parseErrors = ref<string[]>([])
  const skippedLines = ref(0)
  const isImporting = ref(false)
  const progress = ref<ImportProgress | null>(null)

  const pairCount = computed(() => pairs.value.length)
  const hasPairs = computed(() => pairs.value.length > 0)

  function reset() {
    fileName.value = null
    pairs.value = []
    parseErrors.value = []
    skippedLines.value = 0
    progress.value = null
  }

  function loadFromContent(name: string, content: string) {
    reset()
    fileName.value = name

    const result = parseEnvContent(content)
    pairs.value = result.pairs
    parseErrors.value = result.errors
    skippedLines.value = result.skipped
  }

  function removePair(key: string) {
    pairs.value = pairs.value.filter((p) => p.key !== key)
    if (pairs.value.length === 0) fileName.value = null
  }

  function setPairProtected(key: string, value: boolean) {
    const pair = pairs.value.find((p) => p.key === key)
    if (pair) pair.protected = value
  }

  function clearAll() {
    reset()
  }

  function setFromQueue(name: string | null, queuePairs: EnvPair[]) {
    fileName.value = name
    pairs.value = [...queuePairs]
    parseErrors.value = []
    skippedLines.value = 0
    progress.value = null
  }

  async function bulkInject(
    injectFn: (
      items: { key: string; value: string; protected: boolean }[],
      autoSave: boolean,
    ) => Promise<ImportResult>,
    autoSave: boolean,
    mapKey: (key: string) => string,
  ): Promise<ImportResult> {
    if (!pairs.value.length) {
      return { success: false, imported: 0, failed: [] }
    }

    isImporting.value = true

    const items = pairs.value.map((pair) => ({
      key: mapKey(pair.key),
      value: pair.value,
      protected: pair.protected,
    }))

    progress.value = { total: items.length, done: 0, current: items[0]?.key, failed: [] }

    const result = await injectFn(items, autoSave)

    progress.value = {
      total: items.length,
      done: items.length,
      failed: result.failed,
    }

    isImporting.value = false
    return result
  }

  return {
    fileName,
    pairs,
    parseErrors,
    skippedLines,
    isImporting,
    progress,
    pairCount,
    hasPairs,
    reset,
    loadFromContent,
    removePair,
    setPairProtected,
    clearAll,
    setFromQueue,
    bulkInject,
  }
})
