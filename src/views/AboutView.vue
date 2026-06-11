<script setup lang="ts">
import { computed } from 'vue'
import {
  APP_NAME,
  APP_TAGLINE,
  APP_VERSION,
  APP_DESCRIPTION_LEAD,
  DEVELOPER_EMAIL,
  GITHUB_URL,
  GITHUB_USER,
} from '@/core/constants'
import VzIcon from '@/components/VzIcon.vue'

const logoUrl = computed(() => chrome.runtime.getURL('public/logo.svg'))
</script>

<template>
  <div class="vz-panel vz-panel--about">
    <div class="vz-about-hero">
      <img :src="logoUrl" alt="" class="vz-about-hero__watermark" aria-hidden="true" />

      <div class="vz-about-hero__content">
        <img :src="logoUrl" alt="VIZIOON" class="vz-about-hero__logo" />
        <h2 class="vz-about-hero__name">{{ APP_NAME }}</h2>
        <p class="vz-about-hero__tagline">{{ APP_TAGLINE }}</p>
        <p class="vz-about-hero__desc">{{ APP_DESCRIPTION_LEAD }}</p>
        <span class="vz-about-hero__version">v{{ APP_VERSION }}</span>
      </div>
    </div>

    <div class="vz-about-designer">
      <p class="vz-about-designer__label">Desenvolvido por</p>
      <p class="vz-about-designer__name">Daniel Martins</p>
      <a class="vz-about-link" :href="`mailto:${DEVELOPER_EMAIL}`">{{ DEVELOPER_EMAIL }}</a>
    </div>

    <a class="vz-about-github" :href="GITHUB_URL" target="_blank" rel="noopener noreferrer">
      <VzIcon icon="ph:github-logo-fill" :size="18" />
      GitHub @{{ GITHUB_USER }}
    </a>
  </div>
</template>
