// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Methodsmith',
  tagline: 'A practical AI research partner for health and biomedical data',
  url: 'https://sajor2000.github.io',
  baseUrl: '/methodsmith/',
  organizationName: 'sajor2000',
  projectName: 'methodsmith',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: '../docs',
          include: ['setup.md', 'guideline-sources.md'],
          routeBasePath: 'docs',
          sidebarPath: false,
          editUrl: ({docPath}) =>
            `https://github.com/sajor2000/methodsmith/edit/main/docs/${docPath}`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Methodsmith',
        items: [
          {to: '/docs/setup', label: 'Setup guide', position: 'left'},
          {to: '/docs/guideline-sources', label: 'Guideline sources', position: 'left'},
          {
            href: 'https://github.com/sajor2000/methodsmith/blob/main/plugins/methodsmith/README.md',
            label: 'Skills and agents',
            position: 'left',
          },
          {
            href: 'https://github.com/sajor2000/methodsmith',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {label: 'Setup guide', to: '/docs/setup'},
              {label: 'Guideline sources', to: '/docs/guideline-sources'},
              {
                label: 'Skills and agents',
                href: 'https://github.com/sajor2000/methodsmith/blob/main/plugins/methodsmith/README.md',
              },
            ],
          },
          {
            title: 'Project',
            items: [
              {
                label: 'GitHub repository',
                href: 'https://github.com/sajor2000/methodsmith',
              },
              {
                label: 'Report an issue',
                href: 'https://github.com/sajor2000/methodsmith/issues',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Methodsmith. Built with Docusaurus.`,
      },
    }),
};

export default config;
