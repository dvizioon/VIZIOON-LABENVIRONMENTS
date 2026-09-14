export type GitlabPageProbe = {
  document?: Document | null
  hostname?: string
  href?: string
  gon?: unknown
}

const CI_CD_ROUTE = /\/settings\/ci_cd\/?$|\/ci\/variables\/?$/

export function isCiCdSettingsUrl(url?: string | null): boolean {
  if (!url) return false
  try {
    return CI_CD_ROUTE.test(new URL(url).pathname)
  } catch {
    return false
  }
}

export function isGitlabUrl(url?: string | null): boolean {
  if (!url) return false
  try {
    return hostnameLooksLikeGitlab(new URL(url).hostname)
  } catch {
    return false
  }
}

function hostnameLooksLikeGitlab(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return host === 'gitlab.com' || host.endsWith('.gitlab.com') || host.includes('gitlab')
}

function readGon(explicit?: unknown): unknown {
  if (explicit !== undefined) return explicit
  if (typeof window === 'undefined') return undefined
  return (window as Window & { gon?: unknown }).gon
}

function hasGitlabDomMarkers(doc: Document, gon: unknown): boolean {
  if (gon && typeof gon === 'object') return true

  const siteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content')
  if (siteName?.trim().toLowerCase() === 'gitlab') return true

  if (doc.querySelector('.navbar-gitlab')) return true
  if (doc.querySelector('meta[name="gitlab-feature-category"]')) return true
  if (doc.getElementById('js-peek')) return true

  const hasSuperSidebar = !!doc.querySelector('[data-testid="super-sidebar"]')
  const dataPage = doc.body?.getAttribute('data-page') || ''
  if (hasSuperSidebar && /^[\w-]+:[\w-]+/.test(dataPage)) return true

  return false
}

export function isGitlabPage(probe: GitlabPageProbe = {}): boolean {
  const hostname =
    probe.hostname ??
    (typeof location !== 'undefined' ? location.hostname : '')

  if (hostname && hostnameLooksLikeGitlab(hostname)) return true

  const doc = probe.document ?? (typeof document !== 'undefined' ? document : null)
  if (!doc) return false

  return hasGitlabDomMarkers(doc, readGon(probe.gon))
}

export function shouldShowFloatingUi(enabled: boolean, probe?: GitlabPageProbe): boolean {
  if (!enabled) return false
  const href = probe?.href ?? (typeof location !== 'undefined' ? location.href : '')
  return isCiCdSettingsUrl(href)
}
