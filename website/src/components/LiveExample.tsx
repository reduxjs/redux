import React, { useEffect, useState } from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { useColorMode } from '@docusaurus/theme-common'
import styles from './LiveExample.module.css'

export type LiveExampleProps = {
  /** GitHub repo, e.g. `reduxjs/redux-essentials-example-app` */
  repo: string
  /** Branch or tag name */
  ref: string
  /** Subfolder inside the repo, for monorepos */
  path?: string
  /** File to open in the editor pane, relative to `path` */
  file?: string
  view?: 'preview' | 'editor' | 'both'
  height?: number
  title: string
}

const STACKBLITZ_VIEW = {
  preview: 'preview',
  editor: 'editor',
  both: 'default'
} as const

function buildUrls({ repo, ref, path, file, view = 'both' }: LiveExampleProps) {
  const tree = `${repo}/tree/${ref}${path ? `/${path}` : ''}`
  const embedParams = new URLSearchParams({
    embed: '1',
    ctl: '1',
    corp: '1',
    hideNavigation: '1',
    view: STACKBLITZ_VIEW[view]
  })
  const openParams = new URLSearchParams()
  if (file) {
    embedParams.set('file', file)
    openParams.set('file', file)
  }
  const openQuery = openParams.size ? `?${openParams}` : ''
  return {
    embed: `https://stackblitz.com/github/${tree}?${embedParams}`,
    open: `https://stackblitz.com/github/${tree}${openQuery}`,
    github: `https://github.com/${tree}`
  }
}

function Links({ open, github }: { open: string; github: string }) {
  return (
    <span className={styles.links}>
      <a href={open} target="_blank" rel="noopener noreferrer">
        Open in StackBlitz
      </a>
      <a href={github} target="_blank" rel="noopener noreferrer">
        View source on GitHub
      </a>
    </span>
  )
}

function Embed(props: LiveExampleProps) {
  const { title, height = 500 } = props
  const { colorMode } = useColorMode()
  const urls = buildUrls(props)
  const [isolated, setIsolated] = useState<boolean | null>(null)

  useEffect(() => {
    setIsolated(window.crossOriginIsolated === true)
  }, [])

  const embedSrc = `${urls.embed}&theme=${colorMode}`

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <Links open={urls.open} github={urls.github} />
      </div>
      {isolated ? (
        <iframe
          className={styles.frame}
          src={embedSrc}
          title={title}
          style={{ height }}
          allow="cross-origin-isolated"
          loading="lazy"
        />
      ) : (
        <div className={styles.fallback}>
          {isolated === null ? (
            'Loading live example…'
          ) : (
            <>
              This live preview runs in Chrome, Edge, and other Chromium-based
              browsers. (In Brave, turn Shields off for this site.) Use the
              "Open in StackBlitz" link to run the example in a new tab, or
              browse the source on GitHub.
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function LiveExample(props: LiveExampleProps) {
  return <BrowserOnly>{() => <Embed {...props} />}</BrowserOnly>
}
