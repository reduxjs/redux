import React from 'react'
import classnames from 'classnames'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from '../pages/styles.module.css'

export interface LibraryFeature {
  readonly title: string
  readonly content: React.ReactNode
}

export interface LibraryLandingProps {
  readonly name: string
  readonly tagline: string
  readonly description: string
  readonly getStartedPath: string
  readonly features: readonly LibraryFeature[]
  readonly children?: React.ReactNode
}

/**
 * Landing page for a docs instance mounted under a URL prefix
 * (`/toolkit`, `/react-redux`, `/reselect`). Mirrors the layout of the
 * core `src/pages/index.js` hero and feature row.
 */
export default function LibraryLanding({
  name,
  tagline,
  description,
  getStartedPath,
  features,
  children
}: LibraryLandingProps): React.ReactNode {
  const getStartedUrl = useBaseUrl(getStartedPath)
  return (
    <Layout title={`${name} - ${tagline}`} description={description}>
      <header className={classnames('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{name}</h1>
          <p className="hero__subtitle">{tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={classnames(
                'button button--secondary button--lg',
                styles.getStarted
              )}
              to={getStartedUrl}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.features}>
          <div className={classnames('container', styles.featureBlock)}>
            <div className="row">
              {features.map(({ title, content }) => (
                <div key={title} className={classnames('col', styles.feature)}>
                  <h2 className={`text--center ${styles.featureTitle}`}>
                    {title}
                  </h2>
                  <div className={styles.featureContent}>{content}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {children}
      </main>
    </Layout>
  )
}
