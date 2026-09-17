---
id: isolating-redux-sub-apps
title: Isolating Redux Sub-Apps
---

# Isolating Redux Sub-Apps

Consider the case of a “big” app (contained in a `<BigApp>` component)
that embeds smaller “sub-apps” (contained in `<SubApp>` components):

```js
import SubApp from './subapp'

function BigApp() {
  return (
    <div>
      <SubApp />
      <SubApp />
      <SubApp />
    </div>
  )
}
```

These `<SubApp>`s will be completely independent. They won't share data or
actions, and won't see or communicate with each other.

It's best not to mix this approach with standard Redux reducer composition.
For typical web apps, stick with reducer composition. For
“product hubs”, “dashboards”, or enterprise software that groups disparate
tools into a unified package, give the sub-app approach a try.

The sub-app approach is also useful for large teams that are divided by product
or feature verticals. These teams can ship sub-apps independently or in combination
with an enclosing “app shell”.

Below is a sub-app's root component. As usual, it reads from the store with
`useSelector` and can render more components that do the same as children.
Usually we'd render it inside `<Provider>` at the top of the app and be done with it.

```js
import { useSelector } from 'react-redux'

export default function App() {
  const items = useSelector(state => state.items)
  // ...
}
```

However, we don't have to render `<Provider><App /></Provider>` at the root
if we're interested in hiding the fact that the sub-app component is a Redux app.

Maybe we want to be able to run multiple instances of it in the same “bigger” app
and keep it as a complete black box, with Redux being an implementation detail.

To hide Redux behind a React API, we can wrap it in a component that creates
its own store once, when it first renders:

```js
import { useState } from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import reducer from './reducers'
import App from './App'

export default function SubApp() {
  const [store] = useState(() => configureStore({ reducer }))

  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}
```

The `useState` initializer runs only on the first render, so each `<SubApp>`
instance gets exactly one store for its lifetime. The
[Next.js setup guide](./nextjs.mdx#initial-setup) does the same thing in its
`StoreProvider` component, using a `useRef` that is filled on first render.

This way every instance will be independent.

This pattern is _not_ recommended for parts of the same app that share data.
However, it can be useful when the bigger app has zero access to the smaller apps' internals,
and we'd like to keep the fact that they are implemented with Redux as an implementation detail.
Each component instance will have its own store, so they won't “know” about each other.
