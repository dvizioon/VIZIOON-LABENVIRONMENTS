<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import VzIcon from '@/components/VzIcon.vue'
import { APP_NAME, APP_TAGLINE, GITHUB_URL, PRIVACY_URL } from '@/core/constants'
import { useSettingsStore } from '@/stores/settingsStore'

const settings = useSettingsStore()
const { floatingButtonEnabled, privacyAccepted } = storeToRefs(settings)

const logoUrl = computed(() => chrome.runtime.getURL('public/logo.svg'))
const statusMsg = ref('')
const busy = ref(false)
const showPrivacyModal = ref(false)

const powerLabel = computed(() =>
  floatingButtonEnabled.value ? 'Botão flutuante ativo' : 'Botão flutuante desativado',
)

async function setFloatingEnabled(enabled: boolean) {
  const res = await chrome.runtime.sendMessage({ type: 'SET_FLOATING_ENABLED', enabled })
  if (!res?.ok) throw new Error('save failed')
  await settings.setFloatingButtonEnabled(enabled)
}

async function onTogglePower() {
  if (busy.value) return
  statusMsg.value = ''

  if (floatingButtonEnabled.value) {
    try {
      await setFloatingEnabled(false)
    } catch {
      statusMsg.value = 'Erro ao salvar preferência.'
    }
    return
  }

  if (privacyAccepted.value) {
    busy.value = true
    try {
      await setFloatingEnabled(true)
    } catch {
      statusMsg.value = 'Erro ao ativar. Tente de novo.'
    } finally {
      busy.value = false
    }
    return
  }

  showPrivacyModal.value = true
}

async function confirmEnable() {
  showPrivacyModal.value = false
  busy.value = true
  try {
    await settings.acceptPrivacy()
    await setFloatingEnabled(true)
  } catch {
    floatingButtonEnabled.value = false
    statusMsg.value = 'Erro ao ativar. Tente de novo.'
  } finally {
    busy.value = false
  }
}

function cancelEnable() {
  showPrivacyModal.value = false
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
  <div class="vz-popup" :class="{ 'vz-popup--privacy': showPrivacyModal }">
    <template v-if="showPrivacyModal">
      <section class="vz-popup-privacy" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
        <header class="vz-popup-privacy__head">
          <VzIcon icon="ph:shield-check-fill" :size="22" />
          <h2 id="privacy-title">Antes de ativar</h2>
        </header>

        <div class="vz-popup-privacy__scroll">
          <p>
            A extensão roda no seu navegador. Configurações, histórico e arquivos .env que você
            importar ficam salvos localmente no Chrome ou Edge.
          </p>
          <p>
            Não enviamos seus dados para servidores externos. Para entender melhor o que é
            armazenado e como usamos as permissões, leia a política de privacidade.
          </p>
          <a
            class="vz-popup-privacy__link"
            :href="PRIVACY_URL"
            target="_blank"
            rel="noopener noreferrer"
          >
            <VzIcon icon="ph:arrow-square-out-bold" :size="15" />
            Abrir política de privacidade
          </a>
        </div>

        <footer class="vz-popup-privacy__actions">
          <button type="button" class="vz-btn vz-btn--secondary" @click="cancelEnable">
            Cancelar
          </button>
          <button
            type="button"
            class="vz-btn vz-btn--primary"
            :disabled="busy"
            @click="confirmEnable"
          >
            Entendi, ativar
          </button>
        </footer>
      </section>
    </template>

    <template v-else>
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
          <span class="vz-popup__power-label">{{ powerLabel }}</span>
          <button
            type="button"
            role="switch"
            :aria-checked="floatingButtonEnabled"
            :aria-label="powerLabel"
            class="vz-protected__btn vz-popup__switch"
            :class="{ 'vz-protected__btn--on': floatingButtonEnabled }"
            :disabled="busy"
            @click="onTogglePower"
          />
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
    </template>
  </div>
</template>
