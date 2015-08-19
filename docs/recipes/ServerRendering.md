# Server Rendering

## Redux and Server Side Rendering
Redux is well-suited for server side rendering.  This is because Redux does not rely on _singletons_.

Redux's job on the server side is to provide the initial state for the initial render of our app.  To get this, we need to create a new instance of a Redux store for every new request.

In the following recipe, we are going to look at how to set up server side rendering.  We are going to use the code from our Todo List app that we built in Basics as a guide, but shouldn't need to touch any of the actions, reducers, or components from that tutorial.

## Setting Up

### File Structure
We are going to move our actions, reducers, routes, and components from our Todo List app into a `shared/` folder, since they will be used by both the client and server. Note that we have moved our client-side entrypoint into the `client/` folder.

    server.jsx
    client/index.jsx
    shared/actions.js
    shared/reducers.js
    shared/routes.js
    shared/containers/App.js
    shared/components/AddTodo.js
    shared/components/Footer.js
    shared/components/Todo.js
    shared/components/TodoList.js


### Install Packages
For this example, we will be using [Express](http://expressjs.com/) as a simple web server.

We are going to be using [React Router v. 1.0.0-beta3](https://rackt.github.io/react-router/) to handle both our back-end and front-end routes.

We also need to install the React bindings for Redux, since they are not included in Redux by default.


    npm install --save react redux express react-router@1.0.0-beta3 react-redux


## The Server Side

**shared/routes.js**

These routes are used for **both** the client and server side.  These are used by React Router to fetch the proper component for a specific route.
```js
import React                   from 'react';
import { DefaultRoute, Route } from 'react-router';
import App from 'containers/App';
import Footer from 'components/Footer';

export default (
  <Route path="/" component={App}/>
);

```

**server.jsx**

The following is the outline for what our server side is going to look like.  We are going to set up an [Express middleware](http://expressjs.com/guide/using-middleware.html) using [app.use](http://expressjs.com/api.html#app.use) to handle all requests that come in to our server.  If you're unfamiliar with Express or middleware, just know that our handleRender function will be called every time the server receives a request.
```js
import Express             from 'express';
import React               from 'react';
import { Router }          from 'react-router';
import Location            from 'react-router/lib/Location';
import { createStore }     from 'redux';
import { Provider }        from 'react-redux';
import routes              from './shared/routes';
import todoApp             from './shared/reducers';

var app = Express();

// This is fired every time the server side receives a request
app.use(handleRender);

// We are going to fill these out in the sections to follow
function handleRender(req, res) { // ... }
function renderRoute(err, routeState) { //... }
function renderFullPage(html, initialState) { //... }

export default app;
```

**Handling The Request**

Every time a request is received, the first thing we need to do is create a new Redux store instance.  The only purpose of this store instance is to provide the initial state of our application. Next, we pass our routes and the requested location to React Router.  React Router is going to look at our **routes.js** and fetch the component that should handle the requested route.
```js
function handleRender(req, res) {
  // Create a new Redux store instance
  var store = createStore(todoApp);

  // Create a new Location based on the requested path
  var location = new Location(req.path, req.query);

  // Run React Router with the given location and our routes
  // renderRoute is the callback that will be fired
  Router.run(routes, location, renderRoute);
};
```

**Rendering the Component**

The key step in server side rendering is to render the initial HTML of our component _**before**_ we send it to the client side.  To do this, we use [React.renderToString](https://facebook.github.io/react/docs/top-level-api.html#react.rendertostring).

We wrap our root component in Provider to make the store available to all components in the component tree.

We also need to get the initial state from our Redux store, so that we can pass it along to the client as well.  We get the initial state using **store.getState()**.  We will see how this is passed along in our _renderFullPage_ function.
```js
function renderRoute(err, routeState) {
    if(err) return console.error(err);

      // Render the component to a string
      var html = React.renderToString(
        <Provider store={store}>
          {() =>
            <Router {...routeState} />
          }
        </Provider>);

      // Grab the initial state from our Redux store
      var initialState = store.getState();

      res.send(renderFullPage(html, initialState));
  }
```

**Inject our initial component HTML and state**

The final step on the server side is to inject our initial component HTML and initial state into a template to be rendered on the client side.  To pass along the state, we add a `<script>` tag that will attach `initialState` to `window.__INITIAL_STATE__`.

The initialState will then be available on the client side by accessing `window.__INITIAL_STATE__`.

```js
function renderFullPage(html, initialState) {
  return `
    <!doctype html>
    <html>
      <body>
        <div id="app">${html}</div>
        <script>
         ${/* put this here for the client to pick up, you'll need your
              components to pick up this stuff on the first render */}
          window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
        </script>
      </body>
    </html>
    `;
}
```


## The Client Side

The client side is very straightforward.  All we need to do is _hydrate_ our store by grabbing `window.__INITIAL_STATE__` and passing it to our createStore function as the initial state.

We also need to pass the Router in as our child to Provider, rather than our App component.

Let's take a look at our new `client/index.jsx`:

**client/index.jsx**
```js
import React from 'react';
import { Router } from 'react-router';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from '../shared/containers/App';
import todoApp from '../shared/reducers';
import routes from '../shared/routes';

const initialState = window.__INITIAL_STATE__;

let store = createStore(todoApp, initialState);

let rootElement = document.getElementById('app');
React.render(
  // The child must be wrapped in a function
  // to work around an issue in React 0.13.
  <Provider store={store}>
    {() => <Router children={routes} />}
  </Provider>,
  rootElement
);

```
And that's it!  That is all we need to do to implement server side rendering.

From here, the only other step is fetching any data that we need to generate our initial state.

## Async Data Fetching
Fetching data asynchronously during server side rendering is a common point of confusion.  The first thing to understand is that you can fetch your data however you want, **as long as it is available _before_ we send our response to the client**.

**examples**
