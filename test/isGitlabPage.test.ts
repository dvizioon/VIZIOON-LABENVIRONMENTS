import { describe, expect, it } from 'vitest'
import { isCiCdSettingsUrl, isGitlabPage, isGitlabUrl, shouldShowFloatingUi } from '../src/content/isGitlabPage'
import { installTestDom } from './helpers/installTestDom'

installTestDom()

function fakeDoc(html: string, dataPage?: string): Document {
  const doc = document.implementation.createHTMLDocument('test')
  doc.body.innerHTML = html
  if (dataPage) doc.body.setAttribute('data-page', dataPage)
  return doc
}

describe('isGitlabPage', () => {
  it('reconhece gitlab.com e hosts com gitlab', () => {
    expect(isGitlabPage({ hostname: 'gitlab.com' })).toBe(true)
    expect(isGitlabPage({ hostname: 'gitlab.empresa.com' })).toBe(true)
    expect(isGitlabPage({ hostname: 'code.gitlab.internal' })).toBe(true)
  })

  it('não marca sites comuns só pelo hostname', () => {
    expect(
      isGitlabPage({
        hostname: 'github.com',
        document: fakeDoc('<h1>Hello</h1>'),
      }),
    ).toBe(false)
    expect(
      isGitlabPage({
        hostname: 'google.com',
        document: fakeDoc('<div>busca</div>'),
      }),
    ).toBe(false)
  })

  it('reconhece GitLab self-hosted pelos marcadores do DOM', () => {
    const doc = fakeDoc('')
    const meta = doc.createElement('meta')
    meta.setAttribute('property', 'og:site_name')
    meta.setAttribute('content', 'GitLab')
    doc.head.appendChild(meta)
    expect(isGitlabPage({ hostname: 'git.empresa.com', document: doc })).toBe(true)
  })

  it('reconhece GitLab pelo objeto gon', () => {
    expect(
      isGitlabPage({
        hostname: 'git.empresa.com',
        document: fakeDoc('<div></div>'),
        gon: { current_user_id: 1 },
      }),
    ).toBe(true)
  })
})

describe('isGitlabUrl', () => {
  it('reconhece URL do GitLab e rejeita outros sites', () => {
    expect(isGitlabUrl('https://gitlab.com/grupo/projeto')).toBe(true)
    expect(isGitlabUrl('https://gitlab.empresa.com/grupo/projeto')).toBe(true)
    expect(isGitlabUrl('https://github.com/dvizioon/repo')).toBe(false)
    expect(isGitlabUrl('')).toBe(false)
  })
})

describe('isCiCdSettingsUrl', () => {
  it('reconhece a rota de CI/CD mesmo sem gitlab no host', () => {
    expect(
      isCiCdSettingsUrl(
        'http://devops.ceuma.edu.br/nti-ceuma-applications/nexus-rm-mcp/backend/settings/ci_cd',
      ),
    ).toBe(true)
    expect(isCiCdSettingsUrl('https://gitlab.com/grupo/projeto/-/settings/ci_cd')).toBe(true)
    expect(isCiCdSettingsUrl('https://gitlab.com/grupo/projeto/-/settings/ci_cd/')).toBe(true)
    expect(isCiCdSettingsUrl('https://gitlab.com/grupo/projeto/-/ci/variables')).toBe(true)
  })

  it('não reconhece outras rotas do mesmo host', () => {
    expect(isCiCdSettingsUrl('http://devops.ceuma.edu.br/nti-ceuma-applications/nexus-rm-mcp/backend')).toBe(
      false,
    )
    expect(isCiCdSettingsUrl('https://google.com')).toBe(false)
  })
})

describe('shouldShowFloatingUi', () => {
  it('só mostra o botão na rota de CI/CD com o plugin ligado', () => {
    expect(
      shouldShowFloatingUi(true, {
        href: 'http://devops.ceuma.edu.br/nti-ceuma-applications/nexus-rm-mcp/backend/settings/ci_cd',
      }),
    ).toBe(true)
    expect(
      shouldShowFloatingUi(false, {
        href: 'https://gitlab.com/grupo/projeto/-/settings/ci_cd',
      }),
    ).toBe(false)
    expect(
      shouldShowFloatingUi(true, {
        hostname: 'gitlab.com',
        href: 'https://gitlab.com/grupo/projeto',
      }),
    ).toBe(false)
  })
})
