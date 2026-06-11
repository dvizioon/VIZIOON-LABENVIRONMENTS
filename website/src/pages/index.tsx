import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import Heading from '@theme/Heading'

export default function Home() {
  const { siteConfig } = useDocusaurusContext()

  return (
    <Layout title="Início" description={siteConfig.tagline}>
      <header className="hero hero--vizioon">
        <div className="container">
          <Heading as="h1" className="hero__title">
            VIZIOON LAB ENVIRONMENTS
          </Heading>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className="margin-top--lg">
            <Link className="button button--secondary button--lg" to="/docs/intro">
              Ver documentação
            </Link>
          </div>
        </div>
      </header>
      <main className="container margin-vert--xl">
        <div className="row">
          <div className="col col--4">
            <h3>Importar .env</h3>
            <p>
              Arraste o arquivo ou cole o conteúdo. Revise a lista e cadastre no GitLab
              com um clique.
            </p>
          </div>
          <div className="col col--4">
            <h3>Ambientes em abas</h3>
            <p>
              Separe produção, homologação e outros ambientes. Cada aba organiza as
              variáveis do seu jeito.
            </p>
          </div>
          <div className="col col--4">
            <h3>Histórico</h3>
            <p>
              Suas importações ficam salvas para reutilizar depois, exportar ou
              restaurar quando precisar.
            </p>
          </div>
        </div>
      </main>
    </Layout>
  )
}
