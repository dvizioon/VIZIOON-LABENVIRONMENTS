import { belongsToTab } from '@/utils/envPrefix'
import type {
  ClearTabFilter,
  EnvImportItem,
  ImportResult,
  PageContext,
  PageVariable,
} from '@/types/messages'

const ROW_DELAY_MS = 120

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getVariableList(): HTMLUListElement | null {
  return document.querySelector('#secret-variables ul.ci-variable-list')
}

function isRowMarkedDestroy(row: Element): boolean {
  const destroy = row.querySelector<HTMLInputElement>('.js-ci-variable-input-destroy')
  return destroy?.value === 'true' || destroy?.value === '1'
}

function getRowKey(row: Element): string {
  const keyInput = row.querySelector<HTMLInputElement>('.js-ci-variable-input-key')
  if (!keyInput) return ''
  return (keyInput.value || keyInput.defaultValue || keyInput.getAttribute('value') || '').trim()
}

function isRowProtected(row: Element): boolean {
  const toggle = row.querySelector('button.js-project-feature-toggle')
  const input = row.querySelector<HTMLInputElement>('.js-ci-variable-input-protected')
  return toggle?.classList.contains('is-checked') === true || input?.value === 'true'
}

export function readPageVariables(): PageVariable[] {
  const list = getVariableList()
  if (!list) return []

  return [...list.querySelectorAll('li.ci-variable-row')]
    .filter((row) => {
      if (isRowMarkedDestroy(row)) return false
      return !!getRowKey(row)
    })
    .map((row) => ({
      key: getRowKey(row),
      protected: isRowProtected(row),
      persisted: row.getAttribute('data-is-persisted') === 'true',
    }))
    .filter((v) => v.key)
}

export function detectVariablesPage(): PageContext {
  const section = document.querySelector('#secret-variables')
  if (!section) {
    return { ready: false, variables: [] }
  }

  const saveEndpoint =
    document.querySelector('.js-ci-variable-list-section')?.getAttribute('data-save-endpoint') ??
    undefined

  const title =
    document.querySelector('.sidebar-context-title')?.textContent?.trim() ||
    document.querySelector('.breadcrumbs-sub-title a')?.textContent?.trim() ||
    document.querySelector('[data-page]')?.getAttribute('data-group') ||
    undefined

  return {
    ready: true,
    title,
    saveEndpoint,
    variables: readPageVariables(),
  }
}

function getEmptyRows(list: Element): HTMLElement[] {
  return [...list.querySelectorAll('li.ci-variable-row')].filter((row) => {
    if (isRowMarkedDestroy(row)) return false
    const keyInput = row.querySelector<HTMLInputElement>('.js-ci-variable-input-key')
    return !keyInput?.value?.trim()
  }) as HTMLElement[]
}

function setInputValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  el.value = value
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

function revealValueField(row: Element) {
  const placeholder = row.querySelector('.js-secret-value-placeholder')
  const textarea = row.querySelector<HTMLTextAreaElement>(
    '.js-ci-variable-input-value.js-secret-value',
  )

  if (placeholder && !placeholder.classList.contains('hide')) {
    placeholder.classList.add('hide')
  }
  if (textarea) {
    textarea.classList.remove('hide')
  }
}

export function setRowProtected(row: Element, enabled: boolean) {
  const toggle = row.querySelector<HTMLButtonElement>('button.js-project-feature-toggle')
  const input = row.querySelector<HTMLInputElement>('.js-ci-variable-input-protected')

  if (!toggle || !input) {
    throw new Error('Toggle Protected não encontrado na linha')
  }

  const currentlyProtected = isRowProtected(row)
  if (enabled === currentlyProtected) return

  toggle.click()

  if (enabled) {
    toggle.classList.add('is-checked')
    input.value = 'true'
  } else {
    toggle.classList.remove('is-checked')
    input.value = 'false'
  }

  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function fillRow(row: Element, item: EnvImportItem) {
  const keyInput = row.querySelector<HTMLInputElement>('.js-ci-variable-input-key')
  const valueInput = row.querySelector<HTMLTextAreaElement>(
    '.js-ci-variable-input-value.js-secret-value',
  )

  if (!keyInput || !valueInput) {
    throw new Error('Campos da variável não encontrados')
  }

  revealValueField(row)
  setInputValue(keyInput, item.key)
  setInputValue(valueInput, item.value)
  setRowProtected(row, item.protected)
}

async function waitForEmptyRow(list: Element, timeout = 3000): Promise<HTMLElement | null> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const empty = getEmptyRows(list)
    if (empty.length > 0) return empty[0]
    await sleep(50)
  }
  return null
}

async function clickSaveButton(): Promise<boolean> {
  const saveBtn = document.querySelector<HTMLButtonElement>('.js-secret-variables-save-button')
  if (!saveBtn || saveBtn.disabled) return false
  saveBtn.click()
  return true
}

export async function importVariablesToPage(
  items: EnvImportItem[],
  autoSave: boolean,
): Promise<ImportResult> {
  const page = detectVariablesPage()
  if (!page.ready) {
    return {
      success: false,
      imported: 0,
      failed: [{ key: '*', error: 'Abra a página CI/CD → Variables do GitLab' }],
    }
  }

  const list = getVariableList()
  if (!list) {
    return {
      success: false,
      imported: 0,
      failed: [{ key: '*', error: 'Lista de variáveis não encontrada' }],
    }
  }

  const failed: ImportResult['failed'] = []
  let imported = 0

  for (const item of items) {
    const row = await waitForEmptyRow(list)
    if (!row) {
      failed.push({
        key: item.key,
        error: 'Sem linha vazia — recarregue a página',
      })
      continue
    }

    try {
      fillRow(row, item)
      imported++
      await sleep(ROW_DELAY_MS)
    } catch (err) {
      failed.push({
        key: item.key,
        error: err instanceof Error ? err.message : 'Erro ao preencher linha',
      })
    }
  }

  let saved = false
  if (autoSave && imported > 0 && failed.length === 0) {
    saved = await clickSaveButton()
  }

  return { success: failed.length === 0, imported, failed, saved }
}

function rowMatchesTab(key: string, tab: ClearTabFilter): boolean {
  return belongsToTab(key, {
    id: '',
    label: '',
    prefix: tab.prefix,
    isDefault: tab.isDefault,
  }, tab.customPrefixes)
}

async function removeRow(row: Element): Promise<boolean> {
  const isPersisted = row.getAttribute('data-is-persisted') === 'true'
  const destroy = row.querySelector<HTMLInputElement>('.js-ci-variable-input-destroy')

  if (isPersisted && destroy) {
    destroy.value = 'true'
    destroy.dispatchEvent(new Event('input', { bubbles: true }))
    destroy.dispatchEvent(new Event('change', { bubbles: true }))
  }

  const removeBtn = row.querySelector<HTMLButtonElement>('.js-row-remove-button')
  if (removeBtn) {
    removeBtn.click()
    return true
  }

  return isPersisted && destroy?.value === 'true'
}

export async function clearPageVariables(
  tab: ClearTabFilter,
  autoSave = false,
): Promise<{ cleared: number; saved: boolean }> {
  const list = getVariableList()
  if (!list) return { cleared: 0, saved: false }

  const rows = [...list.querySelectorAll('li.ci-variable-row')].filter((row) => {
    if (isRowMarkedDestroy(row)) return false
    const key = getRowKey(row)
    if (!key) return false
    return rowMatchesTab(key, tab)
  })

  let cleared = 0
  for (const row of rows) {
    if (await removeRow(row)) {
      cleared++
      await sleep(80)
    }
  }

  let saved = false
  if (autoSave && cleared > 0) {
    saved = await clickSaveButton()
  }

  return { cleared, saved }
}
