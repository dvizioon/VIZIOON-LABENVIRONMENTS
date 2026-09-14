import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGithubReleases } from '../src/composables/useGithubReleases'

const originalFetch = globalThis.fetch

describe('useGithubReleases', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('mapeia releases da API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          tag_name: 'v0.1.0',
          name: 'Primeira release',
          html_url: 'https://github.com/dvizioon/VIZIOON-LABENVIRONMENTS/releases/tag/v0.1.0',
          prerelease: false,
          published_at: '2026-05-31T12:00:00Z',
        },
      ],
    })
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const { releases, loading, error, loaded, load } = useGithubReleases()
    await load()

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(loading.value).toBe(false)
    expect(error.value).toBe(false)
    expect(loaded.value).toBe(true)
    expect(releases.value).toEqual([
      {
        tag: 'v0.1.0',
        name: 'Primeira release',
        url: 'https://github.com/dvizioon/VIZIOON-LABENVIRONMENTS/releases/tag/v0.1.0',
        prerelease: false,
        publishedAt: '2026-05-31T12:00:00Z',
      },
    ])
  })

  it('marca erro quando API falha', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }) as unknown as typeof fetch

    const { releases, error, loaded, load } = useGithubReleases()
    await load()

    expect(error.value).toBe(true)
    expect(loaded.value).toBe(false)
    expect(releases.value).toEqual([])
  })
})
