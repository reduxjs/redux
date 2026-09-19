import { useLocation } from '@docusaurus/router'
import useBaseUrl from '@docusaurus/useBaseUrl'

export interface LibraryEntry {
  readonly label: string
  readonly to: string
  /** Docs plugin `routeBasePath`. Use `/` for the instance mounted at the site root. */
  readonly routeBasePath: string
  /** Navbar items shown on the right when this library's pages are active. */
  readonly navbarItems?: readonly LibraryNavbarItem[]
}

export interface LibraryNavbarItem {
  readonly label: string
  readonly to?: string
  readonly href?: string
  readonly type?: 'doc' | 'docSidebar'
  readonly docId?: string
  readonly sidebarId?: string
  readonly docsPluginId?: string
  readonly activeBaseRegex?: string
}

export function normalizeRouteBasePath(routeBasePath: string): string {
  const trimmed = routeBasePath.replace(/^\/+|\/+$/g, '')
  return trimmed === '' ? '/' : `/${trimmed}/`
}

/**
 * Returns the library whose docs `routeBasePath` prefixes the current URL.
 * The instance mounted at the site root is the fallback for any path no
 * other prefix claims.
 */
export function useCurrentLibrary(
  libraries: readonly LibraryEntry[]
): LibraryEntry {
  const { pathname } = useLocation()
  const baseUrl = useBaseUrl('/')
  const sitePath = pathname.startsWith(baseUrl)
    ? `/${pathname.slice(baseUrl.length)}`
    : pathname

  const match = libraries.find(lib => {
    const prefix = normalizeRouteBasePath(lib.routeBasePath)
    return prefix !== '/' && `${sitePath}/`.startsWith(prefix)
  })
  const root = libraries.find(
    lib => normalizeRouteBasePath(lib.routeBasePath) === '/'
  )
  return match ?? root ?? libraries[0]
}
