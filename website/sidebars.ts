import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    'instalacao',
    'navegadores',
    {
      type: 'category',
      label: 'Guia',
      collapsed: false,
      customProps: { icon: 'ph:map-trifold-fill' },
      items: [
        'guia/variaveis',
        'guia/ambientes',
        'guia/historico',
        'guia/configuracoes',
      ],
    },
    'sobre',
    'versoes',
    'privacidade',
  ],
}

export default sidebars
