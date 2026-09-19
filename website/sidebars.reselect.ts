import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

// Ported from reduxjs/reselect `website/sidebars.ts`. Keep in sync until the
// sidebar definition moves into the Reselect repo's docs folder.
const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      collapsed: false,
      label: 'Introduction',
      items: [
        'introduction/getting-started',
        'introduction/how-does-reselect-work',
        'introduction/v5-summary'
      ]
    },
    {
      type: 'category',
      collapsed: false,
      label: 'API',
      items: [
        'api/createSelector',
        'api/createSelectorCreator',
        'api/createStructuredSelector',
        'api/development-only-checks',
        {
          type: 'category',
          collapsed: false,
          label: 'Memoization Functions',
          items: ['api/lruMemoize', 'api/weakMapMemoize']
        }
      ]
    },
    {
      type: 'category',
      label: 'Using Reselect',
      items: [
        'usage/best-practices',
        'usage/common-mistakes',
        'usage/handling-empty-array-results'
      ]
    },
    'FAQ',
    'external-references',
    'related-projects'
  ]
}

export default sidebars
