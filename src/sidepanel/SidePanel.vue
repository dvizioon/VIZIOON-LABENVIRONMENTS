<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import TabBar, { type TabItem } from '@/components/layout/TabBar.vue'
import ImportEnvView from '@/components/ImportEnvView.vue'
import SettingsView from '@/views/SettingsView.vue'
import VersionsView from '@/views/VersionsView.vue'
import AboutView from '@/views/AboutView.vue'
import HistoryView from '@/views/HistoryView.vue'
import { useEnvTabsStore } from '@/stores/envTabsStore'
import ToastContainer from '@/components/ToastContainer.vue'
import VzIcon from '@/components/VzIcon.vue'
import { useSettingsStore } from '@/stores/settingsStore'
const emit = defineEmits<{ close: [] }>()

const settings = useSettingsStore()
const envTabs = useEnvTabsStore()
const activeTab = ref('variables')
const versionsKey = ref(0)

const logoUrl = computed(() => chrome.runtime.getURL('public/logo.svg'))

const tabs: TabItem[] = [
  { id: 'variables', label: 'Variáveis', icon: 'ph:squares-four-fill' },
  { id: 'history', label: 'Histórico', icon: 'ph:clock-counter-clockwise-fill' },
  { id: 'settings', label: 'Config', icon: 'ph:gear-six-fill' },
  { id: 'versions', label: 'Versões', icon: 'ph:tag-fill' },
  { id: 'about', label: 'Sobre', icon: 'ph:info-fill' },
]

watch(activeTab, (tab) => {
  if (tab === 'versions') versionsKey.value++
})

function onSetTab(e: Event) {
  const tab = (e as CustomEvent<string>).detail
  if (tabs.some((t) => t.id === tab)) activeTab.value = tab
}

onMounted(async () => {
  await Promise.all([settings.load(), envTabs.load()])
  window.addEventListener('vizioon:set-tab', onSetTab)
})

onUnmounted(() => {
  window.removeEventListener('vizioon:set-tab', onSetTab)
})
</script>

<template>
  <div class="vz-shell vz-shell--injected">
    <header class="vz-header">
      <img :src="logoUrl" alt="VIZIOON" class="vz-header__logo" />
      <div class="vz-header__text">
        <h1>VIZIOON</h1>
        <p>LAB ENVIRONMENTS</p>
      </div>
      <button
        type="button"
        class="vz-header__close"
        title="Fechar"
        aria-label="Fechar painel"
        @click="emit('close')"
      >
        <VzIcon icon="ph:x-bold" :size="20" />
      </button>
    </header>

    <TabBar v-model="activeTab" :tabs="tabs" />

    <div class="vz-panels">
      <div v-show="activeTab === 'variables'" class="vz-panel-wrap" role="tabpanel">
        <ImportEnvView />
      </div>
      <div v-show="activeTab === 'history'" class="vz-panel-wrap" role="tabpanel">
        <HistoryView />
      </div>
      <div v-show="activeTab === 'settings'" class="vz-panel-wrap" role="tabpanel">
        <SettingsView />
      </div>
      <div v-show="activeTab === 'versions'" class="vz-panel-wrap" role="tabpanel">
        <VersionsView :key="versionsKey" />
      </div>
      <div v-show="activeTab === 'about'" class="vz-panel-wrap" role="tabpanel">
        <AboutView />
      </div>
    </div>

    <ToastContainer />
  </div>
</template>
