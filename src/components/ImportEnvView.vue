<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useImportStore } from '@/stores/importStore'
import { useEnvTabsStore } from '@/stores/envTabsStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useSettingsSync } from '@/composables/useSettingsSync'
import { useGitlabPage } from '@/composables/useGitlabPage'
import { useToast } from '@/composables/useToast'
import { applyTabPrefix } from '@/utils/envPrefix'
import EnvTabBar from './layout/EnvTabBar.vue'
import ProtectedToggle from './ProtectedToggle.vue'
import VzIcon from './VzIcon.vue'

const importStore = useImportStore()
const envTabs = useEnvTabsStore()
const historyStore = useHistoryStore()
const { show } = useToast()
const settings = useSettingsSync()
const { autoSave } = storeToRefs(settings)
const { activeTab, activeTabId } = storeToRefs(envTabs)
const { pageContext, checking, refresh, importToPage, clearPageVariables } = useGitlabPage()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const filteredPageVars = computed(() =>
  envTabs.filterPageKeys(pageContext.value.variables),
)

function maskValue(value: string) {
  if (value.length <= 4) return '••••••'
  return value.slice(0, 2) + '•'.repeat(Math.min(value.length - 2, 10))
}

function persistQueue() {
  envTabs.saveQueue(activeTabId.value, importStore.fileName, [...importStore.pairs])
}

function loadTabQueue() {
  const q = envTabs.loadQueue(activeTabId.value)
  importStore.setFromQueue(q.fileName, q.pairs)
}

watch(activeTabId, () => loadTabQueue())

onMounted(async () => {
  await Promise.all([envTabs.load(), historyStore.load()])
  loadTabQueue()
})

function readFile(file: File) {
  if (!file.name.endsWith('.env') && !file.name.includes('env')) {
    show('Selecione um arquivo .env', 'error')
    return
  }

  const reader = new FileReader()
  reader.onload = async (e) => {
    const content = e.target?.result as string
    importStore.loadFromContent(file.name, content)

    if (importStore.pairCount === 0 && importStore.parseErrors.length === 0) {
      show('Arquivo vazio ou sem variáveis válidas', 'error')
      return
    }

    persistQueue()

    if (importStore.pairCount > 0) {
      await historyStore.addEntry({
        fileName: file.name,
        pageTitle: pageContext.value.title || 'GitLab Variables',
        pageUrl: window.location.href,
        envTabId: activeTabId.value,
        envTabLabel: activeTab.value.label,
        pairs: importStore.pairs.map((p) => ({ ...p })),
        importedCount: 0,
        saved: false,
      })
    }

    if (importStore.parseErrors.length) {
      show(`${importStore.parseErrors.length} linha(s) com erro`, 'info')
    } else {
      const prefix = activeTab.value.isDefault ? '' : activeTab.value.prefix
      show(`${importStore.pairCount} variáveis → ${prefix || 'sem prefixo'}`, 'success')
    }
  }
  reader.onerror = () => show('Erro ao ler o arquivo', 'error')
  reader.readAsText(file)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) readFile(file)
  input.value = ''
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) readFile(file)
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function openPicker() {
  fileInput.value?.click()
}

function clearImportQueue() {
  importStore.clearAll()
  envTabs.clearQueue(activeTabId.value)
  show('Fila limpa', 'info')
}

async function clearAllOnPage() {
  if (!pageContext.value.ready) {
    show('Abra a página de Variables do GitLab', 'error')
    return
  }
  if (!confirm(`Remover variáveis do ambiente "${activeTab.value.label}"?`)) return

  try {
    const tab = activeTab.value
    const result = await clearPageVariables(
      {
        isDefault: tab.isDefault,
        prefix: tab.prefix,
        customPrefixes: [...envTabs.customPrefixes],
      },
      autoSave.value,
    )

    importStore.clearAll()
    envTabs.clearQueue(activeTabId.value)

    if (result.cleared === 0) {
      show('Nenhuma variável encontrada neste ambiente', 'info')
      return
    }

    const msg = result.saved
      ? `${result.cleared} variáveis removidas e salvas`
      : `${result.cleared} marcadas para remoção — clique Save variables`
    show(msg, 'success')
  } catch (err) {
    show(err instanceof Error ? err.message : 'Erro ao limpar', 'error')
  }
}

async function applyToPage() {
  if (!pageContext.value.ready) {
    show('Abra CI/CD → Variables no GitLab', 'error')
    return
  }
  if (!importStore.hasPairs) {
    show('Carregue um arquivo .env primeiro', 'error')
    return
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
    } else if (result.imported > 0) {
      show(`${result.imported} enviada(s), ${result.failed.length} falharam`, 'error')
    } else {
      show(`${result.failed.length} variável(is) falharam`, 'error')
    }
  } catch (err) {
    show(err instanceof Error ? err.message : 'Erro ao preencher', 'error')
  }
}

watch(
  () => importStore.pairs,
  () => {
    if (envTabs.loaded && importStore.hasPairs) persistQueue()
  },
  { deep: true },
)
</script>

<template>
  <div class="vz-main">
    <EnvTabBar />

    <div class="vz-status">
      <div
        class="vz-status__dot"
        :class="pageContext.ready ? 'vz-status__dot--ok' : 'vz-status__dot--warn'"
      />
      <div class="vz-status__text">
        <strong>
          <template v-if="checking">Verificando...</template>
          <template v-else-if="pageContext.ready">
            {{ pageContext.title || 'GitLab Variables' }}
          </template>
          <template v-else>Abra CI/CD → Variables</template>
        </strong>
        <span v-if="pageContext.ready">
          {{ filteredPageVars.length }} em "{{ activeTab.label }}"
          <template v-if="importStore.hasPairs"> · {{ importStore.pairCount }} na fila</template>
        </span>
        <span v-else>Recarregue a página (F5)</span>
      </div>
      <button class="vz-btn vz-btn--ghost" type="button" @click="refresh">
        <VzIcon icon="ph:arrows-clockwise-bold" :size="16" />
      </button>
    </div>

    <div class="vz-toolbar">
      <div class="vz-toolbar__actions">
        <button class="vz-btn vz-btn--secondary" type="button" @click="openPicker">
          <VzIcon icon="ph:upload-simple-bold" :size="16" />
          Importar .env
        </button>
        <button
          class="vz-btn vz-btn--danger"
          type="button"
          :disabled="!importStore.hasPairs"
          @click="clearImportQueue"
        >
          <VzIcon icon="ph:trash-bold" :size="16" />
          Limpar fila
        </button>
        <button
          class="vz-btn vz-btn--danger"
          type="button"
          :disabled="!pageContext.ready || filteredPageVars.length === 0"
          @click="clearAllOnPage"
        >
          <VzIcon icon="ph:eraser-bold" :size="16" />
          Limpar tudo
        </button>
      </div>
      <div class="vz-toolbar__meta">
        <span v-if="!activeTab.isDefault" class="vz-env-hint">
          Prefixo: <code>{{ activeTab.prefix }}{{ '{' }}VAR{{ '}' }}</code>
        </span>
        <span v-else-if="importStore.fileName">
          Arquivo: <strong>{{ importStore.fileName }}</strong>
        </span>
        <span v-else>Sem prefixo no ambiente padrão</span>
      </div>
    </div>

    <div
      class="vz-dropzone"
      role="button"
      tabindex="0"
      :class="{ 'vz-dropzone--active': isDragging }"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop.prevent="onDrop"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
    >
      <input ref="fileInput" type="file" accept=".env,.env.*,text/plain" hidden @change="onFileChange" />
      <VzIcon icon="ph:file-arrow-up-bold" :size="28" class="vz-dropzone__icon" />
      <p class="vz-dropzone__title">
        {{ isDragging ? 'Solte o .env aqui' : 'Arraste ou clique para selecionar .env' }}
      </p>
      <p class="vz-dropzone__hint">KEY=VALUE · # comentários</p>
    </div>

    <div v-if="importStore.parseErrors.length" class="vz-errors">
      <ul>
        <li v-for="(err, i) in importStore.parseErrors" :key="i">{{ err }}</li>
      </ul>
    </div>

    <div class="vz-section">
      <div class="vz-section__head">
        Variáveis na página
        <span>{{ filteredPageVars.length }}</span>
      </div>
      <div class="vz-list">
        <div v-if="!pageContext.ready" class="vz-empty">Conecte à página Variables</div>
        <div v-else-if="filteredPageVars.length === 0" class="vz-empty">
          Nenhuma variável neste ambiente
        </div>
        <div v-for="variable in filteredPageVars" v-else :key="variable.key" class="vz-item">
          <div class="vz-item__body">
            <div class="vz-item__key">{{ variable.key }}</div>
            <div class="vz-item__value">••••••••</div>
          </div>
          <div class="vz-item__actions">
            <span v-if="variable.persisted" class="vz-badge vz-badge--page">salva</span>
            <ProtectedToggle :model-value="variable.protected" readonly />
          </div>
        </div>
      </div>
    </div>

    <div v-if="importStore.hasPairs" class="vz-section">
      <div class="vz-section__head">
        Fila — {{ activeTab.label }}
        <span>{{ importStore.pairCount }}</span>
      </div>
      <div class="vz-list" style="max-height: 200px">
        <div v-for="pair in importStore.pairs" :key="pair.key" class="vz-item vz-item--import">
          <span class="vz-item__line">{{ pair.line }}</span>
          <div class="vz-item__body">
            <div class="vz-item__key">
              {{ pair.key }}
              <span v-if="!activeTab.isDefault" class="vz-prefixed-key">
                → {{ applyTabPrefix(activeTab, pair.key) }}
              </span>
            </div>
            <div class="vz-item__value">{{ maskValue(pair.value) }}</div>
          </div>
          <div class="vz-item__actions">
            <ProtectedToggle
              :model-value="pair.protected"
              @update:model-value="importStore.setPairProtected(pair.key, $event)"
            />
            <button class="vz-icon-btn" type="button" aria-label="Remover" @click="importStore.removePair(pair.key)">
              <VzIcon icon="ph:x-bold" :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="vz-footer">
      <button
        class="vz-btn vz-btn--primary vz-btn--block"
        type="button"
        :disabled="!pageContext.ready || !importStore.hasPairs || importStore.isImporting"
        @click="applyToPage"
      >
        <VzIcon icon="ph:cloud-arrow-up-bold" :size="18" />
        {{ importStore.isImporting ? 'Preenchendo...' : 'Preencher na página' }}
      </button>
    </div>
  </div>
</template>
