<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import SidePanel from '@/sidepanel/SidePanel.vue'
const open = ref(false)
const logoUrl = computed(() => chrome.runtime.getURL('public/logo.svg'))

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

watch(open, (isOpen) => {
  document.body.classList.toggle('vizioon-sidebar-open', isOpen)
})

function onToggleEvent() {
  toggle()
}

function onOpenEvent(e: Event) {
  const detail = (e as CustomEvent<{ tab?: string }>).detail
  open.value = true
  if (detail?.tab) {
    window.dispatchEvent(new CustomEvent('vizioon:set-tab', { detail: detail.tab }))
  }
}

onMounted(() => {
  window.addEventListener('vizioon:toggle', onToggleEvent)
  window.addEventListener('vizioon:open', onOpenEvent)
})

onUnmounted(() => {
  window.removeEventListener('vizioon:toggle', onToggleEvent)
  window.removeEventListener('vizioon:open', onOpenEvent)
  document.body.classList.remove('vizioon-sidebar-open')
})
</script>

<template>
  <button
    id="vizioon-toggle"
    type="button"
    class="vizioon-btn-tab"
    :class="{ 'vizioon-toggle--sidebar-open': open }"
    :aria-expanded="open"
    :aria-hidden="open"
    title="Abrir VIZIOON"
    @click="toggle"
  >
    <img :src="logoUrl" alt="" class="vizioon-btn-tab__logo" />
    <span class="vizioon-btn-tab__label">VIZIOON</span>
  </button>

  <aside id="vizioon-sidebar" :class="{ 'vizioon-visible': open }">
    <SidePanel @close="close" />
  </aside>
</template>
