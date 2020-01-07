import React from 'react'

export const DetailedExplanation = ({ children }) => {
  return (
    <details className="detailed-explanation">
      <summary>
        <h4>Detailed Explanation</h4>
      </summary>
      {children}
    </details>
  )
}
