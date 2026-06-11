import { describe, expect, it } from 'vitest'
import {
  normalizeQueues,
  normalizeStoredState,
  normalizeTabs,
} from '../src/stores/envTabsStore'
import { DEFAULT_ENV_TAB_ID } from '../src/utils/envPrefix'

describe('normalizeTabs', () => {
  it('garante aba Padrão quando lista vem vazia', () => {
    const tabs = normalizeTabs(null)
    expect(tabs).toHaveLength(1)
    expect(tabs[0].id).toBe(DEFAULT_ENV_TAB_ID)
    expect(tabs[0].isDefault).toBe(true)
  })

  it('insere Padrão se storage não tiver aba default', () => {
    const tabs = normalizeTabs([
      { id: 'production', label: 'Production', prefix: 'production_', isDefault: false },
    ])

    expect(tabs[0].id).toBe(DEFAULT_ENV_TAB_ID)
    expect(tabs[1].id).toBe('production')
  })
})

describe('normalizeQueues', () => {
  it('filtra pares inválidos e preserva fileName', () => {
    const queues = normalizeQueues({
      default: {
        fileName: '.env',
        pairs: [
          { key: 'API', value: '1', line: 1, protected: false },
          { key: 1, value: 'x' },
          null,
        ],
      },
      bad: 'não é objeto',
    })

    expect(queues.default).toEqual({
      fileName: '.env',
      pairs: [{ key: 'API', value: '1', line: 1, protected: false }],
    })
    expect(queues.bad).toBeUndefined()
  })
})

describe('normalizeStoredState', () => {
  it('corrige activeTabId inválido', () => {
    const state = normalizeStoredState({
      tabs: [{ id: 'default', label: 'Padrão', prefix: '', isDefault: true }],
      activeTabId: 'inexistente',
      queues: {},
    })

    expect(state.activeTabId).toBe(DEFAULT_ENV_TAB_ID)
  })

  it('restaura estado completo válido', () => {
    const state = normalizeStoredState({
      tabs: [
        { id: 'default', label: 'Padrão', prefix: '', isDefault: true },
        { id: 'staging', label: 'Staging', prefix: 'staging_', isDefault: false },
      ],
      activeTabId: 'staging',
      queues: {
        staging: {
          fileName: 'staging.env',
          pairs: [{ key: 'DB', value: 'local', line: 1, protected: true }],
        },
      },
    })

    expect(state.activeTabId).toBe('staging')
    expect(state.queues.staging.pairs[0].protected).toBe(true)
  })
})
