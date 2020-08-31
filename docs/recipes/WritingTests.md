---
id: writing-tests
title: Writing Tests
hide_title: true
---

# Writing Tests

Because most of the Redux code you write are functions, and many of them are pure, they are easy to test without mocking.

### Setting Up

We recommend [Jest](http://facebook.github.io/jest/) as the testing engine.
Note that it runs in a Node environment, so you won't have access to the DOM.

```sh
npm install --save-dev jest
```

To use it together with [Babel](http://babeljs.io), you will need to install `babel-jest`:

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

### Action Creators

In Redux, action creators are functions which return plain objects. When testing action creators, we want to test whether the correct action creator was called and also whether the right action was returned.

#### Example

```js
export function addTodo(text) {
  return {
    type: 'ADD_TODO',
    text
  }
}
```

can be tested like:

```js
import * as actions from '../../actions/TodoActions'
import * as types from '../../constants/ActionTypes'

describe('actions', () => {
  it('should create an action to add a todo', () => {
    const text = 'Finish docs'
    const expectedAction = {
      type: types.ADD_TODO,
      text
    }
    expect(actions.addTodo(text)).toEqual(expectedAction)
  })
})
```

### Async Action Creators

For async action creators using [Redux Thunk](https://github.com/gaearon/redux-thunk) or other middleware, it's best to completely mock the Redux store for tests. You can apply the middleware to a mock store using [redux-mock-store](https://github.com/arnaudbenard/redux-mock-store). You can also use [fetch-mock](http://www.wheresrhys.co.uk/fetch-mock/) to mock the HTTP requests.

#### Example

```js
import 'cross-fetch/polyfill'

function fetchTodosRequest() {
  return {
    type: FETCH_TODOS_REQUEST
  }
}

function fetchTodosSuccess(body) {
  return {
    type: FETCH_TODOS_SUCCESS,
    body
  }
}

function fetchTodosFailure(ex) {
  return {
    type: FETCH_TODOS_FAILURE,
    ex
  }
}

export function fetchTodos() {
  return dispatch => {
    dispatch(fetchTodosRequest())
    return fetch('http://example.com/todos')
      .then(res => res.json())
      .then(body => dispatch(fetchTodosSuccess(body)))
      .catch(ex => dispatch(fetchTodosFailure(ex)))
  }
}
```

can be tested like:

```js
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../../actions/TodoActions'
import * as types from '../../constants/ActionTypes'
import fetchMock from 'fetch-mock'
import expect from 'expect' // You can use any testing library

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('async actions', () => {
  afterEach(() => {
    fetchMock.restore()
  })

  it('creates FETCH_TODOS_SUCCESS when fetching todos has been done', () => {
    fetchMock.getOnce('/todos', {
      body: { todos: ['do something'] },
      headers: { 'content-type': 'application/json' }
    })

    const expectedActions = [
      { type: types.FETCH_TODOS_REQUEST },
      { type: types.FETCH_TODOS_SUCCESS, body: { todos: ['do something'] } }
    ]
    const store = mockStore({ todos: [] })

    return store.dispatch(actions.fetchTodos()).then(() => {
      // return of async actions
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
```

### Reducers

A reducer should return the new state after applying the action to the previous state, and that's the behavior tested below.

#### Example

```js
import { ADD_TODO } from '../constants/ActionTypes'

const initialState = [
  {
    text: 'Use Redux',
    completed: false,
    id: 0
  }
]

export default function todos(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        {
          id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
          completed: false,
          text: action.text
        },
        ...state
      ]

    default:
      return state
  }
}
```

can be tested like:

```js
import reducer from '../../structuring-reducers/todos'
import * as types from '../../constants/ActionTypes'

describe('todos reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual([
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ])
  })

  it('should handle ADD_TODO', () => {
    expect(
      reducer([], {
        type: types.ADD_TODO,
        text: 'Run the tests'
      })
    ).toEqual([
      {
        text: 'Run the tests',
        completed: false,
        id: 0
      }
    ])

    expect(
      reducer(
        [
          {
            text: 'Use Redux',
            completed: false,
            id: 0
          }
        ],
        {
          type: types.ADD_TODO,
          text: 'Run the tests'
        }
      )
    ).toEqual([
      {
        text: 'Run the tests',
        completed: false,
        id: 1
      },
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ])
  })
})
```

### Components

A nice thing about React components is that they are usually small and only rely on their props. That makes them easy to test.

First, we will install [React Testing Library](https://testing-library.com/docs/react-testing-library/intro). React Testing Library is a simple and complete React DOM testing utilities that encourage good testing practices. It uses react-dom's `render` function and `act` from react-dom/tests-utils.

```sh
npm install --save-dev @testing-library/react
```

If you are using jest as recommended above, we also recommend installing [jest-dom](https://github.com/testing-library/jest-dom) as it provides a set of custom jest matchers that you can use to extend jest. These will make your tests more declarative, clear to read and to maintain. jest-dom is being used in the examples below.

```sh
npm install --save-dev @testing-library/jest-dom
```

To test the components, we `render` them into the DOM and pass stubbed callbacks as props, then we assert whether the callbacks were called when expected.

#### Example

```js
import React from 'react'
import PropTypes from 'prop-types'
import TodoTextInput from './TodoTextInput'

const Header = ({ addTodo }) => {
  const handleSave = text => {
    if (text.length !== 0) {
      addTodo(text)
    }
  }

  return (
    <header className="header">
      <h1>todos</h1>
      <TodoTextInput
        newTodo={true}
        onSave={handleSave}
        placeholder="What needs to be done?"
      />
    </header>
  )
}

Header.propTypes = {
  addTodo: PropTypes.func.isRequired
}

export default Header
```

can be tested like:

```js
import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import Header from '../../components/Header'

it('should not call addTodo if length of text is 0', () => {
  const mockAddTodo = jest.fn()
  render(<Header addTodo={mockAddTodo} />)

  fireEvent.change(screen.getByPlaceholderText(/what needs to be done/i), {
    target: { value: '' }
  })

  expect(mockAddTodo).toHaveBeenCalledTimes(0)
})

it('should call addTodo if length of text is greater than 0', () => {
  const mockAddTodo = jest.fn()
  render(<Header addTodo={mockAddTodo} />)

  fireEvent.change(screen.getByPlaceholderText(/what needs to be done/i), {
    target: { value: 'Use Redux' }
  })

  expect(mockAddTodo).toHaveBeenCalledTimes(1)
})
```

### Connected Components

If you use a library like [React Redux](https://github.com/reduxjs/react-redux), you might be using [higher-order components](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750) like [`connect()`](https://react-redux.js.org/api/connect). This lets you inject Redux state into a regular React component.

Consider the following `App` component:

```js
import { connect } from 'react-redux'

const App = props => {
  return <div>{props.user}</div>
}

const mapStateToProps = state => {
  return state
}

export default connect(mapStateToProps)(App)
```

To test it, we can use the `wrapper` option in React Testing Library's `render` function and export our own `render` function as explained in React Testing Library's [setup docs](https://testing-library.com/docs/react-testing-library/setup).

Our `render` function can look like this:

```js
// test-utils.js
import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
// Import your own reducer
import reducer from '../reducer'

function render(
  ui,
  {
    initialState,
    store = createStore(reducer, initialState),
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

And our test can use our exported `render` function:

```js
import React from 'react'
// We're using our own custom render function and not RTL's render
// our custom utils also re-export everything from RTL
// so we can import fireEvent and screen here as well
import { render, fireEvent, screen } from '../../test-utils'
import App from '../../containers/App'

it('Renders the connected app with initialState', () => {
  render(<App />, { initialState: { user: 'Redux User' } })

  expect(screen.getByText(/redux user/i)).toBeInTheDocument()
})
```

### Middleware

Middleware functions wrap behavior of `dispatch` calls in Redux, so to test this modified behavior we need to mock the behavior of the `dispatch` call.

#### Example

First, we'll need a middleware function. This is similar to the real [redux-thunk](https://github.com/gaearon/redux-thunk/blob/master/src/index.js).

```js
const thunk = ({ dispatch, getState }) => next => action => {
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
it('passes through non-function action', () => {
  const { next, invoke } = create()
  const action = { type: 'TEST' }
  invoke(action)
  expect(next).toHaveBeenCalledWith(action)
})

it('calls the function', () => {
  const { invoke } = create()
  const fn = jest.fn()
  invoke(fn)
  expect(fn).toHaveBeenCalled()
})

it('passes dispatch and getState', () => {
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

### Glossary

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro): React Testing Library is a very light-weight solution for testing React components. It provides light utility functions on top of react-dom and react-dom/test-utils, in a way that encourages better testing practices. Its primary guiding principle is: "The more your tests resemble the way your software is used, the more confidence they can give you."

- [React Test Utils](https://reactjs.org/docs/test-utils.html): ReactTestUtils makes it easy to test React components in the testing framework of your choice. React Testing Library uses the `act` function exported by React Test Utils.
