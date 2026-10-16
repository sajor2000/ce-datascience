// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Methodsmith',
  tagline: 'Rigorous methods for statistics, machine learning, and meta-analysis, from question to paper. Every study compounds.',
  favicon: 'brand/favicon.ico',
  url: 'https://sajor2000.github.io',
  baseUrl: '/methodsmith/',
  organizationName: 'sajor2000',
  projectName: 'methodsmith',
  trailingSlash: false,
  headTags: [
    {tagName: 'link', attributes: {rel: 'icon', type: 'image/svg+xml', href: '/methodsmith/brand/favicon.svg'}},
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', href: '/methodsmith/brand/apple-touch-icon.png'}},
    {tagName: 'meta', attributes: {name: 'theme-color', content: '#1B1F27'}},
  ],
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
      image: 'brand/social-preview.png',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Methodsmith',
        logo: {
          alt: 'Methodsmith logo',
          src: 'brand/mark-light.svg',
          srcDark: 'brand/mark-dark.svg',
          width: 30,
          height: 30,
        },
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
        copyright: `Copyright © ${new Date().getFullYear()} Juan Carlos Rojas. MIT licensed. Built on Every's Compound Engineering.`,
      },
    }),
};

export default config;
