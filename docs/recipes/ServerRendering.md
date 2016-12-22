# Server Rendering

The most common use case for server-side rendering is to handle the _initial render_ when a user (or search engine crawler) first requests our app.  When the server receives the request, it renders the required component(s) into an HTML string, and then sends it as a response to the client.  From that point on, the client takes over rendering duties.

We will use React in the examples below, but the same techniques can be used with other view frameworks that can render on the server.

### Redux on the Server

When using Redux with server rendering, we must also send the state of our app along in our response, so the client can use it as the initial state. This is important because, if we preload any data before generating the HTML, we want the client to also have access to this data. Otherwise, the markup generated on the client won't match the server markup, and the client would have to load the data again.

To send the data down to the client, we need to:

* create a fresh, new Redux store instance on every request;
* optionally dispatch some actions;
* pull the state out of store;
* and then pass the state along to the client.

On the client side, a new Redux store will be created and initialized with the state provided from the server.  
Redux's **_only_** job on the server side is to provide the **initial state** of our app.

## Setting Up

In the following recipe, we are going to look at how to set up server-side rendering. We'll use the simplistic [Counter app](https://github.com/reactjs/redux/tree/master/examples/counter) as a guide and show how the server can render state ahead of time based on the request.

### Install Packages

For this example, we'll be using [Express](http://expressjs.com/) as a simple web server. We also need to install the React bindings for Redux, since they are not included in Redux by default.

```
npm install --save express react-redux
```

## The Server Side

The following is the outline for what our server side is going to look like. We are going to set up an [Express middleware](http://expressjs.com/guide/using-middleware.html) using [app.use](http://expressjs.com/api.html#app.use) to handle all requests that come in to our server. If you're unfamiliar with Express or middleware, just know that our handleRender function will be called every time the server receives a request.

Additionally, as we are using ES6 and JSX syntax, we will need to compile with [Babel](https://babeljs.io/) (see this example of a [this example of a Node Server with Babel](https://github.com/babel/example-node-server)) and the [React preset](https://babeljs.io/docs/plugins/preset-react/).

##### `server.js`

```js
import path from 'path'
import Express from 'express'
import React from 'react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import counterApp from './reducers'
import App from './containers/App'

const app = Express()
const port = 3000

// This is fired every time the server side receives a request
app.use(handleRender)

// We are going to fill these out in the sections to follow
function handleRender(req, res) { /* ... */ }
function renderFullPage(html, preloadedState) { /* ... */ }

app.listen(port)
```

### Handling the Request

The first thing that we need to do on every request is create a new Redux store instance. The only purpose of this store instance is to provide the initial state of our application.

When rendering, we will wrap `<App />`, our root component, inside a `<Provider>` to make the store available to all components in the component tree, as we saw in [Usage with React](../basics/UsageWithReact.md).

The key step in server side rendering is to render the initial HTML of our component _**before**_ we send it to the client side. To do this, we use [ReactDOMServer.renderToString()](https://facebook.github.io/react/docs/react-dom-server.html#rendertostring).

We then get the initial state from our Redux store using [`store.getState()`](../api/Store.md#getState). We will see how this is passed along in our `renderFullPage` function.

```js
import { renderToString } from 'react-dom/server'

function handleRender(req, res) {
  // Create a new Redux store instance
  const store = createStore(counterApp)

  // Render the component to a string
  const html = renderToString(
    <Provider store={store}>
      <App />
    </Provider>
  )

  // Grab the initial state from our Redux store
  const preloadedState = store.getState()

  // Send the rendered page back to the client
  res.send(renderFullPage(html, preloadedState))
}
```

### Inject Initial Component HTML and State

The final step on the server side is to inject our initial component HTML and initial state into a template to be rendered on the client side. To pass along the state, we add a `<script>` tag that will attach `preloadedState` to `window.__PRELOADED_STATE__`.

The `preloadedState` will then be available on the client side by accessing `window.__PRELOADED_STATE__`.

We also include our bundle file for the client-side application via a script tag. This is whatever output your bundling tool provides for your client entry point. It may be a static file or a URL to a hot reloading development server.

```js
function renderFullPage(html, preloadedState) {
  return `
    <!doctype html>
    <html>
      <head>
        <title>Redux Universal Example</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script>
          // WARNING: See the following for Security isues with this approach:
          // http://redux.js.org/docs/recipes/ServerRendering.html#security-considerations
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState)}
        </script>
        <script src="/static/bundle.js"></script>
      </body>
    </html>
    `
}
```

## The Client Side

The client side is very straightforward. All we need to do is grab the initial state from `window.__PRELOADED_STATE__`, and pass it to our [`createStore()`](../api/createStore.md) function as the initial state.

Let's take a look at our new client file:

#### `client.js`

```js
import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import App from './containers/App'
import counterApp from './reducers'

// Grab the state from a global variable injected into the server-generated HTML
const preloadedState = window.__PRELOADED_STATE__

// Create Redux store with initial state
const store = createStore(counterApp, preloadedState)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

You can set up your build tool of choice (Webpack, Browserify, etc.) to compile a bundle file into `static/bundle.js`.

When the page loads, the bundle file will be started up and [`ReactDOM.render()`](https://facebook.github.io/react/docs/top-level-api.html#reactdom.render) will hook into the `data-react-id` attributes from the server-rendered HTML. This will connect our newly-started React instance to the virtual DOM used on the server. Since we have the same initial state for our Redux store and used the same code for all our view components, the result will be the same real DOM.

And that's it! That is all we need to do to implement server side rendering.

But the result is pretty vanilla. It essentially renders a static view from dynamic code. What we need to do next is build an initial state dynamically to allow that rendered view to be dynamic.

## Preparing the Initial State

Because the client side executes ongoing code, it can start with an empty initial state and obtain any necessary state on demand and over time. On the server side, rendering is synchronous and we only get one shot to render our view. We need to be able to compile our initial state during the request, which will have to react to input and obtain external state (such as that from an API or database).

### Processing Request Parameters

The only input for server side code is the request made when loading up a page in your app in your browser. You may choose to configure the server during its boot (such as when you are running in a development vs. production environment), but that configuration is static.

The request contains information about the URL requested, including any query parameters, which will be useful when using something like [React Router](https://github.com/reactjs/react-router). It can also contain headers with inputs like cookies or authorization, or POST body data. Let's see how we can set the initial counter state based on a query parameter.

#### `server.js`

```js
import qs from 'qs' // Add this at the top of the file
import { renderToString } from 'react-dom/server'

function handleRender(req, res) {
  // Read the counter from the request, if provided
  const params = qs.parse(req.query)
  const counter = parseInt(params.counter, 10) || 0

  // Compile an initial state
  let preloadedState = { counter }

  // Create a new Redux store instance
  const store = createStore(counterApp, preloadedState)

  // Render the component to a string
  const html = renderToString(
    <Provider store={store}>
      <App />
    </Provider>
  )

  // Grab the initial state from our Redux store
  const finalState = store.getState()

  // Send the rendered page back to the client
  res.send(renderFullPage(html, finalState))
}
```

The code reads from the Express `Request` object passed into our server middleware. The parameter is parsed into a number and then set in the initial state. If you visit [http://localhost:3000/?counter=100](http://localhost:3000/?counter=100) in your browser, you'll see the counter starts at 100. In the rendered HTML, you'll see the counter output as 100 and the `__PRELOADED_STATE__` variable has the counter set in it.

### Async State Fetching

The most common issue with server side rendering is dealing with state that comes in asynchronously. Rendering on the server is synchronous by nature, so it's necessary to map any asynchronous fetches into a synchronous operation.

The easiest way to do this is to pass through some callback back to your synchronous code. In this case, that will be a function that will reference the response object and send back our rendered HTML to the client. Don't worry, it's not as hard as it may sound.

For our example, we'll imagine there is an external datastore that contains the counter's initial value (Counter As A Service, or CaaS). We'll make a mock call over to them and build our initial state from the result. We'll start by building out our API call:

#### `api/counter.js`

```js
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

export function fetchCounter(callback) {
  setTimeout(() => {
    callback(getRandomInt(1, 100))
  }, 500)
}
```

Again, this is just a mock API, so we use `setTimeout` to simulate a network request that takes 500 milliseconds to respond (this should be much faster with a real world API). We pass in a callback that returns a random number asynchronously. If you're using a Promise-based API client, then you would issue this callback in your `then` handler.

On the server side, we simply wrap our existing code in the `fetchCounter` and receive the result in the callback:

#### `server.js`

```js
// Add this to our imports
import { fetchCounter } from './api/counter'
import { renderToString } from 'react-dom/server'

function handleRender(req, res) {
  // Query our mock API asynchronously
  fetchCounter(apiResult => {
    // Read the counter from the request, if provided
    const params = qs.parse(req.query)
    const counter = parseInt(params.counter, 10) || apiResult || 0

    // Compile an initial state
    let preloadedState = { counter }

    // Create a new Redux store instance
    const store = createStore(counterApp, preloadedState)

    // Render the component to a string
    const html = renderToString(
      <Provider store={store}>
        <App />
      </Provider>
    )

    // Grab the initial state from our Redux store
    const finalState = store.getState()

    // Send the rendered page back to the client
    res.send(renderFullPage(html, finalState))
  })
}
```

Because we call `res.send()` inside of the callback, the server will hold open the connection and won't send any data until that callback executes. You'll notice a 500ms delay is now added to each server request as a result of our new API call. A more advanced usage would handle errors in the API gracefully, such as a bad response or timeout.

### Security Considerations

Because we have introduced more code that relies on user generated content (UGC) and input, we have increased our attack surface area for our application. It is important for any application that you ensure your input is properly sanitized to prevent things like cross-site scripting (XSS) attacks or code injections.

In our example, we take a rudimentary approach to security. When we obtain the parameters from the request, we use `parseInt` on the `counter` parameter to ensure this value is a number. If we did not do this, you could easily get dangerous data into the rendered HTML by providing a script tag in the request. That might look like this: `?counter=</script><script>doSomethingBad();</script>`

For our simplistic example, coercing our input into a number is sufficiently secure. If you're handling more complex input, such as freeform text, then you should run that input through an appropriate sanitization function, such as [validator.js](https://www.npmjs.com/package/validator).

Furthermore, you can add additional layers of security by sanitizing your state output. `JSON.stringify` can be subject to script injections. To counter this, you can scrub the JSON string of HTML tags and other dangerous characters. This can be done with either a simple text replacement on the string, e.g. `JSON.stringify(state).replace(/</g, '\\u003c')`, or via more sophisticated libraries such as [serialize-javascript](https://github.com/yahoo/serialize-javascript).

## Next Steps

You may want to read [Async Actions](../advanced/AsyncActions.md) to learn more about expressing asynchronous flow in Redux with async primitives such as Promises and thunks. Keep in mind that anything you learn there can also be applied to universal rendering.

If you use something like [React Router](https://github.com/reactjs/react-router), you might also want to express your data fetching dependencies as static `fetchData()` methods on your route handler components. They may return [async actions](../advanced/AsyncActions.md), so that your `handleRender` function can match the route to the route handler component classes, dispatch `fetchData()` result for each of them, and render only after the Promises have resolved. This way the specific API calls required for different routes are colocated with the route handler component definitions. You can also use the same technique on the client side to prevent the router from switching the page until its data has been loaded.
