import { Icon } from '@iconify/react'

type Feature = {
  icon: string
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: 'ph:file-arrow-up-fill',
    title: 'Importar .env',
    description:
      'Arraste o arquivo ou cole o conteúdo. Revise a fila antes de cadastrar no GitLab.',
  },
  {
    icon: 'ph:cloud-fill',
    title: 'Ambientes em abas',
    description:
      'Separe produção, homologação e outros ambientes com prefixo nas variáveis.',
  },
  {
    icon: 'ph:clock-counter-clockwise-fill',
    title: 'Histórico',
    description:
      'Suas importações ficam salvas para reutilizar, exportar ou restaurar depois.',
  },
  {
    icon: 'ph:toggle-right-fill',
    title: 'Botão flutuante',
    description:
      'Ligue ou desligue o botão VIZIOON nas páginas do GitLab pelo popup da extensão.',
  },
]

export default function FeatureCards() {
  return (
    <div className="feature-grid">
      {FEATURES.map((feature) => (
        <article key={feature.title} className="feature-card">
          <span className="feature-card__icon-wrap" aria-hidden>
            <Icon icon={feature.icon} className="feature-card__icon" />
          </span>
          <h3 className="feature-card__title">{feature.title}</h3>
          <p className="feature-card__desc">{feature.description}</p>
        </article>
      ))}
    </div>
  )
}
