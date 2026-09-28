import React from 'react'
import { useLocation } from '@docusaurus/router'
import styles from './ErrorCodesPage.module.css'

export interface ErrorCodesPageProps {
  /** Contents of the library's `errors.json`, keyed by numeric code. */
  readonly errorCodes: Readonly<Record<string, string>>
}

/**
 * Renders a library's production error code table and, when `?code=N` is in
 * the URL, the full text of that error. Used by the core `/errors` and
 * Redux Toolkit `/toolkit/errors` docs pages.
 */
export default function ErrorCodesPage({
  errorCodes
}: ErrorCodesPageProps): React.ReactNode {
  const location = useLocation()
  const errorCode = new URLSearchParams(location.search).get('code')
  const error = errorCode === null ? undefined : errorCodes[errorCode]

  return (
    <React.Fragment>
      {error && (
        <React.Fragment>
          <p>
            <strong>The full text of the error you just encountered is:</strong>
          </p>
          <code className={styles.errorDetails}>{error}</code>
        </React.Fragment>
      )}
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
    </React.Fragment>
  )
}
