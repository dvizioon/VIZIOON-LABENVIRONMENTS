<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSettingsSync } from '@/composables/useSettingsSync'

const settings = useSettingsSync()
const { autoSave } = storeToRefs(settings)
</script>

<template>
  <div class="vz-panel vz-panel--settings">
    <h2 class="vz-panel__title">Configurações</h2>
    <p class="vz-panel__intro">
      Opções de comportamento ao importar variáveis para a página do GitLab.
    </p>

    <label class="vz-settings-row">
      <div>
        <p class="vz-settings-row__title">Salvar automaticamente</p>
        <p class="vz-settings-row__desc">
          Clica em "Save variables" no GitLab após preencher a fila.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        :aria-checked="autoSave"
        class="vz-protected__btn"
        :class="{ 'vz-protected__btn--on': autoSave }"
        @click="autoSave = !autoSave"
      />
    </label>
  </div>
</template>
