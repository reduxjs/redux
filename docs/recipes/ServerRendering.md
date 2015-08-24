# Server Rendering

The most common use case for server-side rendering is to handle the _initial render_ when a user (or search engine crawler) first requests our app.  When the server receives the request, it renders the required component(s) into an HTML string, and then sends it as a response to the client.  From that point on, the client takes over rendering duties.

### Redux on the server

When using a store like Redux, we must also send the initial state of our app along in our response.  To do this, we need to: create a fresh, new Redux store instance on every request, optionally dispatch some actions, pull the state out of store, and then pass the state along to the client.  On the client side, a new Redux store will be created and initialized with the state provided from the server.

Redux's **_only_** job on the server side is to provide the **initial state** of our app.

## Setting Up

In the following recipe, we are going to look at how to set up server-side rendering. We'll use the simplistic [Counter app](https://github.com/rackt/redux/tree/master/examples/counter) as a guide and show how the server can render state ahead of time based on the request.

### Install Packages

For this example, we'll be using [Express](http://expressjs.com/) as a simple web server.

We also need to install the React bindings for Redux, since they are not included in Redux by default.

    npm install --save react-redux express serve-static


## The Server Side

The following is the outline for what our server side is going to look like. We are going to set up an [Express middleware](http://expressjs.com/guide/using-middleware.html) using [app.use](http://expressjs.com/api.html#app.use) to handle all requests that come in to our server. We do the same with the `serve-static` middleware to be able to serve up our client javascript bundle. If you're unfamiliar with Express or middleware, just know that our handleRender function will be called every time the server receives a request.

**server.js**

```js
import path from 'path';
import Express from 'express';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import counterApp from './reducers';
import App from './containers/App';

const app = Express();
const port = 8080;

// Use this middleware to server up static files built into the dist directory
app.use(require('serve-static')(path.join(__dirname, 'dist')));

// This is fired every time the server side receives a request
app.use(handleRender);

// We are going to fill these out in the sections to follow
function handleRender(req, res) { // ... }
function renderFullPage(html, initialState) { //... }

app.listen(port);
```

### Handling The Request

The first thing that we need to do on every request is create a new Redux store instance. The only purpose of this store instance is to provide the initial state of our application.

When rendering, we will wrap `<App/>`, our root component, inside a `<Provider>` to make the store available to all components in the component tree, as we saw in [Usage with React](/docs/basics/UsageWithReact.html).

The key step in server side rendering is to render the initial HTML of our component _**before**_ we send it to the client side. To do this, we use [React.renderToString](https://facebook.github.io/react/docs/top-level-api.html#react.rendertostring).

We then get the initial state from our Redux store using **store.getState()**.  We will see how this is passed along in our `renderFullPage` function.

```js
function handleRender(req, res) {

  // Create a new Redux store instance
  const store = createStore(counterApp);

  // Render the component to a string
  const html = React.renderToString(
    <Provider store={store}>
      { () => <App/> }
    </Provider>);

  // Grab the initial state from our Redux store
  const initialState = store.getState();

  // Send the rendered page back to the client
  res.send(renderFullPage(html, initialState));
}
```

### Inject our initial component HTML and state

The final step on the server side is to inject our initial component HTML and initial state into a template to be rendered on the client side.  To pass along the state, we add a `<script>` tag that will attach `initialState` to `window.__INITIAL_STATE__`.

The initialState will then be available on the client side by accessing `window.__INITIAL_STATE__`.

We also include our bundle file for the client-side application via a script tag. The `serve-static` middleware included above will serve up this file. We'll see what that file contains in just a bit.

```js
function renderFullPage(html, initialState) {
  return `
    <!doctype html>
    <html>
      <head>
        <title>Redux Universal Example</title>
      </head>
      <body>
        <div id="app">${html}</div>
        <script>
          window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
        </script>
        <script src="/bundle.js"></script>
      </body>
    </html>
    `;
}
```


## The Client Side

The client side is very straightforward.  All we need to do is grab the initial state from `window.__INITIAL_STATE__`, and pass it to our createStore function as the initial state.

Let's take a look at our new client file:

**client.js**

```js
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './containers/App';
import counterApp from './reducers';

const initialState = window.__INITIAL_STATE__;

let store = createStore(counterApp, initialState);

let rootElement = document.getElementById('app');
React.render(
  <Provider store={store}>
    {() => <App/>}
  </Provider>,
  rootElement
);

```

You can set up your build tool of choice (webpack, browserify, etc.) to compile a bundle file into `dist/bundle.js`.

When the page loads, the bundle file will be started up and [React.render](https://facebook.github.io/react/docs/top-level-api.html#react.render) will hook into the `data-react-id` attributes from the server-rendered HTML. This will connect our newly-started React instance to the virtual DOM used on the server. Since we have the same initial state for our Redux store and used the same code for all our view components, the result will be the same real DOM.

And that's it! That is all we need to do to implement server side rendering.

But the result is pretty vanilla. It essentially renders a static view from dynamic code. What we need to do next is build an initial state dynamically to allow that rendered view to be dynamic.

## Preparing the Initial State

Because the client side executes ongoing code, it can start with an empty initial state and obtain any necessary state on demand and over time. On the server side, execution is synchronous and we only get one shot to render our view. We need to be able to compile our initial state during the request, which will have to react to input and obtain external state (such as that from an API or database).

### Processing Request Parameters

The only input for server side code is the request made when loading up a page in your app in your browser. You may choose to configure the server during it's boot (such as when you are running in a development vs. production environment), but that configuration is static.

The request contains information about the URL requested, including any query parameters, which will be useful when using something like [react-router](https://github.com/rackt/react-router). It can also contain headers with inputs like cookies or authorization, or POST body data. Let's see how we can set the initial counter state based on a query parameter.

**server.js**

```js
import qs from 'qs'; // Add this at the top of the file

function handleRender(req, res) {

  // Read the counter from the request, if provided
  const params = qs.parse(req.query);
  const counter = parseInt(params.counter) || 0;

  // Compile an initial state
  let initialState = { counter };

  // Create a new Redux store instance
  const store = createStore(counterApp, initialState);

  // Render the component to a string
  const html = React.renderToString(
    <Provider store={store}>
      { () => <App/> }
    </Provider>);

  // Grab the initial state from our Redux store
  const finalState = store.getState();

  // Send the rendered page back to the client
  res.send(renderFullPage(html, finalState));
}
```
The code reads from the Express `Request` object passed into our server middleware. The parameter is parsed into a number and then set in the initial state. If you visit [http://localhost:8080/?counter=100](http://localhost:8080/?counter=100) in your browser, you'll see the counter starts at 100. In the rendered HTML, you'll see the counter output as 100 and the `__INITIAL_STATE__` variable has the counter set in it.

### Async State Fetching

The most common issue with server side rendering is dealing with state that comes in asynchronously. Rendering on the server is synchronous by nature, so it's necessary to map any asynchronous fetches into a synchronous operation.

The easiest way to do this is to pass through some callback back to your synchronous code. In this case, that will be a function that will reference the response object and send back our rendered HTML to the client. Don't worry, it's not as hard as it may sound.

For our example, we'll imagine there is an external datastore that contains the counter's initial value (Counter As A Service, or CaaS). We'll make a mock call over to them and build our initial state from the result. We'll start by building out our API call:

**api/counter.js**

```js
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function fetchCounter(callback) {
  setTimeout(() => {
    callback(getRandomInt(1, 100));
  }, 500);
}
```

Again, this is just a mock API, so we use `setTimeout` to simulate a network request that takes 500 milliseconds to respond (this should be much faster with a real world API). We pass in a callback that returns a random number asynchronously. If you're using a Promise-based API client, then you would issue this callback in your `then` handler.

On the server side, we simply wrap our existing code in the `fetchCounter` and recieve the result in the callback:

**server.js**

```js
// Add this to our imports
import { fetchCounter } from './api/counter';

function handleRender(req, res) {

  // Query our mock API asynchronously
  fetchCounter(apiResult => {

    // Read the counter from the request, if provided
    const params = qs.parse(req.query);
    const counter = parseInt(params.counter) || apiResult || 0;

    // Compile an initial state
    let initialState = { counter };

    // Create a new Redux store instance
    const store = createStore(counterApp, initialState);

    // Render the component to a string
    const html = React.renderToString(
      <Provider store={store}>
        { () => <App/> }
      </Provider>);

    // Grab the initial state from our Redux store
    const finalState = store.getState();

    // Send the rendered page back to the client
    res.send(renderFullPage(html, finalState));
  });
}
```

Because we `res.send()` inside of the callback, the server will hold open the connection and won't send any data until that callback executes. You'll notice a 500ms delay is now added to each server request as a result of our new API call. A more advanced usage would handle errors in the API gracefully, such as a bad response or timeout.
