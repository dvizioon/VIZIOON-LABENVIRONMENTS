export function mountGitlabVariablesPage(options?: {
  title?: string
  saveEndpoint?: string
  rows?: Array<{
    key?: string
    value?: string
    protected?: boolean
    persisted?: boolean
    destroyed?: boolean
    empty?: boolean
  }>
  saveDisabled?: boolean
}) {
  const title = options?.title ?? 'meu-projeto'
  const saveEndpoint = options?.saveEndpoint ?? '/group/project/-/ci/variables'
  const rows = options?.rows ?? [{ empty: true }]
  const saveDisabled = options?.saveDisabled ?? false

  const rowsHtml = rows
    .map((row) => {
      if (row.destroyed) {
        return `
          <li class="ci-variable-row" data-is-persisted="true">
            <input class="js-ci-variable-input-key" value="OLD_KEY" />
            <input class="js-ci-variable-input-destroy" value="true" />
          </li>
        `
      }

      if (row.empty) {
        return `
          <li class="ci-variable-row" data-is-persisted="false">
            <input class="js-ci-variable-input-key" value="" />
            <div class="js-secret-value-placeholder"></div>
            <textarea class="js-ci-variable-input-value js-secret-value hide"></textarea>
            <button type="button" class="js-project-feature-toggle"></button>
            <input class="js-ci-variable-input-protected" value="false" />
            <input class="js-ci-variable-input-destroy" value="false" />
          </li>
        `
      }

      const protectedClass = row.protected ? 'is-checked' : ''
      const protectedValue = row.protected ? 'true' : 'false'

      return `
        <li class="ci-variable-row" data-is-persisted="${row.persisted ? 'true' : 'false'}">
          <input class="js-ci-variable-input-key" value="${row.key ?? ''}" />
          <div class="js-secret-value-placeholder hide"></div>
          <textarea class="js-ci-variable-input-value js-secret-value">${row.value ?? ''}</textarea>
          <button type="button" class="js-project-feature-toggle ${protectedClass}"></button>
          <input class="js-ci-variable-input-protected" value="${protectedValue}" />
          <input class="js-ci-variable-input-destroy" value="false" />
          <button type="button" class="js-row-remove-button">Remover</button>
        </li>
      `
    })
    .join('')

  document.body.innerHTML = `
    <div class="sidebar-context-title">${title}</div>
    <section
      id="secret-variables"
      class="js-ci-variable-list-section"
      data-save-endpoint="${saveEndpoint}"
    >
      <ul class="ci-variable-list">
        ${rowsHtml}
      </ul>
      <button
        type="button"
        class="js-secret-variables-save-button"
        ${saveDisabled ? 'disabled' : ''}
      >
        Salvar
      </button>
    </section>
  `
}
