<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import VzIcon from '@/components/VzIcon.vue'

export interface TabItem {
  id: string
  label: string
  icon: string
}

const props = defineProps<{
  tabs: TabItem[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()

const btnRefs = ref<Record<string, HTMLButtonElement | null>>({})

function setBtnRef(id: string, el: HTMLButtonElement | null) {
  btnRefs.value[id] = el
}

function select(id: string) {
  emit('update:modelValue', id)
}

watch(
  () => props.modelValue,
  async (id) => {
    await nextTick()
    btnRefs.value[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  },
)
</script>

<template>
  <nav class="vz-tabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :ref="(el) => setBtnRef(tab.id, el as HTMLButtonElement | null)"
      type="button"
      role="tab"
      class="vz-tabs__btn"
      :class="{ 'vz-tabs__btn--active': modelValue === tab.id }"
      :aria-selected="modelValue === tab.id"
      :tabindex="modelValue === tab.id ? 0 : -1"
      @click="select(tab.id)"
    >
      <VzIcon :icon="tab.icon" :size="18" class="vz-tabs__icon" />
      <span class="vz-tabs__label">{{ tab.label }}</span>
    </button>
  </nav>
</template>
