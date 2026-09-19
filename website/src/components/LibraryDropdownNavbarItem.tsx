import React from 'react'
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem'
import type { Props as DropdownProps } from '@theme/NavbarItem/DropdownNavbarItem'
import {
  normalizeRouteBasePath,
  useCurrentLibrary
} from './useCurrentLibrary'
import type { LibraryEntry } from './useCurrentLibrary'

export type { LibraryEntry }

export interface Props extends Omit<DropdownProps, 'items' | 'label' | 'html'> {
  readonly libraries: readonly LibraryEntry[]
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Navbar dropdown that lists every docs instance and shows which one the
 * current page belongs to.
 */
export default function LibraryDropdownNavbarItem({
  libraries,
  ...props
}: Props): React.ReactNode {
  const current = useCurrentLibrary(libraries)

  const otherPrefixes = libraries
    .map(lib => normalizeRouteBasePath(lib.routeBasePath))
    .filter(prefix => prefix !== '/')
    .map(prefix => escapeRegex(prefix.slice(1, -1)))
    .join('|')

  const items = libraries.map(lib => {
    const prefix = normalizeRouteBasePath(lib.routeBasePath)
    const activeBaseRegex =
      prefix === '/'
        ? `^/(?!(${otherPrefixes})(/|$))`
        : `^${escapeRegex(prefix.slice(0, -1))}(/|$)`
    return { label: lib.label, to: lib.to, activeBaseRegex }
  })

  return (
    <DropdownNavbarItem
      {...props}
      className="navbar__library-dropdown"
      html={`<span class="navbar__library-prefix">Library:</span> <span class="navbar__library-name">${current.label}</span>`}
      items={items}
    />
  )
}
