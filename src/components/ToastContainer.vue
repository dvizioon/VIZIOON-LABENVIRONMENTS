<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="vz-toasts">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-center justify-between gap-3 rounded px-3 py-2.5 text-sm font-semibold text-white"
        :style="{
          background:
            toast.type === 'error'
              ? 'var(--vz-danger)'
              : toast.type === 'success'
                ? 'var(--vz-success)'
                : 'var(--vz-blue-accent)',
          borderRadius: 'var(--vz-radius)',
          fontFamily: 'var(--vz-font)',
        }"
      >
        <span>{{ toast.message }}</span>
        <button
          class="shrink-0 opacity-80"
          style="background: none; border: none; color: inherit; cursor: pointer"
          aria-label="Fechar"
          @click="dismiss(toast.id)"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
