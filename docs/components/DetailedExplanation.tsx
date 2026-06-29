import type { FC, PropsWithChildren } from 'react'

export const DetailedExplanation: FC<PropsWithChildren<{ title?: string }>> = ({
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
