<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useHistoryStore, type HistoryEntry } from '@/stores/historyStore'
import { useImportStore } from '@/stores/importStore'
import { useEnvTabsStore } from '@/stores/envTabsStore'
import { useToast } from '@/composables/useToast'
import VzIcon from '@/components/VzIcon.vue'

const history = useHistoryStore()
const importStore = useImportStore()
const envTabs = useEnvTabsStore()
const { show } = useToast()
const { entries } = storeToRefs(history)

const fileInput = ref<HTMLInputElement | null>(null)
const expanded = ref<Set<string>>(new Set())

const sorted = computed(() =>
  [...entries.value].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ),
)

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function shortUrl(url: string) {
  try {
    const u = new URL(url)
    return u.pathname.length > 42 ? u.pathname.slice(0, 42) + '…' : u.pathname
  } catch {
    return url.slice(0, 48)
  }
}

function maskValue(value: string) {
  if (value.length <= 4) return '••••••'
  return value.slice(0, 2) + '•'.repeat(Math.min(value.length - 2, 8))
}

function toggleExpand(id: string) {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}

function isExpanded(id: string) {
  return expanded.value.has(id)
}

function downloadJson(content: string, name: string) {
  const blob = new Blob([content], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

function exportAll() {
  downloadJson(history.exportJson(), `vizioon-historico-${Date.now()}.json`)
  show('Histórico exportado', 'success')
}

function exportOne(entry: HistoryEntry) {
  downloadJson(history.exportJson([entry]), `vizioon-${entry.id}.json`)
  show('Registro exportado', 'success')
}

function openImport() {
  fileInput.value?.click()
}

async function onImportFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const n = await history.importJson(text, true)
    show(`${n} registro(s) importado(s)`, 'success')
  } catch {
    show('Arquivo JSON inválido', 'error')
  }
  ;(e.target as HTMLInputElement).value = ''
}

function useEntry(entry: HistoryEntry) {
  const tabExists = envTabs.tabs.some((t) => t.id === entry.envTabId)
  const tabId = tabExists ? entry.envTabId : envTabs.activeTabId

  if (!tabExists) {
    show(`Ambiente "${entry.envTabLabel}" não existe — usando aba atual`, 'info')
  }

  envTabs.setActiveTab(tabId)
  importStore.setFromQueue(entry.fileName, entry.pairs.map((p) => ({ ...p })))
  envTabs.saveQueue(tabId, entry.fileName, [...importStore.pairs])

  window.dispatchEvent(new CustomEvent('vizioon:set-tab', { detail: 'variables' }))
  show(`${entry.pairs.length} variáveis carregadas na fila`, 'success')
}

async function removeEntry(id: string) {
  if (!confirm('Remover este registro do histórico?')) return
  await history.removeEntry(id)
  show('Registro removido', 'info')
}

async function clearHistory() {
  if (!confirm('Limpar todo o histórico?')) return
  await history.clearAll()
  show('Histórico limpo', 'info')
}

onMounted(() => history.load())
</script>

<template>
  <div class="vz-panel vz-panel--history">
    <div class="vz-history-toolbar">
      <h2 class="vz-panel__title">Histórico</h2>
      <div class="vz-history-toolbar__actions">
        <button type="button" class="vz-btn vz-btn--secondary" @click="exportAll">
          <VzIcon icon="ph:download-simple-bold" :size="14" />
          Exportar
        </button>
        <button type="button" class="vz-btn vz-btn--secondary" @click="openImport">
          <VzIcon icon="ph:upload-simple-bold" :size="14" />
          Importar
        </button>
        <button
          type="button"
          class="vz-btn vz-btn--danger"
          :disabled="sorted.length === 0"
          @click="clearHistory"
        >
          <VzIcon icon="ph:trash-bold" :size="14" />
        </button>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        hidden
        @change="onImportFile"
      />
    </div>

    <p class="vz-panel__intro">
      .env importados e enviados ao GitLab. Expanda para ver variáveis por ambiente.
    </p>

    <div v-if="sorted.length === 0" class="vz-empty vz-empty--history">
      Nenhum registro ainda. Importe um .env ou preencha na página.
    </div>

    <div v-else class="vz-history-list">
      <article v-for="entry in sorted" :key="entry.id" class="vz-history-item">
        <div class="vz-history-item__head">
          <time :datetime="entry.createdAt">{{ formatDate(entry.createdAt) }}</time>
          <span class="vz-badge vz-badge--page">{{ entry.envTabLabel }}</span>
        </div>

        <h3 class="vz-history-item__title">
          {{ entry.fileName || 'Sem nome de arquivo' }}
        </h3>

        <p class="vz-history-item__meta">
          <strong>{{ entry.pageTitle || 'GitLab Variables' }}</strong>
        </p>
        <p class="vz-history-item__url" :title="entry.pageUrl">{{ shortUrl(entry.pageUrl) }}</p>

        <p class="vz-history-item__stats">
          <template v-if="entry.importedCount > 0">
            {{ entry.importedCount }} enviada(s) ·
          </template>
          {{ entry.pairs.length }} variável(is)
          <span v-if="entry.saved" class="vz-history-item__saved">· salvo no GitLab</span>
          <span v-else-if="entry.importedCount === 0" class="vz-history-item__draft">· só importado</span>
        </p>

        <button
          v-if="entry.pairs.length > 0"
          type="button"
          class="vz-history-item__expand"
          @click="toggleExpand(entry.id)"
        >
          <VzIcon
            :icon="isExpanded(entry.id) ? 'ph:caret-up-bold' : 'ph:caret-down-bold'"
            :size="14"
          />
          {{ isExpanded(entry.id) ? 'Ocultar variáveis' : `Ver ${entry.pairs.length} variáveis` }}
        </button>

        <ul v-if="isExpanded(entry.id)" class="vz-history-vars">
          <li v-for="pair in entry.pairs" :key="`${entry.id}-${pair.key}`" class="vz-history-vars__row">
            <span class="vz-history-vars__key">{{ pair.key }}</span>
            <span class="vz-history-vars__value">{{ maskValue(pair.value) }}</span>
            <span v-if="pair.protected" class="vz-badge vz-badge--page">protected</span>
          </li>
        </ul>

        <div class="vz-history-item__actions">
          <button type="button" class="vz-btn vz-btn--primary" @click="useEntry(entry)">
            <VzIcon icon="ph:arrow-counter-clockwise-bold" :size="14" />
            Usar
          </button>
          <button type="button" class="vz-btn vz-btn--ghost" @click="exportOne(entry)">
            <VzIcon icon="ph:export-bold" :size="14" />
            Exportar
          </button>
          <button
            type="button"
            class="vz-icon-btn"
            aria-label="Remover"
            @click="removeEntry(entry.id)"
          >
            <VzIcon icon="ph:trash-bold" :size="14" />
          </button>
        </div>
      </article>
    </div>
  </div>
</template>
