import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearPageVariables,
  detectVariablesPage,
  importVariablesToPage,
  readPageVariables,
} from '../src/content/gitlabDom'
import { mountGitlabVariablesPage } from './helpers/gitlabDomFixture'

afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('detectVariablesPage / readPageVariables', () => {
  it('retorna página não pronta sem seção do GitLab', () => {
    expect(detectVariablesPage()).toEqual({ ready: false, variables: [] })
  })

  it('lê variáveis visíveis e ignora linhas marcadas para destruir', () => {
    mountGitlabVariablesPage({
      title: 'grupo/projeto',
      rows: [
        { key: 'API_URL', value: 'https://gitlab.com', protected: true, persisted: true },
        { destroyed: true },
        { empty: true },
      ],
    })

    const page = detectVariablesPage()

    expect(page.ready).toBe(true)
    expect(page.title).toBe('grupo/projeto')
    expect(page.saveEndpoint).toContain('/ci/variables')
    expect(page.variables).toEqual([
      { key: 'API_URL', protected: true, persisted: true },
    ])
    expect(readPageVariables()).toEqual(page.variables)
  })
})

describe('importVariablesToPage', () => {
  it('falha quando a página de variáveis não está aberta', async () => {
    const result = await importVariablesToPage(
      [{ key: 'X', value: '1', protected: false }],
      false,
    )

    expect(result.success).toBe(false)
    expect(result.imported).toBe(0)
    expect(result.failed[0]?.error).toContain('CI/CD')
  })

  it('preenche linha vazia com chave, valor e protected', async () => {
    vi.useFakeTimers()

    mountGitlabVariablesPage({ rows: [{ empty: true }] })

    const promise = importVariablesToPage(
      [{ key: 'DB_HOST', value: 'localhost', protected: true }],
      false,
    )

    await vi.runAllTimersAsync()
    const result = await promise

    expect(result.success).toBe(true)
    expect(result.imported).toBe(1)
    expect(result.failed).toEqual([])

    const keyInput = document.querySelector<HTMLInputElement>('.js-ci-variable-input-key')
    const valueInput = document.querySelector<HTMLTextAreaElement>(
      '.js-ci-variable-input-value',
    )
    const protectedInput = document.querySelector<HTMLInputElement>(
      '.js-ci-variable-input-protected',
    )
    const toggle = document.querySelector<HTMLButtonElement>('.js-project-feature-toggle')

    expect(keyInput?.value).toBe('DB_HOST')
    expect(valueInput?.value).toBe('localhost')
    expect(protectedInput?.value).toBe('true')
    expect(toggle?.classList.contains('is-checked')).toBe(true)
  })

  it('clica em salvar quando auto-save está ligado', async () => {
    vi.useFakeTimers()

    mountGitlabVariablesPage({ rows: [{ empty: true }] })

    const saveBtn = document.querySelector<HTMLButtonElement>('.js-secret-variables-save-button')!
    const clickSpy = vi.spyOn(saveBtn, 'click')

    const promise = importVariablesToPage(
      [{ key: 'TOKEN', value: 'abc', protected: false }],
      true,
    )

    await vi.runAllTimersAsync()
    const result = await promise

    expect(result.success).toBe(true)
    expect(result.saved).toBe(true)
    expect(clickSpy).toHaveBeenCalledOnce()
  })
})

describe('clearPageVariables', () => {
  it('remove só variáveis da aba ativa pelo prefixo', async () => {
    vi.useFakeTimers()

    mountGitlabVariablesPage({
      rows: [
        { key: 'API_KEY', value: '1', persisted: true },
        { key: 'production_API_KEY', value: '2', persisted: true },
      ],
    })

    const removeButtons = [...document.querySelectorAll<HTMLButtonElement>('.js-row-remove-button')]
    const clickSpies = removeButtons.map((btn) => vi.spyOn(btn, 'click'))

    const promise = clearPageVariables(
      {
        isDefault: false,
        prefix: 'production_',
        customPrefixes: ['production_', 'staging_'],
      },
      false,
    )

    await vi.runAllTimersAsync()
    const result = await promise

    expect(result.cleared).toBe(1)
    expect(clickSpies[0]).not.toHaveBeenCalled()
    expect(clickSpies[1]).toHaveBeenCalledOnce()
  })
})
