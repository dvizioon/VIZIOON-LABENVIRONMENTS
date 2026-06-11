import useBaseUrl from '@docusaurus/useBaseUrl'
import { Icon } from '@iconify/react'

export default function IntroHero() {
  const logo = useBaseUrl('/img/logo.svg')

  return (
    <div className="intro-hero">
      <img src={logo} alt="" className="intro-hero__watermark" aria-hidden />
      <div className="intro-hero__content">
        <p className="intro-hero__brand">VIZIOON</p>
        <p className="intro-hero__tagline">LAB ENVIRONMENTS</p>
        <p className="intro-hero__desc">
          Extensão para Chrome e Edge que facilita o cadastro de variáveis de ambiente no
          GitLab. Importe seu <code>.env</code>, revise na barra lateral e envie para a
          tela de variáveis do projeto.
        </p>
        <div className="intro-hero__pills">
          <span className="intro-hero__pill">
            <Icon icon="logos:chrome" aria-hidden />
            Chrome
          </span>
          <span className="intro-hero__pill">
            <Icon icon="logos:microsoft-edge" aria-hidden />
            Edge
          </span>
          <span className="intro-hero__pill">
            <Icon icon="ph:gitlab-logo-fill" aria-hidden />
            GitLab
          </span>
        </div>
      </div>
    </div>
  )
}
