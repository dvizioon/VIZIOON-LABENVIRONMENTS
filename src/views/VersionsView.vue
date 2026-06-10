<script setup lang="ts">
import { onMounted } from 'vue'
import {
  APP_VERSION,
  GITHUB_RELEASES_URL,
  GITHUB_URL,
} from '@/core/constants'
import { useGithubReleases } from '@/composables/useGithubReleases'

const { releases, loading, error, load } = useGithubReleases()

onMounted(() => load())

function isCurrent(tag: string) {
  return tag === `v${APP_VERSION}` || tag === APP_VERSION
}
</script>

<template>
  <div class="vz-panel vz-panel--versions">
    <p class="vz-versions-current">Versão instalada: <strong>v{{ APP_VERSION }}</strong></p>
    <a class="vz-versions-repo" :href="GITHUB_RELEASES_URL" target="_blank" rel="noopener noreferrer">
      Ver todas no GitHub
    </a>

    <div class="vz-versions-list">
      <p v-if="loading" class="vz-empty">Carregando releases...</p>
      <template v-else-if="error">
        <p class="vz-empty">Não foi possível carregar as versões.</p>
        <button class="vz-btn vz-btn--secondary vz-btn--block" type="button" @click="load(true)">
          Tentar novamente
        </button>
      </template>
      <p v-else-if="releases.length === 0" class="vz-empty">Nenhuma release publicada ainda.</p>
      <a
        v-for="rel in releases"
        v-else
        :key="rel.tag"
        class="vz-versions-item"
        :href="rel.url || GITHUB_URL"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="vz-versions-item__tag">{{ rel.tag }}</span>
        <span class="vz-versions-item__meta">
          <span v-if="rel.prerelease" class="vz-versions-badge">beta</span>
          <span v-if="isCurrent(rel.tag)" class="vz-versions-badge vz-versions-badge--current">
            atual
          </span>
        </span>
      </a>
    </div>
  </div>
</template>
