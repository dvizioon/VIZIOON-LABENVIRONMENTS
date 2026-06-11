import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    'instalacao',
    {
      type: 'category',
      label: 'Guia',
      collapsed: false,
      items: [
        'guia/variaveis',
        'guia/ambientes',
        'guia/historico',
        'guia/configuracoes',
        'guia/sobre',
      ],
    },
    'privacidade',
  ],
}

export default sidebars
