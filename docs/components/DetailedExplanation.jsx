import React from 'react'

export const DetailedExplanation = ({
  children,
  title = 'Detailed Explanation'
}) => {
  return (
    <details className="detailed-explanation">
      <summary>
        <h4>{title}</h4>
      </summary>
      {children}
    </details>
  )
}
