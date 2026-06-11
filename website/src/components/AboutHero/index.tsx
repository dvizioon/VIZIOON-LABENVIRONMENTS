import useBaseUrl from '@docusaurus/useBaseUrl'

const DEVELOPER_EMAIL = 'danielmartinsjob@gmail.com'

export default function AboutHero() {
  const logo = useBaseUrl('/img/logo.svg')

  return (
    <div className="about-hero">
      <img src={logo} alt="" className="about-hero__watermark" aria-hidden />
      <div className="about-hero__content">
        <p className="about-hero__name">VIZIOON</p>
        <p className="about-hero__tagline">LAB ENVIRONMENTS</p>
        <p className="about-hero__desc">
          Cadastre variáveis de ambiente no GitLab a partir do seu arquivo .env.
        </p>
        <span className="about-hero__version">v0.1.0</span>
      </div>

      <div className="about-hero__footer">
        <div className="about-hero__designer">
          <p className="about-hero__designer-label">Desenvolvido por</p>
          <p className="about-hero__designer-name">Daniel Martins</p>
          <a href={`mailto:${DEVELOPER_EMAIL}`}>{DEVELOPER_EMAIL}</a>
        </div>
      </div>
    </div>
  )
}
