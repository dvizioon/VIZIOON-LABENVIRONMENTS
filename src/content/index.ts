import {
  detectVariablesPage,
  importVariablesToPage,
  clearPageVariables,
} from './gitlabDom'
import { syncUiEnabled, toggleSidebar, openSidebar } from './ui'
import type { ContentMessage, ContentResponse } from '@/types/messages'

chrome.runtime.onMessage.addListener((message: ContentMessage, _sender, sendResponse) => {
  if (message.type === 'PLUGIN_ENABLED') {
    syncUiEnabled()
    sendResponse({ ok: true })
    return true
  }

  if (message.type === 'TOGGLE_SIDEBAR') {
    if (message.tab) openSidebar(message.tab)
    else toggleSidebar()
    sendResponse({ ok: true })
    return true
  }

  if (message.type === 'OPEN_SIDEBAR') {
    openSidebar(message.tab)
    sendResponse({ ok: true })
    return true
  }

  const respond = (response: ContentResponse) => {
    sendResponse(response)
  }

  if (message.type === 'PING') {
    respond({ ok: true, data: detectVariablesPage() })
    return true
  }

  if (message.type === 'IMPORT_VARIABLES') {
    importVariablesToPage(message.payload.items, message.payload.autoSave)
      .then((result) => respond({ ok: true, data: result }))
      .catch((err) =>
        respond({
          ok: false,
          error: err instanceof Error ? err.message : 'Erro ao importar',
        }),
      )
    return true
  }

  if (message.type === 'CLEAR_PAGE_VARIABLES') {
    clearPageVariables(message.tab, message.autoSave ?? false)
      .then((result) => respond({ ok: true, data: result }))
      .catch((err) =>
        respond({
          ok: false,
          error: err instanceof Error ? err.message : 'Erro ao limpar',
        }),
      )
    return true
  }

  return false
})

syncUiEnabled()
