# Server Rendering

The most common use case for server-side rendering is to handle the _initial render_ when a user (or search engine crawler) first requests our app.  When the server receives the request, it renders the required component(s) into an HTML string, and then sends it as a response to the client.  From that point on, the client takes over rendering duties.

### Redux on the server
When using a store like Redux, we must also send the initial state of our app along in our response.  To do this, we need to: create a fresh, new Redux store instance on every request, optionally dispatch some actions, pull the state out of store, and then pass the state along to the client.  On the client side, a new Redux store will be created and initialized with the state provided from the server.

Redux's **_only_** job on the server side is to provide the **initial state** of our app.

-----

In the following recipe, we are going to look at how to set up server-side rendering, using the [Todo List app](../basics/ExampleTodoList.html) that we built in [Basics](../basics/) as a guide.

## Setting Up

### File Structure
We are going to put the actions, reducers, and components from the Todo List app into a `shared/` folder, since they will be used by both the client and server. Note that we have moved our client-side entrypoint into the `client/` folder.

    server.jsx
    client/index.jsx
    shared/actions.js
    shared/reducers.js
    shared/containers/App.js
    shared/components/AddTodo.js
    shared/components/Footer.js
    shared/components/Todo.js
    shared/components/TodoList.js


### Install Packages
For this example, we'll be using [Express](http://expressjs.com/) as a simple web server.

We also need to install the React bindings for Redux, since they are not included in Redux by default.


    npm install --save express react-redux


## The Server Side

**server.jsx**

The following is the outline for what our server side is going to look like.  We are going to set up an [Express middleware](http://expressjs.com/guide/using-middleware.html) using [app.use](http://expressjs.com/api.html#app.use) to handle all requests that come in to our server.  If you're unfamiliar with Express or middleware, just know that our handleRender function will be called every time the server receives a request.
```js
import Express             from 'express';
import React               from 'react';
import { createStore }     from 'redux';
import { Provider }        from 'react-redux';
import todoApp             from './shared/reducers';
import App                 from './shared/containers/App';

var app = Express();

// This is fired every time the server side receives a request
app.use(handleRender);

// We are going to fill these out in the sections to follow
function handleRender(req, res) { // ... }
function renderFullPage(html, initialState) { //... }

export default app;
```

**Handling The Request**

The first thing that we need to do on every request is create a new Redux store instance. The only purpose of this store instance is to provide the initial state of our application.

When rendering, we will wrap `<App/>`, our root component, inside a `<Provider>` to make the store available to all components in the component tree.

The key step in server side rendering is to render the initial HTML of our component _**before**_ we send it to the client side.  To do this, we use [React.renderToString](https://facebook.github.io/react/docs/top-level-api.html#react.rendertostring).

We then get the initial state from our Redux store using **store.getState()**.  We will see how this is passed along in our `renderFullPage` function.

```js
function handleRender(req, res) {
    // Create a new Redux store instance
    var store = createStore(todoApp);

      // Render the component to a string
      var html = React.renderToString(
        <Provider store={store}>
          { () => <App/> }
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

The client side is very straightforward.  All we need to do is grab the initial state from `window.__INITIAL_STATE__`, and pass it to our createStore function as the initial state.

Let's take a look at our new `client/index.jsx`:

**client/index.jsx**
```js
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from '../shared/containers/App';
import todoApp from '../shared/reducers';

const initialState = window.__INITIAL_STATE__;

let store = createStore(todoApp, initialState);

let rootElement = document.getElementById('app');
React.render(
  // The child must be wrapped in a function
  // to work around an issue in React 0.13.
  <Provider store={store}>
    {() => <App/>}
  </Provider>,
  rootElement
);

```
And that's it!  That is all we need to do to implement server side rendering.

From here, the only other step is fetching any data that we need to generate our initial state.

## Async Data Fetching
Fetching data asynchronously during server side rendering is a common point of confusion.  The first thing to understand is that you can fetch your data however you want, **as long as it is available _before_ we send our response to the client**.

**examples**
