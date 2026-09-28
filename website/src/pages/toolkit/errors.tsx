import React from 'react'
import ErrorCodesPage from '@site/src/components/ErrorCodesPage'
import errorCodes from '../../../external/redux-toolkit/errors.json'

export default function ToolkitErrors(): React.ReactNode {
  return (
    <ErrorCodesPage
      libraryName="Redux Toolkit"
      description="The official, opinionated, batteries-included toolset for efficient Redux development"
      errorCodes={errorCodes}
    />
  )
}
