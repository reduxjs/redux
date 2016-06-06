# Isolating Redux Subapps

Consider the case of a “big” app that embeds smaller “subapps”:

```js
import React, { Component } from 'react'
import Subapp from './subapp/Root'

class BigApp extends Component {
  render() {
    return (
      <div>
        <Subapp />
        <Subapp />
        <Subapp />
      </div>
    )
  }
}
```

These `<Subapp>`s will be completely independent. They won’t share data or
actions, and won’t see or communicate with each other.

It’s best not to mix this approach with standard Redux reducer composition.
For typical unified web products, stick with reducer composition. For
“product hubs”, “dashboards”, or enterprise software that groups disparate
tools into a unified package, give the subapp approach a try.

The subapp approach is also useful for large teams that are divided by product
or feature verticals. These teams can ship subapps independently or in combination
with an enclosing “app shell”.

Below is a subapp’s root connected component.
As usual, it can render more components, connected or not, as children.
Usually we’d render it in `<Provider>` and be done with it.

```js
class App extends Component { ... }
export default connect(mapStateToProps)(App)
```

However, we don’t have to call `ReactDOM.render(<Provider><App /></Provider>)`
if we’re interested in hiding the fact that the subapp component is a Redux app.

Maybe we want to be able to run multiple instances of it in the same “bigger” app
and keep it as a complete black box, with Redux being an implementation detail.

To hide Redux behind a React API, we can wrap it in a special component that
initializes the store in the constructor:

```js
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import reducer from './reducers'
import App from './App'

class Root extends Component {
  constructor(props) {
    super(props)
    this.store = createStore(reducer)
  }
  
  render() {
    return (
      <Provider store={this.store}>
        <App />
      </Provider>
    )
  }
}
```

This way every instance will be independent.

This pattern is *not* recommended for parts of the same app that share data.
However, it can be useful when the bigger app has zero access to the smaller apps’ internals,
and we’d like to keep the fact that they are implemented with Redux as an implementation detail.
Each component instance will have its own store, so they won’t “know” about each other.

