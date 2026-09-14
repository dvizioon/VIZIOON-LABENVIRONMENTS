import { ref, onMounted, onUnmounted } from 'vue'
import {
  detectVariablesPage,
  importVariablesToPage,
  clearPageVariables as clearPageVariablesDom,
} from '@/content/gitlabDom'
import type { ClearTabFilter, ImportResult, PageContext } from '@/types/messages'

const pageContext = ref<PageContext>({ ready: false, variables: [] })
const checking = ref(false)

export function useGitlabPage() {
  let interval: ReturnType<typeof setInterval> | null = null

  async function refresh() {
    checking.value = true
    try {
      pageContext.value = detectVariablesPage()
    } finally {
      checking.value = false
    }
  }

  async function importToPage(
    items: { key: string; value: string; protected: boolean }[],
    autoSave: boolean,
  ): Promise<ImportResult> {
    return importVariablesToPage(items, autoSave)
  }

  async function clearPageVariables(
    tab: ClearTabFilter,
    autoSave = false,
  ): Promise<{ cleared: number; saved: boolean }> {
    const result = await clearPageVariablesDom(tab, autoSave)
    await refresh()
    return result
  }

  onMounted(() => {
    refresh()
    interval = setInterval(refresh, 3000)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })

  return {
    pageContext,
    checking,
    refresh,
    importToPage,
    clearPageVariables,
  }
}
