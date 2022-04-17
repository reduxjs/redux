module.exports = {
  title: 'Redux',
  tagline: 'A Predictable State Container for JS Apps',
  url: 'https://redux.js.org',
  baseUrl: '/',
  favicon: 'img/favicon/favicon.ico',
  organizationName: 'reduxjs',
  projectName: 'redux',
  themeConfig: {
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
            { label: 'Usage Guide', type: 'doc', to: 'usage/index' },
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
                    alt="Deploys by Netlify"
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
    algolia: {
      appId: 'YUQHC5OCW0',
      apiKey: 'ef8f3e604a1e7ed3afa4dbaeeecfa5f2',
      indexName: 'redux',
      algoliaOptions: {}
    }
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: '../docs',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          showLastUpdateTime: true,
          editUrl: 'https://github.com/reduxjs/redux/edit/master/website'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        },
        googleAnalytics: {
          trackingID: 'UA-130598673-1'
        }
      }
    ]
  ]
}
