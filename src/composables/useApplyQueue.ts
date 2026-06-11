import { storeToRefs } from 'pinia'
import { useImportStore } from '@/stores/importStore'
import { useEnvTabsStore } from '@/stores/envTabsStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useGitlabPage } from '@/composables/useGitlabPage'
import { useToast } from '@/composables/useToast'
import { applyTabPrefix } from '@/utils/envPrefix'

export function useApplyQueue() {
  const importStore = useImportStore()
  const envTabs = useEnvTabsStore()
  const historyStore = useHistoryStore()
  const settings = useSettingsStore()
  const { autoSave } = storeToRefs(settings)
  const { activeTab, activeTabId } = storeToRefs(envTabs)
  const gitlab = useGitlabPage()
  const { pageContext, refresh, importToPage } = gitlab
  const { show } = useToast()

  async function applyQueueToPage(): Promise<boolean> {
    if (!pageContext.value.ready) {
      show('Abra CI/CD → Variables no GitLab', 'error')
      return false
    }
    if (!importStore.hasPairs) {
      show('Nenhuma variável na fila', 'error')
      return false
    }

    try {
      const tab = activeTab.value
      const result = await importStore.bulkInject(
        importToPage,
        autoSave.value,
        (key) => applyTabPrefix(tab, key),
      )

      if (result.imported > 0) {
        await historyStore.addEntry({
          fileName: importStore.fileName,
          pageTitle: pageContext.value.title || 'GitLab Variables',
          pageUrl: window.location.href,
          envTabId: activeTabId.value,
          envTabLabel: tab.label,
          pairs: importStore.pairs.map((p) => ({ ...p })),
          importedCount: result.imported,
          saved: !!result.saved,
        })
      }

      if (result.success) {
        const msg = result.saved
          ? `${result.imported} variáveis salvas!`
          : `${result.imported} preenchidas — clique Save variables`
        show(msg, 'success')
        importStore.clearAll()
        envTabs.clearQueue(activeTabId.value)
        await refresh()
        return true
      }

      if (result.imported > 0) {
        show(`${result.imported} enviada(s), ${result.failed.length} falharam`, 'error')
      } else {
        show(`${result.failed.length} variável(is) falharam`, 'error')
      }
      return false
    } catch (err) {
      show(err instanceof Error ? err.message : 'Erro ao preencher', 'error')
      return false
    }
  }

  return { applyQueueToPage, ...gitlab }
}
