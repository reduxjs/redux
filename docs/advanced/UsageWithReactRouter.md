# Usage with React Router

So you want to do routing with your Redux app. You can use it with [React Router](https://github.com/reactjs/react-router). Redux will be the source of truth for your data and React Router will be the source of truth for your URL. In most of the cases, **it is fine** to have them separate unless if you need to time travel and rewind actions that triggers the change URL.

## Installing React Router
`react-router` is available on npm :

`npm install --save react-router`

## Configuring the Fallback URL

Before implementing React Router, we need to configure our development server. Indeed, our development server is not currently aware of the declared routes in React Router. If you refresh your page or try to access directly an URL declared in React Router without having configured your development server, you will get a 404 HTTP error. You will be first requesting a url that the development server is not aware of, instead of asking to React Router. You need to configure a fallback URL, to serve index.html on an unknown URL so that in the front-end, React Router can handle the request.

>##### Note on Create React App

> If you are using Create React App, you won't need to configure a fallback URL, it is automatically done.

### Configuring Express.js
If you are serving your index.html from Express.js :
``` js
  app.get('/*', (req,res) => {
    res.sendfile(path.join(__dirname, 'index.html'))
  })
```

### Configuring Webpack Dev Server
If you are serving your index.html from Webpack Dev Server:
You can add to your webpack.config.dev.js :
```js
  devServer: {
    historyApiFallback: true,
  }
```

## Connecting the Router with Redux App

Along this chapter, we will be using the [Todos](https://github.com/reactjs/redux/tree/master/examples/todos) example. We recommend you to clone it while reading this chapter.

The `<Router />` component has to be a children of `<Provider />` so that route handlers can get access to the `store`. `<Provider />` is the higher-order component provided by react-redux that lets you bind Redux to React (see [Usage with React](../basics/UsageWithReact.md)).

The `<Route />` component lets you define a component to be loaded whenever an url entered match with the property `path`. We added the optional `(:filter)` parameter so that it renders the `<App />` component if the url match '/'.

Passing the `browserHistory` is necessary if you want to remove the hash from URL (e.g : `http://localhost:3000/#/?_k=4sbb0i`). Unless you are targeting old browsers like IE9, you can always use `browserHistory`.

``` js
import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import App from './App';

const Root = ({ store }) => (
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/(:filter)" component={App} />
    </Router>
  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired,
};

export default Root;
```

## Navigating with React Router

React Router comes with a [<Link />](https://github.com/reactjs/react-router/blob/master/docs/API.md#link) component that let you navigate around your application. We can use it in our example and change our container `<FilterLink />` component so we can change the URL using `<FilterLink />. The `activeStyle={}` property lets you apply a style on the active state.


#### `containers/FilterLink.js`
```js
import React from 'react';
import { Link } from 'react-router';

const FilterLink = ({ filter, children }) => (
  <Link
    to={filter === 'all' ? '' : filter}
    activeStyle={{
      textDecoration: 'none',
      color: 'black'
    }}
  >
    {children}
  </Link>
);

export default FilterLink;
```

#### `containers/Footer.js`
```js
import React from 'react'
import FilterLink from '../containers/FilterLink'

const Footer = () => (
  <p>
    Show:
    {" "}
    <FilterLink filter="all">
      All
    </FilterLink>
    {", "}
    <FilterLink filter="active">
      Active
    </FilterLink>
    {", "}
    <FilterLink filter="completed">
      Completed
    </FilterLink>
  </p>
);

export default Footer
```

Now if you click on `<FilterLink />` you will see that your URL will change from `'/complete'`, `'/active'`, `'/'`. Even if you are going back with your browser, it will use your browser's history and effectively go to your previous URL.

## Reading From the URL

Currently, the todo list is not filtered even after the URL changed. This is because we are filtering from `<VisibleTodoList />`'s `mapStateToProps()` is still binded to the `state` and not to the URL. `mapStateToProps` has an optional second argument `ownProps` that is an object with every props passed to `<VisibleTodoList />`
#### `components/App.js`
```js
const mapStateToProps = (state, ownProps) => {
  return {
    todos: getVisibleTodos(state.todos, ownProps.filter) // previously was getVisibleTodos(state.todos, state.visibilityFilter)
  };
};
```

Right now we are not passing anything to `<App />` so `ownProps` is an empty object. To filter our todos according to the URL, we want to pass the URL params to `<VisibleTodoList />`.

When previously we wrote:  `<Route path="/(:filter)" component={App} />`, it made available inside `App` a `params` property.

`params` property is an object with every param specified in the url. *e.g : `params` will be equal to `{ filter: 'completed' }` if we are navigating to `localhost:3000/completed`. We can now read the URL from `<App />`.*

Note that we are using [ES6 destructuring](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) on the properties to pass in `params` to `<VisibleTodoList />`.

#### `components/App.js`
```js
const App = ({ params }) => {
  return (
    <div>
      <AddTodo />
      <VisibleTodoList
        filter={params.filter || 'all'}
      />
      <Footer />
    </div>
  );
};
```

## Next Steps

Now that you know how to do basic routing, you can learn more about [React Router API](https://github.com/reactjs/react-router/tree/master/docs)

>##### Note About Other Routing Libraries

>*Redux Router* is an experimental library, it lets you keep entirely the state of your url inside your redux store. It has the same API with React Router API but has a smaller community support than react-router.

>*React Router Redux* creates binding between your redux app and react-router and it keeps them in sync. Without this binding, you will not be able to rewind the actions with Time Travel. Unless you need this, React-router and Redux can operates completely apart.
