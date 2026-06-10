<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import VzIcon from '@/components/VzIcon.vue'
import { APP_NAME, APP_TAGLINE, GITHUB_URL } from '@/core/constants'
import { useSettingsStore } from '@/stores/settingsStore'

const settings = useSettingsStore()
const { floatingButtonEnabled } = storeToRefs(settings)

const logoUrl = computed(() => chrome.runtime.getURL('public/logo.svg'))
const statusMsg = ref('')
const busy = ref(false)

const powerLabel = computed(() =>
  floatingButtonEnabled.value ? 'Botão flutuante ativo' : 'Botão flutuante desativado',
)

async function onEnabledChange(e: Event) {
  const on = (e.target as HTMLInputElement).checked
  statusMsg.value = ''
  try {
    const res = await chrome.runtime.sendMessage({ type: 'SET_FLOATING_ENABLED', enabled: on })
    if (res?.ok) {
      await settings.setFloatingButtonEnabled(on)
    } else {
      ;(e.target as HTMLInputElement).checked = floatingButtonEnabled.value
    }
  } catch {
    ;(e.target as HTMLInputElement).checked = floatingButtonEnabled.value
    statusMsg.value = 'Erro ao salvar preferência.'
  }
}

async function openPanel(tab?: string) {
  if (!floatingButtonEnabled.value) return
  busy.value = true
  statusMsg.value = ''
  try {
    const res = await chrome.runtime.sendMessage({ type: 'OPEN_SIDEBAR', tab })
    if (res?.ok) {
      window.close()
      return
    }
    if (res?.error === 'reloadPage') {
      statusMsg.value = 'Recarregue a página GitLab e tente de novo.'
    } else if (res?.error === 'floatingDisabled') {
      statusMsg.value = 'Ative o botão flutuante primeiro.'
    } else {
      statusMsg.value = 'Não foi possível abrir o painel nesta aba.'
    }
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  await settings.load()
  try {
    const res = await chrome.runtime.sendMessage({ type: 'GET_FLOATING_ENABLED' })
    if (typeof res?.enabled === 'boolean') {
      floatingButtonEnabled.value = res.enabled
    }
  } catch {
    /* ignore */
  }
})
</script>

<template>
  <div class="vz-popup">
    <header class="vz-popup__header">
      <img :src="logoUrl" :alt="APP_NAME" />
      <div class="vz-popup__header-text">
        <h1>{{ APP_NAME }}</h1>
        <p>{{ APP_TAGLINE }}</p>
      </div>
      <a
        class="vz-popup__github"
        :href="GITHUB_URL"
        target="_blank"
        rel="noopener noreferrer"
        title="GitHub"
      >
        <VzIcon icon="ph:github-logo-fill" :size="20" />
      </a>
    </header>

    <main class="vz-popup__body vz-popup__actions">
      <div class="vz-popup__power">
        <span
          class="vz-popup__power-status"
          :data-state="floatingButtonEnabled ? 'on' : 'off'"
        >
          {{ floatingButtonEnabled ? 'ON' : 'OFF' }}
        </span>
        <label class="vz-popup__power-toggle">
          <input
            type="checkbox"
            :checked="floatingButtonEnabled"
            @change="onEnabledChange"
          />
          <span>{{ powerLabel }}</span>
        </label>
      </div>

      <p
        v-if="statusMsg"
        class="vz-popup__status vz-popup__status--warn"
        role="alert"
      >
        {{ statusMsg }}
      </p>

      <button
        type="button"
        class="vz-btn vz-btn--primary vz-btn--block vz-popup__btn"
        :disabled="!floatingButtonEnabled || busy"
        @click="openPanel('variables')"
      >
        <VzIcon icon="ph:sidebar-fill" :size="18" />
        Abrir painel
      </button>

      <button
        type="button"
        class="vz-btn vz-btn--secondary vz-btn--block vz-popup__btn"
        :disabled="!floatingButtonEnabled || busy"
        @click="openPanel('settings')"
      >
        <VzIcon icon="ph:gear-six-fill" :size="18" />
        Abrir configurações
      </button>
    </main>
  </div>
</template>
