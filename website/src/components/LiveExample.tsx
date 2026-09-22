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

// Every StackBlitz frame boots a full WebContainer (a Node runtime in wasm).
// Docusaurus navigates client-side, so all the embeds a reader scrolls past
// share one Chrome renderer process for stackblitz.com; a few boots in a row
// crash it. The container only boots when the reader asks for it.
function Embed(props: LiveExampleProps) {
  const { title, height = 500 } = props
  const { colorMode } = useColorMode()
  const urls = buildUrls(props)
  const [isolated, setIsolated] = useState<boolean | null>(null)
  const [started, setStarted] = useState(false)

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
      {isolated && started ? (
        <iframe
          className={styles.frame}
          src={embedSrc}
          title={title}
          style={{ height }}
          allow="cross-origin-isolated"
        />
      ) : isolated ? (
        <div className={styles.placeholder} style={{ height }}>
          <button
            type="button"
            className="button button--primary button--lg"
            onClick={() => setStarted(true)}
          >
            Run this example
          </button>
          <span className={styles.placeholderNote}>
            Starts a live dev server in your browser. This can take a few
            seconds.
          </span>
        </div>
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
