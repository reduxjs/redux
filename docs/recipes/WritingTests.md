# Writing Tests

Because most of the Redux code you write are functions, and many of them are pure, they are easy to test without mocking.

### Setting Up

We recommend [Jest](http://facebook.github.io/jest/) as the testing engine.
Note that it runs in a Node environment, so you won't have access to the DOM.

```
npm install --save-dev jest
```

To use it together with [Babel](http://babeljs.io), you will need to install `babel-jest`:

```
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
    fetchMock.reset()
    fetchMock.restore()
  })

  it('creates FETCH_TODOS_SUCCESS when fetching todos has been done', () => {
    fetchMock
      .getOnce('/todos', { body: { todos: ['do something'] }, headers: { 'content-type': 'application/json' } })


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
import reducer from '../../reducers/todos'
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

First, we will install [Enzyme](http://airbnb.io/enzyme/). Enzyme uses the [React Test Utilities](https://facebook.github.io/react/docs/test-utils.html) underneath, but is more convenient, readable, and powerful.

```
npm install --save-dev enzyme
```

We will also need to install Enzyme adapter for our version of React. Enzyme has adapters that provide compatibility with `React 16.x`, `React 15.x`, `React 0.14.x` and `React 0.13.x`. If you are using React 16 you can run:

```
npm install --save-dev enzyme-adapter-react-16
```

To test the components we make a `setup()` helper that passes the stubbed callbacks as props and renders the component with [shallow rendering](http://airbnb.io/enzyme/docs/api/shallow.html). This lets individual tests assert on whether the callbacks were called when expected.

#### Example

```js
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TodoTextInput from './TodoTextInput'

class Header extends Component {
  handleSave(text) {
    if (text.length !== 0) {
      this.props.addTodo(text)
    }
  }

  render() {
    return (
      <header className="header">
        <h1>todos</h1>
        <TodoTextInput
          newTodo={true}
          onSave={this.handleSave.bind(this)}
          placeholder="What needs to be done?"
        />
      </header>
    )
  }
}

Header.propTypes = {
  addTodo: PropTypes.func.isRequired
}

export default Header
```

can be tested like:

```js
import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
import Header from '../../components/Header'

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const props = {
    addTodo: jest.fn()
  }

  const enzymeWrapper = mount(<Header {...props} />)

  return {
    props,
    enzymeWrapper
  }
}

describe('components', () => {
  describe('Header', () => {
    it('should render self and subcomponents', () => {
      const { enzymeWrapper } = setup()

      expect(enzymeWrapper.find('header').hasClass('header')).toBe(true)

      expect(enzymeWrapper.find('h1').text()).toBe('todos')

      const todoInputProps = enzymeWrapper.find('TodoTextInput').props()
      expect(todoInputProps.newTodo).toBe(true)
      expect(todoInputProps.placeholder).toEqual('What needs to be done?')
    })

    it('should call addTodo if length of text is greater than 0', () => {
      const { enzymeWrapper, props } = setup()
      const input = enzymeWrapper.find('TodoTextInput')
      input.props().onSave('')
      expect(props.addTodo.mock.calls.length).toBe(0)
      input.props().onSave('Use Redux')
      expect(props.addTodo.mock.calls.length).toBe(1)
    })
  })
})
```

### Connected Components

If you use a library like [React Redux](https://github.com/reduxjs/react-redux), you might be using [higher-order components](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750) like [`connect()`](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options). This lets you inject Redux state into a regular React component.

Consider the following `App` component:

```js
import { connect } from 'react-redux'

class App extends Component { /* ... */ }

export default connect(mapStateToProps)(App)
```

In a unit test, you would normally import the `App` component like this:

```js
import App from './App'
```

However, when you import it, you're actually holding the wrapper component returned by `connect()`, and not the `App` component itself. If you want to test its interaction with Redux, this is good news: you can wrap it in a [`<Provider>`](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#provider-store) with a store created specifically for this unit test. But sometimes you want to test just the rendering of the component, without a Redux store.

In order to be able to test the App component itself without having to deal with the decorator, we recommend you to also export the undecorated component:

```js
import { connect } from 'react-redux'

// Use named export for unconnected component (for tests)
export class App extends Component { /* ... */ }

// Use default export for the connected component (for app)
export default connect(mapStateToProps)(App)
```

Since the default export is still the decorated component, the import statement pictured above will work as before so you won't have to change your application code. However, you can now import the undecorated `App` components in your test file like this:

```js
// Note the curly braces: grab the named export instead of default export
import { App } from './App'
```

And if you need both:

```js
import ConnectedApp, { App } from './App'
```

In the app itself, you would still import it normally:

```js
import App from './App'
```

You would only use the named export for tests.

>##### A Note on Mixing ES6 Modules and CommonJS

>If you are using ES6 in your application source, but write your tests in ES5, you should know that Babel handles the interchangeable use of ES6 `import` and CommonJS `require` through its [interop](http://babeljs.io/docs/usage/modules/#interop) capability to run two module formats side-by-side, but the behavior is [slightly different](https://github.com/babel/babel/issues/2047). If you add a second export beside your default export, you can no longer import the default using `require('./App')`. Instead you have to use `require('./App').default`.

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

We need to create a fake `getState`, `dispatch`, and `next` functions. We use `jest.fn()` to create stubs, but with other test frameworks you would likely use sinon.

The invoke function runs our middleware in the same way Redux does.

```js
const create = () => {
  const store = {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn(),
  };
  const next = jest.fn()

  const invoke = (action) => thunk(store)(next)(action)

  return {store, next, invoke}
};
```

We test that our middleware is calling the `getState`, `dispatch`, and `next` functions at the right time.

```js
it('passes through non-function action', () => {
  const { next, invoke } = create()
  const action = {type: 'TEST'}
  invoke(action)
  expect(next).toHaveBeenCalledWith(action)
})

it('calls the function', () => {
  const { invoke } = create()
  const fn = jest.fn()
  invoke(fn)
  expect(fn).toHaveBeenCalled()
});

it('passes dispatch and getState', () => {
  const { store, invoke } = create()
  invoke((dispatch, getState) => {
    dispatch('TEST DISPATCH')
    getState();
  })
  expect(store.dispatch).toHaveBeenCalledWith('TEST DISPATCH')
  expect(store.getState).toHaveBeenCalled()
});
```

In some cases, you will need to modify the `create` function to use different mock implementations of `getState` and `next`.

### Glossary

- [Enzyme](http://airbnb.io/enzyme/): Enzyme is a JavaScript Testing utility for React that makes it easier to assert, manipulate, and traverse your React Components' output.

- [React Test Utils](http://facebook.github.io/react/docs/test-utils.html): Test Utilities for React. Used by Enzyme.

- [Shallow rendering](http://airbnb.io/enzyme/docs/api/shallow.html): Shallow rendering lets you instantiate a component and effectively get the result of its `render` method just a single level deep instead of rendering components recursively to a DOM. Shallow rendering is useful for unit tests, where you test a particular component only, and importantly not its children. This also means that changing a child component won't affect the tests for the parent component. Testing a component and all its children can be accomplished with [Enzyme's `mount()` method](http://airbnb.io/enzyme/docs/api/mount.html), aka full DOM rendering.
