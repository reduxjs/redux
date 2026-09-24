import { existsSync, readdirSync } from 'fs'
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

// "Edit this page" links for library docs target the branch that
// scripts/fetch-external-docs.mts cloned (DOCS_REF_<NAME>, default master).
function libraryEditUrl(repo: string) {
  const ref =
    process.env[`DOCS_REF_${repo.toUpperCase().replaceAll('-', '_')}`] ??
    'master'
  return ({ docPath }: { docPath: string }) =>
    `https://github.com/reduxjs/${repo}/edit/${ref}/docs/${docPath}`
}

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
        // Search tabs match picomatch patterns against `hostname + pathname`.
        // The leading `*` is the hostname only, so core pages like
        // `/faq/react-redux` stay in the Redux tab.
        tabs: [
          { name: 'All', pattern: '**/*' },
          { name: 'Redux', pattern: '!*/{react-redux,toolkit,reselect}/**' },
          { name: 'Redux Toolkit', pattern: '*/toolkit/**' },
          { name: 'React Redux', pattern: '*/react-redux/**' },
          { name: 'Reselect', pattern: '*/reselect/**' }
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
        sidebarPath: resolve(__dirname, 'external/react-redux/docs/sidebars.ts'),
        include: ['{api,introduction,using-react-redux,tutorials}/*.{md,mdx}'],
        editUrl: libraryEditUrl('react-redux'),
        showLastUpdateTime: false
      } satisfies DocsOptions
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'toolkit',
        path: 'external/redux-toolkit/docs',
        routeBasePath: 'toolkit',
        sidebarPath: resolve(
          __dirname,
          'external/redux-toolkit/docs/sidebars.ts'
        ),
        include: [
          '{api,assets,introduction,migrations,rtk-query,tutorials,usage}/**/*.{md,mdx}'
        ],
        editUrl: libraryEditUrl('redux-toolkit'),
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
                // RTK's own tsconfig. Its `paths` point at
                // `packages/toolkit/dist`, which only exists when an RTK
                // preview build links its freshly built package there (see
                // `optionalLinks` in scripts/fetch-external-docs.mts).
                // Otherwise TypeScript falls back to normal resolution and
                // finds the published `@reduxjs/toolkit` (and the docs'
                // other devDependencies) in this site's node_modules.
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
        path: 'external/reselect/docs',
        routeBasePath: 'reselect',
        sidebarPath: resolve(__dirname, 'external/reselect/docs/sidebars.ts'),
        // README.md is the contributor guide for this folder, not a page
        exclude: ['README.md'],
        editUrl: libraryEditUrl('reselect'),
        showLastUpdateTime: false
      } satisfies DocsOptions
    ],
    // The persistent build cache keys each page on its own contents, so a
    // cached RTK page would skip re-checking its code blocks after only the
    // RTK types changed. Make every RTK .mdx page depend on the type
    // declarations its code blocks compile against.
    function toolkitTypesDependency() {
      const linkedDist = resolve(
        __dirname,
        'external/redux-toolkit/packages/toolkit/dist'
      )
      const typesDir = existsSync(linkedDist)
        ? linkedDist
        : resolve(__dirname, 'node_modules/@reduxjs/toolkit/dist')
      const files = [
        resolve(__dirname, 'external/redux-toolkit/docs/tsconfig.json'),
        ...readdirSync(typesDir, { recursive: true, encoding: 'utf8' })
          .filter(file => /\.d\.m?ts$/.test(file))
          .map(file => resolve(typesDir, file))
      ]
      return {
        name: 'toolkit-types-dependency',
        configureWebpack: () => ({
          module: {
            rules: [
              {
                test: /\.mdx$/,
                include: resolve(__dirname, 'external/redux-toolkit/docs'),
                enforce: 'pre',
                use: [
                  {
                    loader: require.resolve(
                      './plugins/toolkit-types-dependency.cjs'
                    ),
                    options: { files }
                  }
                ]
              }
            ]
          }
        })
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
