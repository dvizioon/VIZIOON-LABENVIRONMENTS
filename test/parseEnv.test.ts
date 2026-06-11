import { describe, expect, it } from 'vitest'
import { parseEnvContent } from '../src/utils/parseEnv'

describe('parseEnvContent', () => {
  it('parseia pares simples', () => {
    const result = parseEnvContent('API_URL=https://gitlab.com\nTOKEN=abc123')

    expect(result.errors).toEqual([])
    expect(result.skipped).toBe(0)
    expect(result.pairs).toEqual([
      { key: 'API_URL', value: 'https://gitlab.com', line: 1, protected: false },
      { key: 'TOKEN', value: 'abc123', line: 2, protected: false },
    ])
  })

  it('ignora linhas vazias e comentários', () => {
    const result = parseEnvContent('# comentário\nAPI_KEY=1\n\nDB_HOST=localhost')

    expect(result.errors).toEqual([])
    expect(result.skipped).toBe(2)
    expect(result.pairs).toHaveLength(2)
  })

  it('aceita export e valores entre aspas', () => {
    const result = parseEnvContent(
      'export SECRET="valor\\ncom\\nquebra"\nMSG=\'aspas simples\'',
    )

    expect(result.errors).toEqual([])
    expect(result.pairs[0]).toMatchObject({
      key: 'SECRET',
      value: 'valor\ncom\nquebra',
    })
    expect(result.pairs[1]).toMatchObject({
      key: 'MSG',
      value: 'aspas simples',
    })
  })

  it('preserva valor com sinal de igual', () => {
    const result = parseEnvContent('CONN=host=localhost;port=5432')

    expect(result.errors).toEqual([])
    expect(result.pairs[0]).toMatchObject({
      key: 'CONN',
      value: 'host=localhost;port=5432',
    })
  })

  it('reporta linha sem igual e chave inválida', () => {
    const result = parseEnvContent('INVALIDA\n1BAD=ok\n=sem_chave')

    expect(result.pairs).toHaveLength(0)
    expect(result.errors).toEqual([
      'Linha 1: formato inválido (falta "=")',
      'Linha 2: chave "1BAD" inválida',
      'Linha 3: chave vazia',
    ])
  })
})
