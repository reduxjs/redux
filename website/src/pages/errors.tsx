import React from 'react'
import ErrorCodesPage from '@site/src/components/ErrorCodesPage'
import errorCodes from '../../../errors.json'

export default function Errors(): React.ReactNode {
  return (
    <ErrorCodesPage
      libraryName="Redux"
      description="A JS library for predictable and maintainable global state management"
      errorCodes={errorCodes}
    />
  )
}
