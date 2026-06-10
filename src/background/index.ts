import { BRAND_BLUE_DARK } from '@/core/constants'
import { STORAGE_KEY, type AppSettings } from '@/stores/settingsStore'

async function loadSettings(): Promise<AppSettings> {
  try {
    const data = await chrome.storage.local.get(STORAGE_KEY)
    return (data[STORAGE_KEY] as AppSettings) ?? {
      autoSave: false,
      floatingButtonEnabled: true,
    }
  } catch {
    return { autoSave: false, floatingButtonEnabled: true }
  }
}

async function isFloatingEnabled() {
  const s = await loadSettings()
  return s.floatingButtonEnabled !== false
}

async function broadcastFloatingEnabled(enabled: boolean) {
  const tabs = await chrome.tabs.query({})
  for (const tab of tabs) {
    if (!tab.id) continue
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'PLUGIN_ENABLED', enabled })
    } catch {
      /* aba sem content script */
    }
    if (tab.url) updateBadge(tab.id, tab.url, enabled)
  }
}

async function updateBadge(tabId: number, url?: string, enabledOverride?: boolean) {
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    chrome.action.setBadgeText({ tabId, text: '' })
    return
  }

  const enabled = enabledOverride ?? (await isFloatingEnabled())
  if (!enabled) {
    chrome.action.setBadgeText({ tabId, text: 'OFF' })
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#6c757d' })
  } else {
    chrome.action.setBadgeText({ tabId, text: 'ON' })
    chrome.action.setBadgeBackgroundColor({ tabId, color: BRAND_BLUE_DARK })
  }
}

async function refreshAllBadges() {
  const enabled = await isFloatingEnabled()
  const tabs = await chrome.tabs.query({})
  for (const tab of tabs) {
    if (tab.id && tab.url) updateBadge(tab.id, tab.url, enabled)
  }
}

chrome.runtime.onInstalled.addListener(() => {
  refreshAllBadges()
})

chrome.runtime.onStartup.addListener(() => {
  refreshAllBadges()
})

refreshAllBadges()

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    updateBadge(tabId, changeInfo.url || tab.url)
  }
})

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId)
    updateBadge(tabId, tab.url)
  } catch {
    /* ignore */
  }
})

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes[STORAGE_KEY]) return
  const oldVal = changes[STORAGE_KEY].oldValue as AppSettings | undefined
  const newVal = changes[STORAGE_KEY].newValue as AppSettings | undefined
  if (oldVal?.floatingButtonEnabled === newVal?.floatingButtonEnabled) return
  broadcastFloatingEnabled(newVal?.floatingButtonEnabled !== false)
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SET_FLOATING_ENABLED') {
    ;(async () => {
      const data = await chrome.storage.local.get(STORAGE_KEY)
      const prev = (data[STORAGE_KEY] as AppSettings) ?? {}
      const enabled = !!message.enabled
      await chrome.storage.local.set({
        [STORAGE_KEY]: { ...prev, floatingButtonEnabled: enabled },
      })
      await broadcastFloatingEnabled(enabled)
      sendResponse({ ok: true, enabled })
    })()
    return true
  }

  if (message.type === 'GET_FLOATING_ENABLED') {
    isFloatingEnabled().then((enabled) => sendResponse({ enabled }))
    return true
  }

  if (message.type === 'OPEN_SIDEBAR') {
    ;(async () => {
      if (!(await isFloatingEnabled())) {
        sendResponse({ ok: false, error: 'floatingDisabled' })
        return
      }
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!activeTab?.id) {
        sendResponse({ ok: false, error: 'noTab' })
        return
      }
      const tab =
        message.tab === 'settings' ||
        message.tab === 'versions' ||
        message.tab === 'about'
          ? message.tab
          : 'variables'
      try {
        await chrome.tabs.sendMessage(activeTab.id, { type: 'OPEN_SIDEBAR', tab })
        sendResponse({ ok: true })
      } catch {
        sendResponse({ ok: false, error: 'reloadPage' })
      }
    })()
    return true
  }

  return false
})
