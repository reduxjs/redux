# Usage with React Router

So you want to do routing with your Redux app. You can use it with [React Router](https://github.com/reactjs/react-router). Redux will be the source of truth for your data and React Router will be the source of truth for your URL. In most of the cases, **it is fine** to have them separate unless you need to time travel and rewind actions that trigger a URL change.

## Installing React Router
`react-router-dom` is available on npm . This guides assumes you are using `react-router-dom@^4.1.1`.

`npm install --save react-router-dom`

## Configuring the Fallback URL

Before integrating React Router, we need to configure our development server. Indeed, our development server may be unaware of the declared routes in React Router configuration. For example, if you access `/todos` and refresh, your development server needs to be instructed to serve `index.html` because it is a single-page app. Here's how to enable this with popular development servers.

>### Note on Create React App

> If you are using Create React App, you won't need to configure a fallback URL, it is automatically done.

### Configuring Express
If you are serving your `index.html` from Express:
```js
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})
```

### Configuring WebpackDevServer
If you are serving your `index.html` from WebpackDevServer:
You can add to your webpack.config.dev.js:
```js
devServer: {
  historyApiFallback: true
}
```

## Connecting React Router with Redux App

Along this chapter, we will be using the [Todos](https://github.com/reactjs/redux/tree/master/examples/todos) example. We recommend you to clone it while reading this chapter.

First we will need to import `<Router />` and `<Route />` from React Router. Here's how to do it:

```js
import { BrowserRouter as Router, Route } from 'react-router-dom'
```

In a React app, usually you would wrap `<Route />` in `<Router />` so that when the URL changes, `<Router />` will match a branch of its routes, and render their configured components. `<Route />` is used to declaratively map routes to your application's component hierarchy. You would declare in `path` the path used in the URL and in `component` the single component to be rendered when the route matches the URL.

```js
const Root = () => (
  <Router>
    <Route path="/" component={App} />
  </Router>
)
```

However, in our Redux App we will still need `<Provider />`. `<Provider />` is the higher-order component provided by React Redux that lets you bind Redux to React (see [Usage with React](../basics/UsageWithReact.md)).

We will then import the `<Provider />` from React Redux:

```js
import { Provider } from 'react-redux'
```

We will wrap `<Router />` in `<Provider />` so that route handlers can get [access to the `store`](http://redux.js.org/docs/basics/UsageWithReact.html#passing-the-store).

```js
const Root = ({ store }) => (
  <Provider store={store}>
    <Router>
      <Route path="/" component={App} />
    </Router>
  </Provider>
)
```

Now the `<App />` component will be rendered if the URL matches '/'. Additionally, we will add the optional `:filter?` parameter to `/`, because we will need it further on when we try to read the parameter `:filter` from the URL.

```js
<Route path="/:filter?" component={App} />
```

#### `components/Root.js`
```js
import React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import App from './App'

const Root = ({ store }) => (
  <Provider store={store}>
    <Router>
      <Route path="/:filter?" component={App} />
    </Router>
  </Provider>
)

Root.propTypes = {
  store: PropTypes.object.isRequired
}

export default Root
```

We will also need to refactor `index.js` to render the `<Root />` component to the DOM.

#### `index.js`
```js
import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import todoApp from './reducers'
import Root from './components/Root'

let store = createStore(todoApp)

render(
  <Root store={store} />,
  document.getElementById('root')
)
```

## Navigating with React Router

React Router comes with a [`<Link />`](https://github.com/ReactTraining/react-router/blob/v3/docs/API.md#link) component that lets you navigate around your application. If you want to add some styles, `react-router-dom` has another special `<Link />` called [`<NavLink />`](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/NavLink.md), which accepts styling props. For instance, the `activeStyle` property lets us apply a style on the active state.

In our example, we can wrap `<NavLink />` with a new container component `<FilterLink />` so as to dynamically change the URL.


#### `containers/FilterLink.js`
```js
import React from 'react'
import { NavLink } from 'react-router-dom'

const FilterLink = ({ filter, children }) => (
  <NavLink
    to={filter === 'SHOW_ALL' ? '/' : `/${ filter }`}
    activeStyle={ {
      textDecoration: 'none',
      color: 'black'
    }}
  >
    {children}
  </NavLink>
)

export default FilterLink
```

#### `components/Footer.js`
```js
import React from 'react'
import FilterLink from '../containers/FilterLink'
import { VisibilityFilters } from '../actions'

const Footer = () => (
  <p>
    Show:
    {' '}
    <FilterLink filter={VisibilityFilters.SHOW_ALL}>
      All
    </FilterLink>
    {', '}
    <FilterLink filter={VisibilityFilters.SHOW_ACTIVE}>
      Active
    </FilterLink>
    {', '}
    <FilterLink filter={VisibilityFilters.SHOW_COMPLETED}>
      Completed
    </FilterLink>
  </p>
)

export default Footer
```

Now if you click on `<FilterLink />` you will see that your URL will change between `'/SHOW_COMPLETED'`, `'/SHOW_ACTIVE'`, and `'/'`. Even if you are going back with your browser, it will use your browser's history and effectively go to your previous URL.

## Reading From the URL

Currently, the todo list is not filtered even after the URL changed. This is because we are filtering from `<VisibleTodoList />`'s `mapStateToProps()`, which is still bound to the `state` and not to the URL. `mapStateToProps` has an optional second argument `ownProps` that is an object with every props passed to `<VisibleTodoList />`
#### `containers/VisibleTodoList.js`
```js
const mapStateToProps = (state, ownProps) => {
  return {
    todos: getVisibleTodos(state.todos, ownProps.filter) // previously was getVisibleTodos(state.todos, state.visibilityFilter)
  }
}
```

Right now we are not passing anything to `<App />` so `ownProps` is an empty object. To filter our todos according to the URL, we want to pass the URL params to `<VisibleTodoList />`.

When previously we wrote:  `<Route path="/:filter?" component={App} />`, it made available inside `App` a `params` property.

`params` property is an object with every param specified in the url with the `match` object. *e.g: `match.params` will be equal to `{ filter: 'SHOW_COMPLETED' }` if we are navigating to `localhost:3000/SHOW_COMPLETED`. We can now read the URL from `<App />`.*

Note that we are using [ES6 destructuring](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) on the properties to pass in `params` to `<VisibleTodoList />`.

#### `components/App.js`
```js
const App = ({ match: { params } }) => {
  return (
    <div>
      <AddTodo />
      <VisibleTodoList filter={params.filter || 'SHOW_ALL'} />
      <Footer />
    </div>
  )
}
```

## Next Steps

Now that you know how to do basic routing, you can learn more about [React Router API](https://reacttraining.com/react-router/)

>##### Note About Other Routing Libraries

>*Redux Router* is an experimental library, it lets you keep entirely the state of your URL inside your redux store. It has the same API with React Router API but has a smaller community support than react-router.

>*React Router Redux* creates a binding between your redux app and react-router and it keeps them in sync. Without this binding, you will not be able to rewind the actions with Time Travel. Unless you need this, React Router and Redux can operate completely apart.
