import React from 'react'
import LibraryLanding from '@site/src/components/LibraryLanding'

const features = [
  {
    title: 'Predictable',
    content: (
      <p>
        Like Redux, Reselect gives users a consistent mental model for
        memoizing functions. Extract input values, recalculate when any input
        changes.
      </p>
    )
  },
  {
    title: 'Optimized',
    content: (
      <p>
        Reselect minimizes the number of times expensive computations are
        performed, reuses existing result references if nothing has changed,
        and improves performance.
      </p>
    )
  },
  {
    title: 'Customizable',
    content: (
      <p>
        Reselect comes with fast defaults, but provides flexible customization
        options. Swap memoization methods, change equality checks, and
        customize for your needs.
      </p>
    )
  },
  {
    title: 'Type-Safe',
    content: (
      <p>
        Reselect is designed for great TypeScript support. Generated selectors
        infer all types from input selectors.
      </p>
    )
  }
]

export default function ReselectHome(): React.ReactNode {
  return (
    <LibraryLanding
      name="Reselect"
      tagline="A memoized selector library for Redux"
      description="A memoized selector library for Redux"
      getStartedPath="reselect/introduction/getting-started"
      features={features}
    />
  )
}
