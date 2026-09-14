import { defineStore } from 'pinia'
import { ref } from 'vue'

export const STORAGE_KEY = 'vizioon_settings'

export interface AppSettings {
  autoSave: boolean
  floatingButtonEnabled: boolean
  privacyAccepted: boolean
}

const defaults: AppSettings = {
  autoSave: true,
  floatingButtonEnabled: false,
  privacyAccepted: false,
}

export function normalizeSettings(raw: unknown): AppSettings {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...defaults }
  const o = raw as Record<string, unknown>
  return {
    autoSave: typeof o.autoSave === 'boolean' ? o.autoSave : defaults.autoSave,
    floatingButtonEnabled:
      typeof o.floatingButtonEnabled === 'boolean'
        ? o.floatingButtonEnabled
        : defaults.floatingButtonEnabled,
    privacyAccepted:
      typeof o.privacyAccepted === 'boolean' ? o.privacyAccepted : defaults.privacyAccepted,
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const autoSave = ref(defaults.autoSave)
  const floatingButtonEnabled = ref(defaults.floatingButtonEnabled)
  const privacyAccepted = ref(defaults.privacyAccepted)
  const loaded = ref(false)

  async function load() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY)
      const saved = normalizeSettings(result[STORAGE_KEY])
      autoSave.value = saved.autoSave
      floatingButtonEnabled.value = saved.floatingButtonEnabled
      privacyAccepted.value = saved.privacyAccepted
    } catch {
      /* ignore */
    }
    loaded.value = true
  }

  async function save() {
    const payload = normalizeSettings({
      autoSave: autoSave.value,
      floatingButtonEnabled: floatingButtonEnabled.value,
      privacyAccepted: privacyAccepted.value,
    })
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

  async function acceptPrivacy() {
    privacyAccepted.value = true
    await save()
  }

  return {
    autoSave,
    floatingButtonEnabled,
    privacyAccepted,
    loaded,
    load,
    save,
    setFloatingButtonEnabled,
    acceptPrivacy,
  }
})
