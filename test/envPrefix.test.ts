import { describe, expect, it } from 'vitest'
import {
  applyTabPrefix,
  belongsToTab,
  pairsWithPrefix,
  prefixForTab,
  slugifyTabName,
  stripTabPrefix,
  type EnvTab,
} from '../src/utils/envPrefix'

const defaultTab: EnvTab = {
  id: 'default',
  label: 'Padrão',
  prefix: '',
  isDefault: true,
}

const productionTab: EnvTab = {
  id: 'production',
  label: 'Production',
  prefix: 'production_',
  isDefault: false,
}

describe('slugifyTabName', () => {
  it('normaliza nome da aba', () => {
    expect(slugifyTabName('  Production  ')).toBe('production')
    expect(slugifyTabName('Homologação V2')).toBe('homologao_v2')
  })
})

describe('prefixForTab', () => {
  it('retorna vazio para aba padrão', () => {
    expect(prefixForTab('default')).toBe('')
    expect(prefixForTab('')).toBe('')
  })

  it('adiciona underscore no final', () => {
    expect(prefixForTab('production')).toBe('production_')
  })
})

describe('applyTabPrefix / stripTabPrefix', () => {
  it('não altera chave na aba padrão', () => {
    expect(applyTabPrefix(defaultTab, 'API_KEY')).toBe('API_KEY')
    expect(stripTabPrefix(defaultTab, 'API_KEY')).toBe('API_KEY')
  })

  it('aplica e remove prefixo customizado', () => {
    expect(applyTabPrefix(productionTab, 'API_KEY')).toBe('production_API_KEY')
    expect(stripTabPrefix(productionTab, 'production_API_KEY')).toBe('API_KEY')
  })
})

describe('belongsToTab', () => {
  it('separa chaves entre aba padrão e customizada', () => {
    const prefixes = ['production_', 'staging_']

    expect(belongsToTab('API_KEY', defaultTab, prefixes)).toBe(true)
    expect(belongsToTab('production_API_KEY', defaultTab, prefixes)).toBe(false)
    expect(belongsToTab('production_API_KEY', productionTab, prefixes)).toBe(true)
    expect(belongsToTab('staging_API_KEY', productionTab, prefixes)).toBe(false)
  })
})

describe('pairsWithPrefix', () => {
  it('prefixa todas as chaves da fila', () => {
    const pairs = pairsWithPrefix(
      [{ key: 'DB_HOST', value: 'localhost', line: 1, protected: false }],
      productionTab,
    )

    expect(pairs[0].key).toBe('production_DB_HOST')
    expect(pairs[0].value).toBe('localhost')
  })
})
