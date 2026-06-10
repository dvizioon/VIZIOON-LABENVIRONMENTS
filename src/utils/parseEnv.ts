export interface EnvPair {
  key: string
  value: string
  line: number
  protected: boolean
}

export interface ParseResult {
  pairs: EnvPair[]
  skipped: number
  errors: string[]
}

export function parseEnvContent(content: string): ParseResult {
  const lines = content.split(/\r?\n/)
  const pairs: EnvPair[] = []
  const errors: string[] = []
  let skipped = 0

  lines.forEach((rawLine, index) => {
    const lineNum = index + 1
    const line = rawLine.trim()

    if (!line || line.startsWith('#')) {
      skipped++
      return
    }

    const exportPrefix = line.startsWith('export ') ? 7 : 0
    const body = line.slice(exportPrefix).trim()

    const eqIndex = body.indexOf('=')
    if (eqIndex === -1) {
      errors.push(`Linha ${lineNum}: formato inválido (falta "=")`)
      return
    }

    const key = body.slice(0, eqIndex).trim()
    let value = body.slice(eqIndex + 1)

    if (!key) {
      errors.push(`Linha ${lineNum}: chave vazia`)
      return
    }

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      errors.push(`Linha ${lineNum}: chave "${key}" inválida`)
      return
    }

    value = unwrapValue(value.trim())

    pairs.push({ key, value, line: lineNum, protected: false })
  })

  return { pairs, skipped, errors }
}

function unwrapValue(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    const quote = value[0]
    const inner = value.slice(1, -1)
    if (quote === '"') {
      return inner
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
    }
    return inner
  }
  return value
}
