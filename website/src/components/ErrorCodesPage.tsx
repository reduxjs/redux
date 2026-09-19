import React from 'react'
import Layout from '@theme/Layout'
import { useLocation } from '@docusaurus/router'
import styles from '../pages/styles.module.css'

export interface ErrorCodesPageProps {
  /** Library name used in the page title and intro text. */
  readonly libraryName: string
  readonly description: string
  /** Contents of the library's `errors.json`, keyed by numeric code. */
  readonly errorCodes: Readonly<Record<string, string>>
}

/**
 * Renders a library's production error code table and, when `?code=N` is in
 * the URL, the full text of that error. Used by `/errors` (core) and
 * `/toolkit/errors` (Redux Toolkit).
 */
export default function ErrorCodesPage({
  libraryName,
  description,
  errorCodes
}: ErrorCodesPageProps): React.ReactNode {
  const location = useLocation()
  const errorCode = new URLSearchParams(location.search).get('code')
  const error = errorCode === null ? undefined : errorCodes[errorCode]

  return (
    <Layout
      title={`${libraryName} - Production Error Codes`}
      description={description}
    >
      <main className={styles.mainFull}>
        <h1>Production Error Codes</h1>
        <p>
          When {libraryName} is built and running in production, error text is
          replaced by indexed error codes to save on bundle size. These errors
          will provide a link to this page with more information about the
          error below.
        </p>
        {error && (
          <React.Fragment>
            <p>
              <strong>
                The full text of the error you just encountered is:
              </strong>
            </p>
            <code className={styles.errorDetails}>{error}</code>
          </React.Fragment>
        )}

        <h2>All Error Codes</h2>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(errorCodes).map(([code, message]) => (
              <tr key={code}>
                <td>{code}</td>
                <td>{message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </Layout>
  )
}
