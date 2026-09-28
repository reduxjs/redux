import React from 'react'
import LibraryLanding from '@site/src/components/LibraryLanding'

const features = [
  {
    title: 'Simple',
    content: (
      <p>
        Includes utilities to simplify common use cases like{' '}
        <strong>store setup, creating reducers, immutable update logic</strong>
        , and more.
      </p>
    )
  },
  {
    title: 'Opinionated',
    content: (
      <p>
        Provides <strong>good defaults for store setup out of the box</strong>,
        and includes{' '}
        <strong>the most commonly used Redux addons built-in</strong>.
      </p>
    )
  },
  {
    title: 'Powerful',
    content: (
      <p>
        Takes inspiration from libraries like Immer and Autodux to let you{' '}
        <strong>write "mutative" immutable update logic</strong>, and even{' '}
        <strong>create entire "slices" of state automatically</strong>.
      </p>
    )
  },
  {
    title: 'Effective',
    content: (
      <p>
        Lets you focus on the core logic your app needs, so you can{' '}
        <strong>do more work with less code</strong>.
      </p>
    )
  }
]

export default function ToolkitHome(): React.ReactNode {
  return (
    <LibraryLanding
      name="Redux Toolkit"
      tagline="The official, opinionated, batteries-included toolset for efficient Redux development"
      description="The official, opinionated, batteries-included toolset for efficient Redux development"
      getStartedPath="toolkit/introduction/getting-started"
      features={features}
    />
  )
}
