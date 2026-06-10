import { ref } from 'vue'
import { GITHUB_API_RELEASES } from '@/core/constants'

export interface GithubRelease {
  tag: string
  name: string
  url: string
  prerelease: boolean
  publishedAt: string
}

export function useGithubReleases() {
  const releases = ref<GithubRelease[]>([])
  const loading = ref(false)
  const error = ref(false)
  const loaded = ref(false)

  async function load(force = false) {
    if (loading.value) return
    if (loaded.value && !force) return

    loading.value = true
    error.value = false

    try {
      const res = await fetch(`${GITHUB_API_RELEASES}?per_page=30`, {
        headers: { Accept: 'application/vnd.github+json' },
      })
      if (!res.ok) throw new Error(`github_${res.status}`)

      const data = await res.json()
      releases.value = Array.isArray(data)
        ? data.map((r: Record<string, unknown>) => ({
            tag: (r.tag_name as string) || '',
            name: (r.name as string) || (r.tag_name as string) || '',
            url: (r.html_url as string) || '',
            prerelease: !!r.prerelease,
            publishedAt: (r.published_at as string) || '',
          }))
        : []
      loaded.value = true
    } catch {
      error.value = true
      releases.value = []
      loaded.value = false
    } finally {
      loading.value = false
    }
  }

  return { releases, loading, error, loaded, load }
}
