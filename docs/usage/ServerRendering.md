---
id: server-rendering
title: Server Rendering
---

# Server Rendering

The most common use case for server-side rendering is to handle the _initial render_ when a user (or search engine crawler) first requests our app. When the server receives the request, it renders the required component(s) into an HTML string, and then sends it as a response to the client. From that point on, the client takes over rendering duties.

:::tip Use a framework if you can

Most apps that render on the server today use a framework that handles the request lifecycle, routing, data loading, and hydration for you: [Next.js](https://nextjs.org/), [React Router in framework mode](https://reactrouter.com/start/framework/installation), or [TanStack Start](https://tanstack.com/start/latest). If you use one of those, follow its data-loading conventions and see [Redux Toolkit Setup with Next.js](./nextjs.mdx) for how to create a per-request store in that setting.

This page explains the mechanics underneath: what Redux has to do on the server, how the state gets to the browser, and what to watch out for. That is useful for understanding what a framework does for you, or for wiring it up yourself with a plain Node server.

:::

We will use React in the examples below, but the same techniques can be used with other view frameworks that can render on the server.

### Redux on the Server

When using Redux with server rendering, we must also send the state of our app along in our response, so the client can use it as the initial state. This is important because, if we preload any data before generating the HTML, we want the client to also have access to this data. Otherwise, the markup generated on the client won't match the server markup, and the client would have to load the data again.

To send the data down to the client, we need to:

- create a fresh, new Redux store instance on every request;
- optionally dispatch some actions;
- pull the state out of store;
- and then pass the state along to the client.

On the client side, a new Redux store will be created and initialized with the state provided from the server.
Redux's **_only_** job on the server side is to provide the **initial state** of our app.

## Setting Up

The examples below use a small counter app with a single `counter` slice, and [Express](https://expressjs.com/) as the web server. Any Node HTTP server works the same way; Express just gives us a request handler and a response object.

```sh
npm install express @reduxjs/toolkit react-redux
```

Because the shared code is TypeScript and JSX, you'll need to compile it for Node with a tool such as `tsx`, Vite's SSR build, or `tsc`. The details vary by tool and are not covered here.

The store setup is the same one you would use in a client-only app, except that it exports a factory function rather than a single store instance:

##### `app/store.ts`

```ts
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'

const rootReducer = {
  counter: counterReducer
}

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
```

## The Server Side

The following is the outline for what our server side is going to look like. We are going to set up an [Express middleware](https://expressjs.com/guide/using-middleware.html) using `app.use` to handle all requests that come in to our server. If you're unfamiliar with Express or middleware, just know that our `handleRender` function will be called every time the server receives a request.

##### `server.tsx`

```tsx
import express from 'express'
import type { Request, Response } from 'express'
import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'
import { makeStore } from './app/store'
import type { RootState } from './app/store'
import App from './App'

const app = express()
const port = 3000

// Serve static files
app.use('/static', express.static('static'))

// This is fired every time the server side receives a request
app.use(handleRender)

// We are going to fill these out in the sections to follow
async function handleRender(req: Request, res: Response) {
  /* ... */
}
function renderFullPage(html: string, preloadedState: RootState) {
  /* ... */
}

app.listen(port)
```

### Handling the Request

The first thing that we need to do on every request is to create a new Redux store instance. The only purpose of this store instance is to provide the initial state of our application.

When rendering, we will wrap `<App />`, our root component, inside a `<Provider>` to make the store available to all components in the component tree, as we saw in ["Redux Fundamentals" Part 5: UI and React](../tutorials/fundamentals/part-5-ui-and-react.md).

The key step in server side rendering is to render the initial HTML of our component _**before**_ we send it to the client side. To do this, we use [`renderToString()`](https://react.dev/reference/react-dom/server/renderToString) from `react-dom/server`.

We then get the initial state from our Redux store using [`store.getState()`](../api/Store.md#getstate). We will see how this is passed along in our `renderFullPage` function.

```tsx
async function handleRender(req: Request, res: Response) {
  // Create a new Redux store instance
  const store = makeStore()

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

:::caution Never share a store between requests

The store must be created inside the request handler. A store created at module scope would be shared by every request the server handles, so one user's data would leak into another user's page. This applies equally to Express handlers, framework loaders, and React Server Components.

:::

### Inject Initial Component HTML and State

The final step on the server side is to inject our initial component HTML and initial state into a template to be rendered on the client side. To pass along the state, we add a `<script>` tag that will attach `preloadedState` to `window.__PRELOADED_STATE__`.

The `preloadedState` will then be available on the client side by accessing `window.__PRELOADED_STATE__`.

We also include our bundle file for the client-side application via a script tag. This is whatever output your bundling tool provides for your client entry point. It may be a static file or a URL to a hot reloading development server.

```tsx
function renderFullPage(html: string, preloadedState: RootState) {
  return `
    <!doctype html>
    <html>
      <head>
        <title>Redux Server Rendering Example</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script>
          // WARNING: See the following for security issues around embedding JSON in HTML:
          // https://redux.js.org/usage/server-rendering#security-considerations
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(
            /</g,
            '\\u003c'
          )}
        </script>
        <script src="/static/bundle.js"></script>
      </body>
    </html>
    `
}
```

## The Client Side

The client side is very straightforward. All we need to do is grab the initial state from `window.__PRELOADED_STATE__`, and pass it to `makeStore` as the `preloadedState`.

Let's take a look at our new client file:

#### `client.tsx`

```tsx
import { hydrateRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { makeStore } from './app/store'
import type { RootState } from './app/store'
import App from './App'

declare global {
  interface Window {
    __PRELOADED_STATE__?: RootState
  }
}

// Create Redux store with state injected by the server
const store = makeStore(window.__PRELOADED_STATE__)

// Allow the passed state to be garbage-collected
delete window.__PRELOADED_STATE__

hydrateRoot(
  document.getElementById('root')!,
  <Provider store={store}>
    <App />
  </Provider>
)
```

You can set up your build tool of choice (Vite, webpack, etc.) to compile a bundle file into `static/bundle.js`.

When the page loads, the bundle file will be started up and [`hydrateRoot()`](https://react.dev/reference/react-dom/client/hydrateRoot) will reuse the server-rendered HTML. This attaches React to the existing DOM instead of creating it from scratch. Since we have the same initial state for our Redux store and used the same code for all our view components, the result will be the same real DOM.

And that's it! That is all we need to do to implement server side rendering.

But the result is pretty vanilla. It essentially renders a static view from dynamic code. What we need to do next is build an initial state dynamically to allow that rendered view to be dynamic.

:::info

We recommend passing `window.__PRELOADED_STATE__` directly to `makeStore` and avoid creating additional references to the preloaded state (e.g. `const preloadedState = window.__PRELOADED_STATE__`) so that it can be garbage collected.

:::

## Preparing the Initial State

Because the client side executes ongoing code, it can start with an empty initial state and obtain any necessary state on demand and over time. On the server side, rendering is synchronous and we only get one shot to render our view. We need to be able to compile our initial state during the request, which will have to react to input and obtain external state (such as that from an API or database).

### Processing Request Parameters

The only input for server side code is the request made when loading up a page in your app in your browser. You may choose to configure the server during its boot (such as when you are running in a development vs. production environment), but that configuration is static.

The request contains information about the URL requested, including any query parameters, which will be useful when using something like [React Router](https://github.com/remix-run/react-router). It can also contain headers with inputs like cookies or authorization, or POST body data. Let's see how we can set the initial counter state based on a query parameter.

#### `server.tsx`

```tsx
async function handleRender(req: Request, res: Response) {
  // Read the counter from the request, if provided
  const counter = parseInt(String(req.query.counter), 10) || 0

  // Compile an initial state
  const preloadedState = { counter: { value: counter } }

  // Create a new Redux store instance
  const store = makeStore(preloadedState)

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

The most common issue with server side rendering is dealing with state that comes in asynchronously. `renderToString` is synchronous, so any data the first render needs has to be loaded _before_ we call it. Because our request handler is an `async` function, we can `await` the data, then build the store and render.

For our example, we'll imagine there is an external datastore that contains the counter's initial value (Counter As A Service, or CaaS). We'll make a mock call over to them and build our initial state from the result. We'll start by building out our API call:

#### `api/counter.ts`

```ts
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min
}

export function fetchCounter(): Promise<number> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getRandomInt(1, 100))
    }, 500)
  })
}
```

Again, this is just a mock API, so we use `setTimeout` to simulate a network request that takes 500 milliseconds to respond (this should be much faster with a real world API). A real client would return the promise from `fetch` or a database query instead.

On the server side, we `await` the result before creating the store:

#### `server.tsx`

```tsx
// Add this to our imports
import { fetchCounter } from './api/counter'

async function handleRender(req: Request, res: Response) {
  // Query our mock API asynchronously
  const apiResult = await fetchCounter()

  // Read the counter from the request, if provided
  const counter = parseInt(String(req.query.counter), 10) || apiResult || 0

  // Compile an initial state
  const preloadedState = { counter: { value: counter } }

  // Create a new Redux store instance
  const store = makeStore(preloadedState)

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

Because we `await` before calling `res.send()`, the server will hold open the connection and won't send any data until the fetch completes. You'll notice a 500ms delay is now added to each server request as a result of our new API call. A more advanced usage would handle errors in the API gracefully, such as a bad response or timeout.

You can also do the loading through the store itself: create the store first, `await store.dispatch(someThunk())` or `await store.dispatch(api.endpoints.getCounter.initiate())` for RTK Query, then render. The result is the same, but the data-loading logic lives in your Redux code and can be reused on the client.

### Security Considerations

Because we have introduced more code that relies on user generated content (UGC) and input, we have increased our attack surface area for our application. It is important for any application that you ensure your input is properly sanitized to prevent things like cross-site scripting (XSS) attacks or code injections.

In our example, we take a rudimentary approach to security. When we obtain the parameters from the request, we use `parseInt` on the `counter` parameter to ensure this value is a number. If we did not do this, you could easily get dangerous data into the rendered HTML by providing a script tag in the request. That might look like this: `?counter=</script><script>doSomethingBad();</script>`

For our simplistic example, coercing our input into a number is sufficiently secure. If you're handling more complex input, such as freeform text, then you should run that input through an appropriate sanitization library.

Furthermore, you can add additional layers of security by sanitizing your state output. `JSON.stringify` can be subject to script injections. To counter this, you can scrub the JSON string of HTML tags and other dangerous characters. This can be done with either a simple text replacement on the string, e.g. `JSON.stringify(state).replace(/</g, '\\u003c')`, or via more sophisticated libraries such as [serialize-javascript](https://github.com/yahoo/serialize-javascript).

Embedding the state as JSON in a `<script>` tag is also the fastest way to hand it to the browser. See [The Fastest Way of Passing State to JavaScript, Re-visited](https://calendar.perfplanet.com/2023/fastest-way-passing-state-javascript-revisited/) for measurements of the alternatives and the escaping rules you need to follow.

## Next Steps

You may want to read [Redux Fundamentals Part 6: Async Logic and Data Fetching](../tutorials/fundamentals/part-6-async-logic.md) to learn more about expressing asynchronous flow in Redux with async primitives such as Promises and thunks. Keep in mind that anything you learn there can also be applied to server rendering.

If you use a router, you'll usually want to express each route's data requirements next to the route definition, load them before rendering, and render only after the data is in the store. React Router's framework mode and TanStack Start both provide route loaders for this, and Next.js has its own data-loading conventions; see [Redux Toolkit Setup with Next.js](./nextjs.mdx) for an example of creating the store per request in a framework.

React 18+ also supports streaming server rendering with [`renderToPipeableStream`](https://react.dev/reference/react-dom/server/renderToPipeableStream). Redux works the same way there: create the store per request and pass the state to the client. Frameworks handle the details of streaming state alongside the HTML.
