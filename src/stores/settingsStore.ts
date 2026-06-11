import { defineStore } from 'pinia'
import { ref } from 'vue'

export const STORAGE_KEY = 'vizioon_settings'

export interface AppSettings {
  autoSave: boolean
  floatingButtonEnabled: boolean
}

const defaults: AppSettings = {
  autoSave: true,
  floatingButtonEnabled: true,
}

export const useSettingsStore = defineStore('settings', () => {
  const autoSave = ref(defaults.autoSave)
  const floatingButtonEnabled = ref(defaults.floatingButtonEnabled)
  const loaded = ref(false)

  async function load() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY)
      const saved = result[STORAGE_KEY] as AppSettings | undefined
      if (saved) {
        autoSave.value = saved.autoSave ?? defaults.autoSave
        floatingButtonEnabled.value =
          saved.floatingButtonEnabled ?? defaults.floatingButtonEnabled
      }
    } catch {
      /* ignore */
    }
    loaded.value = true
  }

  async function save() {
    const payload: AppSettings = {
      autoSave: autoSave.value,
      floatingButtonEnabled: floatingButtonEnabled.value,
    }
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: payload })
    } catch {
      /* ignore */
    }
  }

  async function setFloatingButtonEnabled(enabled: boolean) {
    floatingButtonEnabled.value = enabled
    await save()
  }

  return {
    autoSave,
    floatingButtonEnabled,
    loaded,
    load,
    save,
    setFloatingButtonEnabled,
  }
})
