// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CE DataScience',
  tagline: 'A practical AI research partner for health and biomedical data',
  url: 'https://sajor2000.github.io',
  baseUrl: '/ce-datascience/',
  organizationName: 'sajor2000',
  projectName: 'ce-datascience',
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
          include: ['setup.md'],
          routeBasePath: 'docs',
          sidebarPath: false,
          editUrl: ({docPath}) =>
            `https://github.com/sajor2000/ce-datascience/edit/main/docs/${docPath}`,
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
        title: 'CE DataScience',
        items: [
          {to: '/docs/setup', label: 'Setup guide', position: 'left'},
          {
            href: 'https://github.com/sajor2000/ce-datascience/blob/main/plugins/ce-datascience/README.md',
            label: 'Skills and agents',
            position: 'left',
          },
          {
            href: 'https://github.com/sajor2000/ce-datascience',
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
              {
                label: 'Skills and agents',
                href: 'https://github.com/sajor2000/ce-datascience/blob/main/plugins/ce-datascience/README.md',
              },
            ],
          },
          {
            title: 'Project',
            items: [
              {
                label: 'GitHub repository',
                href: 'https://github.com/sajor2000/ce-datascience',
              },
              {
                label: 'Report an issue',
                href: 'https://github.com/sajor2000/ce-datascience/issues',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} CE DataScience. Built with Docusaurus.`,
      },
    }),
};

export default config;
