import React, { useEffect, useState } from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import styles from './VideoEmbed.module.css'

export type VideoEmbedProps = {
  /** Embed URL for the player iframe */
  src: string
  /** Page to open when the player cannot be embedded */
  href: string
  title: string
  /** Text for the fallback link, e.g. "Watch the lesson on Egghead" */
  linkText: string
}

type Mode = 'pending' | 'plain' | 'credentialless' | 'link'

// Pages with `LiveExample` embeds send Cross-Origin-Embedder-Policy so that
// WebContainers can run. That blocks every cross-origin iframe whose response
// does not itself send COEP. Third-party video players usually do not, so on
// isolated pages the player is loaded as a `credentialless` iframe (Chromium
// only): it gets an empty cookie jar and is exempt from the COEP check. If the
// browser has neither, a link replaces the player.
function detectMode(): Mode {
  if (!window.crossOriginIsolated) return 'plain'
  if ('credentialless' in HTMLIFrameElement.prototype) return 'credentialless'
  return 'link'
}

const credentiallessAttr = { credentialless: '' }

function Player({ src, href, title, linkText }: VideoEmbedProps) {
  const [mode, setMode] = useState<Mode>('pending')

  useEffect(() => {
    setMode(detectMode())
  }, [])

  if (mode === 'pending') return <div className={styles.aspect} />

  if (mode === 'link') {
    return (
      <p className={styles.fallback}>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {linkText}
        </a>
      </p>
    )
  }

  return (
    <div className={styles.aspect}>
      <iframe
        className={styles.frame}
        src={src}
        title={title}
        allow="fullscreen"
        loading="lazy"
        {...(mode === 'credentialless' ? credentiallessAttr : {})}
      />
    </div>
  )
}

export function VideoEmbed(props: VideoEmbedProps) {
  return <BrowserOnly>{() => <Player {...props} />}</BrowserOnly>
}
