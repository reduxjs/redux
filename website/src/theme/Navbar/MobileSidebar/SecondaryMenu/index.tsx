import React, { type ReactNode } from 'react'
import SecondaryMenu from '@theme-original/Navbar/MobileSidebar/SecondaryMenu'
import type SecondaryMenuType from '@theme/Navbar/MobileSidebar/SecondaryMenu'
import type { WrapperProps } from '@docusaurus/types'
import Link from '@docusaurus/Link'
import useBaseUrl from '@docusaurus/useBaseUrl'
import {
  useCurrentLibrary,
  useLibraries
} from '@site/src/components/useCurrentLibrary'

type Props = WrapperProps<typeof SecondaryMenuType>

/**
 * The mobile sidebar opens straight into the docs sidebar on doc pages, so
 * name the library above it; the library dropdown only lives in the primary
 * menu behind "Back to main menu".
 */
export default function SecondaryMenuWrapper(props: Props): ReactNode {
  const libraries = useLibraries()
  const current = useCurrentLibrary(libraries)
  const currentUrl = useBaseUrl(current?.to)
  return (
    <>
      {libraries.length > 0 && (
        <Link className="navbar-sidebar__library" to={currentUrl}>
          <span className="navbar__library-prefix">Library:</span>{' '}
          <span className="navbar__library-name">{current.label}</span>
        </Link>
      )}
      <SecondaryMenu {...props} />
    </>
  )
}
