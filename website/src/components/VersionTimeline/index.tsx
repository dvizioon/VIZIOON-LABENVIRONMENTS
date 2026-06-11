import { useEffect, useState } from 'react'

const API_URL =
  'https://api.github.com/repos/dvizioon/VIZIOON-LABENVIRONMENTS/releases?per_page=30'

type Release = {
  tag: string
  prerelease: boolean
  publishedAt: string
  changes: string[]
  installUrl: string | null
}

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function parseBody(body: string): string[] {
  if (!body.trim()) return []
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*]/.test(line))
    .map((line) => line.replace(/^[-*]\s*/, ''))
    .filter(Boolean)
}

function pickInstallUrl(assets: unknown): string | null {
  if (!Array.isArray(assets) || assets.length === 0) return null

  const files = assets as Array<{ name?: string; browser_download_url?: string }>
  const zip = files.find((asset) => asset.name?.toLowerCase().endsWith('.zip'))
  const chosen = zip ?? files[0]

  return chosen?.browser_download_url ?? null
}

export default function VersionTimeline() {
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(API_URL, {
          headers: { Accept: 'application/vnd.github+json' },
        })
        if (!res.ok) return

        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) return

        const mapped: Release[] = data.map((r: Record<string, unknown>) => ({
          tag: (r.tag_name as string) || '',
          prerelease: !!r.prerelease,
          publishedAt: (r.published_at as string) || '',
          changes: parseBody((r.body as string) || ''),
          installUrl: pickInstallUrl(r.assets),
        }))

        if (!cancelled) setReleases(mapped)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading || releases.length === 0) return null

  return (
    <div className="version-timeline">
      <ol className="version-timeline__list">
        {releases.map((entry, index) => (
          <li key={entry.tag} className="version-timeline__item">
            <div className="version-timeline__marker" aria-hidden />
            <div className="version-timeline__card">
              <div className="version-timeline__head">
                <span className="version-timeline__version">{entry.tag}</span>
                {entry.publishedAt && (
                  <span className="version-timeline__date">{formatDate(entry.publishedAt)}</span>
                )}
                {index === 0 && !entry.prerelease && (
                  <span className="version-timeline__badge">atual</span>
                )}
                {entry.prerelease && (
                  <span className="version-timeline__badge version-timeline__badge--muted">
                    beta
                  </span>
                )}
                {entry.installUrl && (
                  <a
                    href={entry.installUrl}
                    className="version-timeline__badge version-timeline__badge--install"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    instalável
                  </a>
                )}
              </div>

              {entry.changes.length > 0 && (
                <ul className="version-timeline__changes">
                  {entry.changes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}

              {entry.installUrl && (
                <a
                  href={entry.installUrl}
                  className="version-timeline__download"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Baixar para instalar
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
