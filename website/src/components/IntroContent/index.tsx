import IntroHero from '@site/src/components/IntroHero'
import FeatureCards from '@site/src/components/FeatureCards'
import DocQuickLinks from '@site/src/components/DocQuickLinks'
import Screenshot from '@site/src/components/Screenshot'

export default function IntroContent() {
  return (
    <div className="intro-content">
      <IntroHero />

      <section className="intro-section">
        <h2 className="intro-section__title">O que você pode fazer</h2>
        <FeatureCards />
      </section>

      <Screenshot
        file="gitlab-variables-pagina.png"
        alt="Página GitLab CI/CD Variables com botão flutuante VIZIOON"
        caption="O botão flutuante abre a barra lateral na tela de variáveis."
      />

      <p className="intro-note">
        Funciona em qualquer GitLab em que você já consiga editar as variáveis de CI/CD.
      </p>

      <DocQuickLinks />
    </div>
  )
}
