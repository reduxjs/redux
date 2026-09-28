import React from 'react'
import NavbarItem from '@theme/NavbarItem'
import type { Props as NavbarItemProps } from '@theme/NavbarItem'
import { useCurrentLibrary } from './useCurrentLibrary'
import type { LibraryEntry } from './useCurrentLibrary'

export interface Props {
  readonly libraries: readonly LibraryEntry[]
  readonly position?: 'left' | 'right'
  readonly mobile?: boolean
}

/**
 * Renders the `navbarItems` of whichever library owns the current URL, so
 * the right-hand navbar links (Getting Started, API, ...) switch along with
 * the library dropdown.
 */
export default function LibraryLinksNavbarItem({
  libraries,
  position,
  mobile
}: Props): React.ReactNode {
  const current = useCurrentLibrary(libraries)
  const items = current.navbarItems ?? []
  return (
    <>
      {items.map((item, idx) => (
        <NavbarItem
          key={`${current.routeBasePath}-${idx}`}
          {...(item as NavbarItemProps)}
          position={position}
          mobile={mobile}
        />
      ))}
    </>
  )
}
