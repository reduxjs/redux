import React from 'react'

const types = ['info', 'success', 'warning', 'error']

export const Note = ({ children, type = 'info' }) => {
  const className = types.includes(type) ? type : 'info'

  return <blockquote className={className}>{children}</blockquote>
}
