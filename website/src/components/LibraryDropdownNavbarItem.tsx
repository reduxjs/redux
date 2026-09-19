import React from 'react'
import { useLocation } from '@docusaurus/router'
import useBaseUrl from '@docusaurus/useBaseUrl'
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem'
import type { Props as DropdownProps } from '@theme/NavbarItem/DropdownNavbarItem'

export interface LibraryEntry {
  readonly label: string
  readonly to: string
  /** Docs plugin `routeBasePath`. Use `/` for the instance mounted at the site root. */
  readonly routeBasePath: string
}

export interface Props extends Omit<DropdownProps, 'items' | 'label' | 'html'> {
  readonly libraries: readonly LibraryEntry[]
}

function normalize(routeBasePath: string): string {
  const trimmed = routeBasePath.replace(/^\/+|\/+$/g, '')
  return trimmed === '' ? '/' : `/${trimmed}/`
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Navbar dropdown that lists every docs instance and shows which one the
 * current page belongs to. Instances are matched by URL prefix; the root
 * instance is the fallback for any path no other prefix claims.
 */
export default function LibraryDropdownNavbarItem({
  libraries,
  ...props
}: Props): React.ReactNode {
  const { pathname } = useLocation()
  const baseUrl = useBaseUrl('/')
  const sitePath = pathname.startsWith(baseUrl)
    ? `/${pathname.slice(baseUrl.length)}`
    : pathname

  const prefixed = libraries
    .map(lib => ({ lib, prefix: normalize(lib.routeBasePath) }))
    .filter(({ prefix }) => prefix !== '/')
  const root = libraries.find(lib => normalize(lib.routeBasePath) === '/')

  const match = prefixed.find(({ prefix }) =>
    `${sitePath}/`.startsWith(prefix)
  )
  const current = match?.lib ?? root ?? libraries[0]

  const otherPrefixes = prefixed
    .map(({ prefix }) => escapeRegex(prefix.slice(1, -1)))
    .join('|')

  const items = libraries.map(lib => {
    const prefix = normalize(lib.routeBasePath)
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
