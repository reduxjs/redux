import { resolve } from 'path'
import {
  linkDocblocks,
  transpileCodeblocks
} from './plugins/remark-typescript-tools/index.js'
import type { Options, ThemeConfig } from '@docusaurus/preset-classic'
import type { Options as DocsOptions } from '@docusaurus/plugin-content-docs'
import type { Config } from '@docusaurus/types'
import type { Options as UmamiOptions } from '@dipakparmar/docusaurus-plugin-umami'
import type { LibraryEntry } from './src/components/useCurrentLibrary'

// One entry per docs plugin instance. Read by the two custom navbar items in
// src/components/ (LibraryDropdownNavbarItem, LibraryLinksNavbarItem), which
// are registered in src/theme/NavbarItem/ComponentTypes.tsx. `navbarItems`
// are the right-hand links shown while that library's pages are active.
const libraries: LibraryEntry[] = [
  {
    label: 'Redux',
    to: 'introduction/getting-started',
    routeBasePath: '/',
    navbarItems: [
      { label: 'Getting Started', to: 'introduction/getting-started' },
      {
        label: 'Tutorial',
        to: 'tutorials/essentials/part-1-overview-concepts'
      },
      { label: 'Usage Guide', type: 'doc', docId: 'usage/index' },
      { label: 'API', type: 'doc', docId: 'api/api-reference' },
      { label: 'FAQ', to: 'faq' },
      { label: 'Best Practices', type: 'doc', docId: 'style-guide/style-guide' },
      { label: 'GitHub', href: 'https://www.github.com/reduxjs/redux' },
      {
        label: 'Need help?',
        to: 'introduction/getting-started#help-and-discussion'
      }
    ]
  },
  {
    label: 'Redux Toolkit',
    to: 'toolkit/introduction/getting-started',
    routeBasePath: 'toolkit',
    navbarItems: [
      { label: 'Getting Started', to: 'toolkit/introduction/getting-started' },
      { label: 'Tutorials', to: 'tutorials/index' },
      { label: 'Usage Guide', to: 'toolkit/usage/usage-guide' },
      { label: 'API', to: 'toolkit/api/configureStore' },
      { label: 'RTK Query', to: 'toolkit/rtk-query/overview' },
      { label: 'GitHub', href: 'https://github.com/reduxjs/redux-toolkit' }
    ]
  },
  {
    label: 'React Redux',
    to: 'react-redux/introduction/getting-started',
    routeBasePath: 'react-redux',
    navbarItems: [
      {
        label: 'Getting Started',
        to: 'react-redux/introduction/getting-started'
      },
      { label: 'Tutorial', to: 'tutorials/quick-start' },
      {
        label: 'Using React Redux',
        to: 'react-redux/using-react-redux/accessing-store'
      },
      { label: 'API', to: 'react-redux/api/hooks' },
      { label: 'GitHub', href: 'https://www.github.com/reduxjs/react-redux' },
      {
        label: 'Need help?',
        to: 'introduction/getting-started#help-and-discussion'
      }
    ]
  },
  {
    label: 'Reselect',
    to: 'reselect/introduction/getting-started',
    routeBasePath: 'reselect',
    navbarItems: [
      { label: 'Getting Started', to: 'reselect/introduction/getting-started' },
      { label: 'Tutorials', to: 'tutorials/index' },
      { label: 'Usage Guide', to: 'usage/deriving-data-selectors' },
      { label: 'API', to: 'reselect/api/createSelector' },
      { label: 'GitHub', href: 'https://www.github.com/reduxjs/reselect' }
    ]
  }
]

const config: Config = {
  title: 'Redux',
  tagline:
    'A JS library for predictable and maintainable global state management',
  url: 'https://redux.js.org',
  baseUrl: '/',
  favicon: 'img/favicon/favicon.ico',
  organizationName: 'reduxjs',
  projectName: 'redux',
  // RTK docs reference /img/usage/... from their own website/static
  staticDirectories: ['static', 'external/redux-toolkit/website/static'],
  headTags: [
    {
      // Rspack (`future.v4.fasterByDefault`) bundles the dynamic
      // `import(path ?? '/pagefind/pagefind.js')` inside @getcanary/web's
      // pagefind provider instead of leaving it as a browser import, so it fails
      // at runtime with MODULE_NOT_FOUND and search shows no results. The
      // provider uses `window.pagefind` when present, so load the module here.
      tagName: 'script',
      attributes: { type: 'module' },
      innerHTML: `import('/pagefind/pagefind.js').then(m => { window.pagefind = m }).catch(() => {})`
    }
  ],
  themes: [
    [
      require.resolve('@getcanary/docusaurus-theme-search-pagefind'),
      {
        // Search tabs match picomatch patterns against `hostname + pathname`
        tabs: [
          { name: 'All', pattern: '**/*' },
          { name: 'Redux', pattern: '!**/{react-redux,toolkit,reselect}/**' },
          { name: 'Redux Toolkit', pattern: '**/toolkit/**' },
          { name: 'React Redux', pattern: '**/react-redux/**' },
          { name: 'Reselect', pattern: '**/reselect/**' }
        ]
      }
    ]
  ],
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
          type: 'custom-libraryDropdown',
          position: 'left',
          libraries
        },
        {
          type: 'custom-libraryLinks',
          position: 'right',
          libraries
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
          title: 'Libraries',
          items: [
            { label: 'Redux', to: '/' },
            {
              label: 'Redux Toolkit',
              to: 'toolkit/introduction/getting-started'
            },
            {
              label: 'React Redux',
              to: 'react-redux/introduction/getting-started'
            },
            { label: 'Reselect', to: 'reselect/introduction/getting-started' }
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
    }
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
            '{api,faq,introduction,style-guide,tutorials,understanding,usage}/**/*.{md,mdx}',
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
      '@docusaurus/plugin-content-docs',
      {
        id: 'react-redux',
        path: 'external/react-redux/docs',
        routeBasePath: 'react-redux',
        sidebarPath: require.resolve('./sidebars.react-redux.ts'),
        include: [
          '{api,introduction,using-react-redux,tutorials}/*.{md,mdx}',
          'troubleshooting.md'
        ],
        editUrl: ({ docPath }) =>
          `https://github.com/reduxjs/react-redux/edit/master/docs/${docPath}`,
        showLastUpdateTime: false
      } satisfies DocsOptions
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'toolkit',
        path: 'external/redux-toolkit/docs',
        routeBasePath: 'toolkit',
        sidebarPath: require.resolve('./sidebars.toolkit.ts'),
        include: [
          '{api,assets,introduction,migrations,rtk-query,tutorials,usage}/**/*.{md,mdx}'
        ],
        editUrl: ({ docPath }) =>
          `https://github.com/reduxjs/redux-toolkit/edit/master/docs/${docPath}`,
        showLastUpdateTime: false,
        remarkPlugins: [
          [
            linkDocblocks,
            {
              extractorSettings: {
                tsconfig: resolve(
                  __dirname,
                  'external/redux-toolkit/docs/tsconfig.json'
                ),
                basedir: resolve(
                  __dirname,
                  'external/redux-toolkit/packages/toolkit/src'
                ),
                rootFiles: [
                  'index.ts',
                  'query/index.ts',
                  'query/createApi.ts',
                  'query/endpointDefinitions.ts',
                  'query/react/index.ts',
                  'query/react/ApiProvider.tsx',
                  'query/core/buildMiddleware/cacheCollection.ts'
                ]
              }
            }
          ],
          [
            transpileCodeblocks,
            {
              compilerSettings: {
                // RTK's own tsconfig. Its `paths` point at the unbuilt
                // `packages/toolkit/dist`, so TypeScript falls back to
                // normal resolution and finds `@reduxjs/toolkit` (and the
                // docs' other devDependencies) in this site's node_modules.
                tsconfig: resolve(
                  __dirname,
                  'external/redux-toolkit/docs/tsconfig.json'
                ),
                externalResolutions: {}
              }
            }
          ]
        ]
      } satisfies DocsOptions
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'reselect',
        path: 'external/reselect/website/docs',
        routeBasePath: 'reselect',
        sidebarPath: require.resolve('./sidebars.reselect.ts'),
        editUrl: ({ docPath }) =>
          `https://github.com/reduxjs/reselect/edit/master/website/docs/${docPath}`,
        showLastUpdateTime: false
      } satisfies DocsOptions
    ],
    // Reselect's docs import shared components as `@site/src/components/*`,
    // which resolves against this site. Point those specifiers at the fetched
    // Reselect copies instead. The resolver stops at the first matching alias
    // key and Docusaurus registers `@site` itself, so these exact-match keys
    // have to come before it; mutating the existing alias map is the only way
    // to control that order.
    function reselectComponentAliases() {
      const components = resolve(
        __dirname,
        'external/reselect/website/src/components'
      )
      const aliases = Object.fromEntries(
        ['InternalLinks', 'ExternalLinks', 'PackageManagerTabs'].map(name => [
          `@site/src/components/${name}$`,
          resolve(components, `${name}.tsx`)
        ])
      )
      return {
        name: 'reselect-component-aliases',
        configureWebpack: config => {
          config.resolve ??= {}
          config.resolve.alias = { ...aliases, ...config.resolve.alias }
          return {}
        }
      }
    },
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
  ],
  future: {
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
      fasterByDefault: true
    }
  }
}

export default config
