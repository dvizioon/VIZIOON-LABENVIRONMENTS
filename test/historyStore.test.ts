import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useHistoryStore } from '../src/stores/historyStore'

function sampleEntry() {
  return {
    fileName: 'app.env',
    pageTitle: 'Projeto',
    pageUrl: 'https://gitlab.com/group/project',
    envTabId: 'default',
    envTabLabel: 'Padrão',
    pairs: [{ key: 'API_KEY', value: 'secret', line: 1, protected: false }],
    importedCount: 1,
    saved: false,
  }
}

describe('useHistoryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adiciona e remove entradas', async () => {
    const store = useHistoryStore()

    const entry = await store.addEntry(sampleEntry())
    expect(store.entries).toHaveLength(1)
    expect(entry.id).toBeTruthy()
    expect(entry.createdAt).toBeTruthy()

    await store.removeEntry(entry.id)
    expect(store.entries).toHaveLength(0)
  })

  it('exporta e importa JSON com merge', async () => {
    const store = useHistoryStore()
    await store.addEntry(sampleEntry())

    const exported = store.exportJson()
    const parsed = JSON.parse(exported)
    expect(parsed.version).toBe(1)
    expect(parsed.entries).toHaveLength(1)

    await store.clearAll()
    expect(store.entries).toHaveLength(0)

    const imported = await store.importJson(exported, true)
    expect(imported).toBe(1)
    expect(store.entries).toHaveLength(1)
    expect(store.entries[0].pairs[0].key).toBe('API_KEY')
  })

  it('importa array legado sem wrapper', async () => {
    const store = useHistoryStore()
    const payload = [
      {
        id: 'legacy-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        ...sampleEntry(),
      },
    ]

    const count = await store.importJson(JSON.stringify(payload), false)
    expect(count).toBe(1)
    expect(store.entries[0].id).toBe('legacy-1')
  })
})
