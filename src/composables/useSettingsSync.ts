import { watch } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'

export function useSettingsSync() {
  const settings = useSettingsStore()

  watch(
    () => [settings.autoSave, settings.floatingButtonEnabled],
    () => {
      if (settings.loaded) settings.save()
    },
  )

  return settings
}
