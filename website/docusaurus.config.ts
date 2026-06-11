import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const org = 'dvizioon'
const project = 'VIZIOON-LABENVIRONMENTS'

const config: Config = {
  title: 'VIZIOON LAB ENVIRONMENTS',
  tagline: 'Cadastre variáveis de ambiente no GitLab a partir do seu .env.',
  favicon: 'img/logo.svg',

  future: {
    v4: true,
  },

  url: `https://${org}.github.io`,
  baseUrl: `/${project}/`,
  organizationName: org,
  projectName: project,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'VIZIOON',
      logo: {
        alt: 'VIZIOON LAB ENVIRONMENTS',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Documentação',
        },
        {
          type: 'doc',
          docId: 'versoes',
          position: 'left',
          label: 'Versões',
        },
        {
          href: `https://github.com/${org}/${project}`,
          position: 'right',
          className: 'navbar-github-link',
          'aria-label': 'Repositório no GitHub',
        },
        {
          href: 'mailto:danielmartinsjob@gmail.com',
          position: 'right',
          className: 'navbar-contato-link',
          'aria-label': 'Contato por e-mail',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentação',
          items: [
            { label: 'Começar', to: '/docs/intro' },
            { label: 'Instalação', to: '/docs/instalacao' },
            { label: 'Navegadores', to: '/docs/navegadores' },
            { label: 'Versões', to: '/docs/versoes' },
            { label: 'Privacidade', to: '/docs/privacidade' },
          ],
        },
        {
          title: 'Contato',
          items: [
            {
              label: 'GitHub',
              href: `https://github.com/${org}/${project}`,
            },
            {
              label: 'E-mail',
              href: 'mailto:danielmartinsjob@gmail.com',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} VIZIOON LAB ENVIRONMENTS`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
