---
id: writing-tests
title: Writing Tests
description: 'Usage > Writing Tests: recommended practices and setup for testing Redux apps'
---

# Writing Tests

:::tip What You'll Learn

- Recommended practices for testing apps using Redux
- Examples of test configuration and setup

:::

## Guiding Principles

The guiding principles for testing Redux logic closely follow that of React Testing Library:

> [The more your tests resemble the way your software is used, the more confidence they can give you.](https://twitter.com/kentcdodds/status/977018512689455106) - Kent C. Dodds

Because most of the Redux code you write are functions, and many of them are pure, they are easy to test without mocking. However, you should consider whether each piece of your Redux code needs its own dedicated tests. In the majority of scenarios, the end-user does not know, and does not care whether Redux is used within the application at all. As such, the Redux code can be treated as an implementation detail of the app, without requiring explicit tests for the Redux code in many circumstances.

The general advice for testing an app using Redux is as follows:

- Use integration tests for everything working together. I.e. for a React app using Redux, render a `<Provider>` with a real store instance wrapping the component/s being tested. Interactions with the page being tested should use real Redux logic, with API calls mocked out so app code doesn't have to change, and assert that the UI is updated appropriately.
- If needed, use basic unit tests for pure functions such as particularly complex reducers or selectors. However, in many cases, these are just implementation details that are covered by integration tests instead.

:::info

For background on why we recommend integration-style tests, see:

- Kent C Dodds: [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details): thoughts on why he recommends avoiding testing implementation details.
- Mark Erikson: [Blogged Answers: The Evolution of Redux Testing Approaches](https://blog.isquaredsoftware.com/2021/06/the-evolution-of-redux-testing-approaches/): thoughts on how Redux testing has evolved from 'isolation' to 'integration' over time.

:::

## Setting Up

Redux can be tested with any test runner, however in the examples below we will be using [Jest](https://facebook.github.io/jest/), a popular testing framework.
Note that it runs in a Node environment, so you won't have access to the real DOM.
Jest can instead use [jsdom](https://github.com/jsdom/jsdom) to emulate portions of the browser in a test environment.

```sh
npm install --save-dev jest
```

To use it together with [Babel](https://babeljs.io), you will need to install `babel-jest`:

```sh
npm install --save-dev babel-jest
```

and configure it to use [babel-preset-env](https://github.com/babel/babel/tree/master/packages/babel-preset-env) features in `.babelrc`:

```js
{
  "presets": ["@babel/preset-env"]
}
```

Then, add this to `scripts` in your `package.json`:

```js
{
  ...
  "scripts": {
    ...
    "test": "jest",
    "test:watch": "npm test -- --watch"
  },
  ...
}
```

and run `npm test` to run it once, or `npm run test:watch` to test on every file change.

## Action Creators & Thunks

In Redux, action creators are functions which return plain objects. Our recommendation is not to write action creators manually, but instead have them generated automatically by [`createSlice`](https://redux-toolkit.js.org/api/createSlice#return-value), or created via [`createAction`](https://redux-toolkit.js.org/api/createAction) from [`@reduxjs/toolkit`](https://redux-toolkit.js.org/introduction/getting-started). As such, you should not feel the need to test action creators by themselves (the Redux Toolkit maintainers have already done that for you!).

The return value of action creators is considered an implementation detail within your application, and when following an integration testing style, do not need explicit tests.

Similarly for thunks using [Redux Thunk](https://github.com/reduxjs/redux-thunk), our recommendation is not to write them manually, but instead use [`createAsyncThunk`](https://redux-toolkit.js.org/api/createAsyncThunk) from [`@reduxjs/toolkit`](https://redux-toolkit.js.org/introduction/getting-started). The thunk handles dispatching the appropriate `pending`, `fulfilled` and `rejected` action types for you based on the lifecycle of the thunk.

We consider thunk behavior to be an implementation detail of the application, and recommend that it be covered by testing the group of components (or whole app) using it, rather than testing the thunk in isolation.

Our recommendation is to mock async requests at the `fetch/xhr` level using tools like [`msw`](https://mswjs.io/), [`miragejs`](https://miragejs.com/), [`jest-fetch-mock`](https://github.com/jefflau/jest-fetch-mock#readme), [`fetch-mock`](https://www.wheresrhys.co.uk/fetch-mock/), or similar. By mocking requests at this level, none of the thunk logic has to change in a test - the thunk still tries to make a "real" async request, it just gets intercepted. See the [components example](#example-1) for an example of testing a component which internally includes the behavior of a thunk.

:::info

If you prefer, or are otherwise required to write unit tests for your action creators or thunks, refer to the tests that Redux Toolkit uses for [`createAction`](https://github.com/reduxjs/redux-toolkit/blob/635d6d5e513e13dd59cd717f600d501b30ca2381/src/tests/createAction.test.ts) and [`createAsyncThunk`](https://github.com/reduxjs/redux-toolkit/blob/635d6d5e513e13dd59cd717f600d501b30ca2381/src/tests/createAsyncThunk.test.ts).

:::

## Reducers

Reducers are pure functions that return the new state after applying the action to the previous state. In the majority of cases, the reducer is an implementation detail that does not need explicit tests. However, if your reducer contains particularly complex logic that you would like the confidence of having unit tests for, reducers can be easily tested.

Because reducers are pure functions, testing them should be straightforward. Call the reducer with a specific input `state` and `action`, and assert that the result state matches expectations.

#### Example

```js
import { createSlice } from '@reduxjs/toolkit'

const initialState = [
  {
    text: 'Use Redux',
    completed: false,
    id: 0
  }
]

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    todoAdded(state, action: PayloadAction<string>) {
      state.push({
        id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
        completed: false,
        text: action.payload
      })
    }
  }
})

export const { todoAdded } = todosSlice.actions

export default todosSlice.reducer
```

can be tested like:

```js
import reducer, { todoAdded } from './todosSlice'

test('should return the initial state', () => {
  expect(reducer(undefined, {})).toEqual([
    {
      text: 'Use Redux',
      completed: false,
      id: 0
    }
  ])
})

test('should handle a todo being added to an empty list', () => {
  const previousState = []
  expect(reducer(previousState, todoAdded('Run the tests'))).toEqual([
    {
      text: 'Run the tests',
      completed: false,
      id: 0
    }
  ])
})

test('should handle a todo being added to an existing list', () => {
  const previousState = [
    {
      text: 'Run the tests',
      completed: true,
      id: 0
    }
  ]
  expect(reducer(previousState, todoAdded('Use Redux'))).toEqual([
    {
      text: 'Run the tests',
      completed: true,
      id: 0
    },
    {
      text: 'Use Redux',
      completed: false,
      id: 1
    }
  ])
})
```

## Components

Our recommendation for testing components that include Redux code is via integration tests that include everything working together, with assertions aimed at verifying that the app behaves the way you expect when the user interacts with it in a given manner.

First, we will install [React Testing Library](https://testing-library.com/docs/react-testing-library/intro). React Testing Library is a simple and complete React DOM testing utility that encourages good testing practices. It uses react-dom's `render` function and `act` from react-dom/tests-utils.

```sh
npm install --save-dev @testing-library/react
```

If you are using jest, we also recommend installing [jest-dom](https://github.com/testing-library/jest-dom) as it provides a set of custom jest matchers that you can use to extend jest. These will make your tests more declarative, clear to read and to maintain. jest-dom is being used in the examples below.

```sh
npm install --save-dev @testing-library/jest-dom
```

#### Example

Consider the following `userSlice` slice and `App` component:

```js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { userAPI } from './userAPI'

export const fetchUser = createAsyncThunk('user/fetchUser', async () => {
  const response = await userAPI.fetchUser()
  return response.data
})

const userSlice = createSlice({
  name: 'user',
  initialState: {
    name: 'No user',
    status: 'idle'
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchUser.pending, (state, action) => {
      state.status = 'loading'
    })
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.status = 'complete'
      state.name = action.payload
    })
  }
})

export const selectUser = state => state.user.name
export const selectUserFetchStatus = state => state.user.status

export default userSlice.reducer
```

```jsx
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUser, selectUser, selectUserFetchStatus } from './userSlice'

export default function App() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const userFetchStatus = useSelector(selectUserFetchStatus)

  return (
    <div>
      {/* Display the current user name */}
      <div>{user}</div>
      {/* On button click, dispatch a thunk action to fetch a user */}
      <button onClick={() => dispatch(fetchUser())}>Fetch user</button>
      {/* At any point if we're fetching a user, display that on the UI */}
      {userFetchStatus === 'loading' && <div>Fetching user...</div>}
    </div>
  )
}
```

This app involves thunks, reducers and selectors. All of these can be tested by writing an integration test with the following in mind:

- Upon first loading the app, there should be no user yet - we should see 'No user' on the screen.
- After clicking the button that says 'Fetch user', we expect it to start fetching the user. We should see 'Fetching user...' displayed on the screen.
- After some time, the user should be received. We should no longer see 'Fetching user...', but instead should see the expected user's name based on the response from our API.

Writing our tests to focus on the above as a whole, we can avoid mocking as much of the app as possible. We will also have confidence that the critical behavior of our app does what we expect it to when interacted with in the way we expect the user to use the app.

To test the component, we `render` it into the DOM, and assert that the app responds to interactions in the way we expect the user to use the app. We can use the `wrapper` option in the `render` function and export our own `render` function as explained in React Testing Library's [setup docs](https://testing-library.com/docs/react-testing-library/setup).

Our `render` function can look like this:

```jsx
// test-utils.jsx
import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
// Import your own reducer
import userReducer from '../userSlice'

function render(
  ui,
  {
    preloadedState,
    store = configureStore({ reducer: { user: userReducer }, preloadedState }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

// re-export everything
export * from '@testing-library/react'
// override render method
export { render }
```

And our test can use our exported `render` function to test the criteria of our integration test:

```jsx
import React from 'react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
// We're using our own custom render function and not RTL's render.
// Our custom utils also re-export everything from RTL
// so we can import fireEvent and screen here as well
import { render, fireEvent, screen } from '../../test-utils'
import App from '../../containers/App'

// We use msw to intercept the network request during the test,
// and return the response 'John Smith' after 150ms
// when receiving a get request to the `/api/user` endpoint
export const handlers = [
  rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.json('John Smith'), ctx.delay(150))
  })
]

const server = setupServer(...handlers)

// Enable API mocking before tests.
beforeAll(() => server.listen())

// Reset any runtime request handlers we may add during the tests.
afterEach(() => server.resetHandlers())

// Disable API mocking after the tests are done.
afterAll(() => server.close())

test('fetches & receives a user after clicking the fetch user button', async () => {
  render(<App />)

  // should show no user initially, and not be fetching a user
  expect(screen.getByText(/no user/i)).toBeInTheDocument()
  expect(screen.queryByText(/Fetching user\.\.\./i)).not.toBeInTheDocument()

  // after clicking the 'Fetch user' button, it should now show that it is fetching the user
  fireEvent.click(screen.getByRole('button', { name: /Fetch user/i }))
  expect(screen.getByText(/no user/i)).toBeInTheDocument()

  // after some time, the user should be received
  expect(await screen.findByText(/John Smith/i)).toBeInTheDocument()
  expect(screen.queryByText(/no user/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/Fetching user\.\.\./i)).not.toBeInTheDocument()
})
```

In this test, we have completely avoided testing any Redux code directly, treating it as an implementation detail. As a result, we are free to re-factor the _implementation_, while our tests will continue to pass and avoid false negatives (tests that fail despite the app still behaving how we want it to). We might change our state structure, convert our slice to use [RTK-Query](https://redux-toolkit.js.org/rtk-query/overview), or remove Redux entirely, and our tests will still pass. We have a strong degree of confidence that if we change some code and our tests report a failure, then our app really _is_ broken.

## Middleware

Middleware functions wrap behavior of `dispatch` calls in Redux, so to test this modified behavior we need to mock the behavior of the `dispatch` call.

#### Example

First, we'll need a middleware function. This is similar to the real [redux-thunk](https://github.com/reduxjs/redux-thunk/blob/master/src/index.ts).

```js
const thunk =
  ({ dispatch, getState }) =>
  next =>
  action => {
    if (typeof action === 'function') {
      return action(dispatch, getState)
    }

    return next(action)
  }
```

We need to create a fake `getState`, `dispatch`, and `next` functions. We use `jest.fn()` to create stubs, but with other test frameworks you would likely use [Sinon](https://sinonjs.org/).

The invoke function runs our middleware in the same way Redux does.

```js
const create = () => {
  const store = {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn()
  }
  const next = jest.fn()

  const invoke = action => thunk(store)(next)(action)

  return { store, next, invoke }
}
```

We test that our middleware is calling the `getState`, `dispatch`, and `next` functions at the right time.

```js
test('passes through non-function action', () => {
  const { next, invoke } = create()
  const action = { type: 'TEST' }
  invoke(action)
  expect(next).toHaveBeenCalledWith(action)
})

test('calls the function', () => {
  const { invoke } = create()
  const fn = jest.fn()
  invoke(fn)
  expect(fn).toHaveBeenCalled()
})

test('passes dispatch and getState', () => {
  const { store, invoke } = create()
  invoke((dispatch, getState) => {
    dispatch('TEST DISPATCH')
    getState()
  })
  expect(store.dispatch).toHaveBeenCalledWith('TEST DISPATCH')
  expect(store.getState).toHaveBeenCalled()
})
```

In some cases, you will need to modify the `create` function to use different mock implementations of `getState` and `next`.

## Further Information

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro): React Testing Library is a very light-weight solution for testing React components. It provides light utility functions on top of react-dom and react-dom/test-utils, in a way that encourages better testing practices. Its primary guiding principle is: "The more your tests resemble the way your software is used, the more confidence they can give you."

- [React Test Utils](https://reactjs.org/docs/test-utils.html): ReactTestUtils makes it easy to test React components in the testing framework of your choice. React Testing Library uses the `act` function exported by React Test Utils.

- [Blogged Answers: The Evolution of Redux Testing Approaches](https://blog.isquaredsoftware.com/2021/06/the-evolution-of-redux-testing-approaches/): Mark Erikson's thoughts on how Redux testing has evolved from 'isolation' to 'integration'.

- [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details): Blog post by Kent C. Dodds on why he recommends to avoid testing implementation details.
