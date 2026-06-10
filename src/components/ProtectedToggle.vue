<script setup lang="ts">
defineProps<{
  modelValue: boolean
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <div class="vz-protected">
    <span class="vz-protected__label">Prot.</span>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      class="vz-protected__btn"
      :class="{
        'vz-protected__btn--on': modelValue,
        'vz-protected__btn--readonly': readonly,
      }"
      :disabled="readonly"
      @click="!readonly && emit('update:modelValue', !modelValue)"
    />
  </div>
</template>
