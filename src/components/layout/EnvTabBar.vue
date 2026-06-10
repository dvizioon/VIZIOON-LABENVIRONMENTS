<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useEnvTabsStore } from '@/stores/envTabsStore'
import VzIcon from '@/components/VzIcon.vue'

const envTabs = useEnvTabsStore()
const { tabs, activeTabId } = storeToRefs(envTabs)

const showAdd = ref(false)
const newTabName = ref('')

function select(id: string) {
  envTabs.setActiveTab(id)
}

function confirmAdd() {
  const name = newTabName.value.trim()
  if (!name) return
  const tab = envTabs.addTab(name)
  if (tab) {
    envTabs.setActiveTab(tab.id)
    showAdd.value = false
    newTabName.value = ''
  }
}

function cancelAdd() {
  showAdd.value = false
  newTabName.value = ''
}

function removeTab(id: string, e: Event) {
  e.stopPropagation()
  if (confirm('Remover este ambiente e a fila salva?')) {
    envTabs.removeTab(id)
  }
}
</script>

<template>
  <div class="vz-env-tabs">
    <div class="vz-env-tabs__scroll">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="vz-env-tabs__btn"
        :class="{ 'vz-env-tabs__btn--active': activeTabId === tab.id }"
        @click="select(tab.id)"
      >
        <VzIcon :icon="tab.isDefault ? 'ph:house-simple-fill' : 'ph:cloud-fill'" :size="14" />
        <span>{{ tab.label }}</span>
        <span v-if="!tab.isDefault" class="vz-env-tabs__prefix">{{ tab.prefix }}*</span>
        <button
          v-if="!tab.isDefault"
          type="button"
          class="vz-env-tabs__remove"
          aria-label="Remover ambiente"
          @click="removeTab(tab.id, $event)"
        >
          <VzIcon icon="ph:x-bold" :size="12" />
        </button>
      </button>

      <button
        v-if="!showAdd"
        type="button"
        class="vz-env-tabs__add"
        title="Novo ambiente"
        @click="showAdd = true"
      >
        <VzIcon icon="ph:plus-bold" :size="16" />
      </button>
    </div>

    <div v-if="showAdd" class="vz-env-tabs__form">
      <input
        v-model="newTabName"
        type="text"
        class="vz-env-tabs__input"
        placeholder="ex: production"
        @keyup.enter="confirmAdd"
      />
      <button type="button" class="vz-btn vz-btn--primary" @click="confirmAdd">Criar</button>
      <button type="button" class="vz-btn vz-btn--secondary" @click="cancelAdd">Cancelar</button>
    </div>
  </div>
</template>
