// @flow
import React from 'react'

export type Props = {
  active: boolean,
  children?: React$Element<any>,
  onClick: () => void
};

const Link = ({ active, children, onClick }: Props) => {
  if (active) {
    return <span>{children}</span>
  }

  return (
    <a href="#" onClick={e => { // eslint-disable-line jsx-a11y/href-no-hash
        e.preventDefault()
        onClick()
    }}>
      {children}
    </a>
  )
}

export default Link
