import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useImportStore } from '../src/stores/importStore'

describe('useImportStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('carrega conteúdo .env e expõe erros de parse', () => {
    const store = useImportStore()
    store.loadFromContent('app.env', 'GOOD=1\n# comment\nBAD LINE')

    expect(store.fileName).toBe('app.env')
    expect(store.pairCount).toBe(1)
    expect(store.pairs[0].key).toBe('GOOD')
    expect(store.parseErrors).toHaveLength(1)
    expect(store.skippedLines).toBe(1)
  })

  it('remove par e limpa nome quando fila zera', () => {
    const store = useImportStore()
    store.loadFromContent('x.env', 'A=1\nB=2')

    store.removePair('A')
    expect(store.pairCount).toBe(1)

    store.removePair('B')
    expect(store.pairCount).toBe(0)
    expect(store.fileName).toBeNull()
  })

  it('marca protected e injeta com mapKey', async () => {
    const store = useImportStore()
    store.loadFromContent('x.env', 'API=valor')
    store.setPairProtected('API', true)

    const injectFn = vi.fn().mockResolvedValue({
      success: true,
      imported: 1,
      failed: [],
      saved: true,
    })

    const result = await store.bulkInject(injectFn, true, (key) => `prod_${key}`)

    expect(injectFn).toHaveBeenCalledWith(
      [{ key: 'prod_API', value: 'valor', protected: true }],
      true,
    )
    expect(result.imported).toBe(1)
    expect(store.progress?.done).toBe(1)
  })
})
