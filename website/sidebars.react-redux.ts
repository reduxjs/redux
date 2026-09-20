// Ported from reduxjs/react-redux website/sidebars.ts. Keep in sync until the
// sidebar file moves next to the docs in that repo.
import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Introduction',
      collapsed: false,
      items: [
        'introduction/getting-started',
        'introduction/why-use-react-redux'
      ]
    },
    {
      type: 'category',
      label: 'Tutorials',
      collapsed: false,
      items: [
        {
          type: 'link',
          label: 'Quick Start',
          href: '/tutorials/quick-start'
        }
      ]
    },
    {
      type: 'category',
      label: 'Using React Redux',
      collapsed: false,
      items: [
        'using-react-redux/usage-with-typescript',
        'using-react-redux/accessing-store'
      ]
    },
    {
      type: 'category',
      label: 'API Reference',
      items: ['api/provider', 'api/hooks', 'api/batch']
    },
    {
      type: 'category',
      label: 'Legacy: connect',
      collapsed: true,
      items: [
        'api/connect',
        'using-react-redux/connect-mapstate',
        'using-react-redux/connect-mapdispatch',
        'tutorials/connect'
      ]
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        {
          type: 'link',
          label: 'Troubleshooting',
          href: '/usage/troubleshooting'
        }
      ]
    }
  ]
}

export default sidebars
