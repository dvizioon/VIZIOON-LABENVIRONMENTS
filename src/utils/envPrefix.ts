import type { EnvPair } from './parseEnv'

export const DEFAULT_ENV_TAB_ID = 'default'

export interface EnvTab {
  id: string
  label: string
  prefix: string
  isDefault: boolean
}

export function slugifyTabName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

export function prefixForTab(slug: string): string {
  if (!slug || slug === DEFAULT_ENV_TAB_ID) return ''
  return `${slug}_`
}

export function applyTabPrefix(tab: EnvTab, key: string): string {
  if (tab.isDefault || !tab.prefix) return key
  return `${tab.prefix}${key}`
}

export function stripTabPrefix(tab: EnvTab, key: string): string {
  if (tab.isDefault || !tab.prefix) return key
  if (key.startsWith(tab.prefix)) return key.slice(tab.prefix.length)
  return key
}

export function belongsToTab(key: string, tab: EnvTab, customPrefixes: string[]): boolean {
  if (tab.isDefault) {
    return !customPrefixes.some((p) => p && key.startsWith(p))
  }
  return tab.prefix ? key.startsWith(tab.prefix) : false
}

export function pairsWithPrefix(pairs: EnvPair[], tab: EnvTab): EnvPair[] {
  return pairs.map((p) => ({
    ...p,
    key: applyTabPrefix(tab, p.key),
  }))
}
