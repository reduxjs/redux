import { resolve } from 'path'
import { linkDocblocks, transpileCodeblocks } from 'remark-typescript-tools'
import type { Options, ThemeConfig } from '@docusaurus/preset-classic'
import type { Config } from '@docusaurus/types'
import type { Options as UmamiOptions } from '@dipakparmar/docusaurus-plugin-umami'

const config: Config = {
  title: 'Redux',
  tagline:
    'A JS library for predictable and maintainable global state management',
  url: 'https://redux.js.org',
  baseUrl: '/',
  favicon: 'img/favicon/favicon.ico',
  organizationName: 'reduxjs',
  projectName: 'redux',
  themes: [require.resolve('@getcanary/docusaurus-theme-search-pagefind')],
  themeConfig: {
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4
    },
    image: 'img/redux-logo-landscape.png',
    metadata: [{ name: 'twitter:card', content: 'summary' }],
    prism: {
      theme: require('./src/js/monokaiTheme.js')
    },
    colorMode: {
      disableSwitch: false
    },
    navbar: {
      title: 'Redux',
      logo: {
        alt: 'Redux Logo',
        src: 'img/redux.svg'
      },
      items: [
        {
          label: 'Getting Started',
          to: 'introduction/getting-started',
          position: 'right'
        },
        {
          label: 'Tutorial',
          to: 'tutorials/essentials/part-1-overview-concepts',
          position: 'right'
        },
        {
          label: 'Usage Guide',
          type: 'doc',
          docId: 'usage/index',
          position: 'right'
        },
        {
          label: 'API',
          type: 'doc',
          docId: 'api/api-reference',
          position: 'right'
        },
        { label: 'FAQ', to: 'faq', position: 'right' },
        {
          label: 'Best Practices',
          type: 'doc',
          docId: 'style-guide/style-guide',
          position: 'right'
        },
        {
          label: 'GitHub',
          href: 'https://www.github.com/reduxjs/redux',
          position: 'right'
        },
        {
          label: 'Need help?',
          to: 'introduction/getting-started#help-and-discussion',
          position: 'right'
        }
      ]
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: 'introduction/getting-started'
            },
            { label: 'Usage Guide', type: 'doc', to: 'usage' },
            {
              label: 'Tutorial',
              to: 'tutorials/essentials/part-1-overview-concepts'
            },
            {
              label: 'FAQ',
              to: 'faq'
            },
            {
              label: 'API Reference',
              type: 'doc',
              to: 'api/api-reference'
            }
          ]
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Reactiflux Discord',
              href: 'https://discord.gg/0ZcbPKXt5bZ6au5t'
            },
            {
              label: 'Stack Overflow',
              href: 'http://stackoverflow.com/questions/tagged/redux'
            },
            {
              label: 'Feedback',
              to: 'introduction/getting-started#help-and-discussion'
            }
          ]
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/reduxjs/redux'
            },
            {
              html: `
                <a href="https://www.netlify.com">
                  <img
                    src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg"
                    alt="Deployed by Netlify"
                  />
                </a>
              `
            }
          ]
        }
      ],
      logo: {
        alt: 'Redux Logo',
        src: 'img/redux.svg',
        href: 'https://redux.js.org/'
      },
      copyright: `Copyright © 2015–${new Date().getFullYear()} Dan Abramov and the Redux documentation authors.`
    },
    // algolia: {
    //   appId: 'YUQHC5OCW0',
    //   apiKey: 'ef8f3e604a1e7ed3afa4dbaeeecfa5f2',
    //   indexName: 'redux'
    // }
  } satisfies ThemeConfig,
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: '../docs',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          showLastUpdateTime: true,
          include: [
            '{api,faq,introduction,redux-toolkit,style-guide,tutorials,understanding,usage}/**/*.{md,mdx}',
            'FAQ.md'
          ], // no other way to exclude node_modules
          editUrl: 'https://github.com/reduxjs/redux/edit/master/website',
          remarkPlugins: [
            [
              linkDocblocks,
              {
                extractorSettings: {
                  tsconfig: resolve(__dirname, './tsconfig.json'),
                  basedir: resolve(__dirname, '../src'),
                  rootFiles: ['index.ts']
                }
              }
            ],
            [
              transpileCodeblocks,
              {
                compilerSettings: {
                  tsconfig: resolve(__dirname, './tsconfig.json'),
                  externalResolutions: {},
                  transformVirtualFilepath: (path: string) =>
                    path.replace('/docs/', '/website/')
                }
              }
            ]
          ]
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      } satisfies Options
    ]
  ],
  plugins: [
    [
      '@dipakparmar/docusaurus-plugin-umami',
      {
        websiteID: '4bb3bf09-7460-453f-857d-874d8a361cb6',
        analyticsDomain: 'redux-docs-umami.up.railway.app',
        scriptName: 'script.js',
        dataAutoTrack: true,
        dataDoNotTrack: true,
        dataCache: true
      } satisfies UmamiOptions
    ]
  ]
}

export default config
