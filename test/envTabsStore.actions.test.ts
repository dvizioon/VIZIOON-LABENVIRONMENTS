import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useEnvTabsStore } from '../src/stores/envTabsStore'
import { DEFAULT_ENV_TAB_ID } from '../src/utils/envPrefix'

describe('useEnvTabsStore actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('cria, ativa e remove aba customizada', async () => {
    const store = useEnvTabsStore()
    await store.load()

    const tab = store.addTab('Production')
    expect(tab?.id).toBe('production')
    expect(store.tabs).toHaveLength(2)

    store.setActiveTab('production')
    expect(store.activeTabId).toBe('production')

    store.saveQueue('production', 'prod.env', [
      { key: 'API', value: '1', line: 1, protected: false },
    ])
    expect(store.loadQueue('production').pairs).toHaveLength(1)

    store.removeTab('production')
    expect(store.tabs).toHaveLength(1)
    expect(store.activeTabId).toBe(DEFAULT_ENV_TAB_ID)
    expect(store.loadQueue('production').pairs).toHaveLength(0)
  })

  it('não cria aba duplicada ou com nome inválido', async () => {
    const store = useEnvTabsStore()
    await store.load()

    expect(store.addTab('   ')).toBeNull()
    expect(store.addTab('default')).toBeNull()

    store.addTab('Staging')
    expect(store.addTab('Staging')).toBeNull()
    expect(store.tabs).toHaveLength(2)
  })

  it('filtra chaves da página conforme aba ativa', async () => {
    const store = useEnvTabsStore()
    await store.load()
    store.addTab('Production')
    store.setActiveTab('production')

    const filtered = store.filterPageKeys([
      { key: 'API_KEY', protected: false, persisted: true },
      { key: 'production_DB', protected: true, persisted: true },
      { key: 'staging_API', protected: false, persisted: false },
    ])

    expect(filtered.map((item) => item.key)).toEqual(['production_DB'])
  })
})
