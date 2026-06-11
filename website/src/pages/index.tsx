import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import Heading from '@theme/Heading'
import FeatureCards from '@site/src/components/FeatureCards'

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
        <FeatureCards />
      </main>
    </Layout>
  )
}
