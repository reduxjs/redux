import React from 'react'
import LibraryLanding from '@site/src/components/LibraryLanding'

const features = [
  {
    title: 'Official',
    content: (
      <p>
        React Redux is maintained by the Redux team, and{' '}
        <strong>
          kept up-to-date with the latest APIs from Redux and React
        </strong>
        .
      </p>
    )
  },
  {
    title: 'Predictable',
    content: (
      <p>
        <strong>Designed to work with React's component model</strong>. You
        define how to extract the values your component needs from Redux, and
        your component updates automatically as needed.
      </p>
    )
  },
  {
    title: 'Encapsulated',
    content: (
      <p>
        Provides APIs that{' '}
        <strong>
          enable your components to interact with the Redux store
        </strong>
        , so you don't have to write that logic yourself.
      </p>
    )
  },
  {
    title: 'Optimized',
    content: (
      <p>
        Automatically implements{' '}
        <strong>complex performance optimizations</strong>, so that your own
        component only re-renders when the data it needs has actually changed.
      </p>
    )
  }
]

export default function ReactReduxHome(): React.ReactNode {
  return (
    <LibraryLanding
      name="React Redux"
      tagline="Official React bindings for Redux"
      description="Official React bindings for Redux"
      getStartedPath="react-redux/introduction/getting-started"
      features={features}
    />
  )
}
