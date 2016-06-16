# Writing Tests

Because most of the Redux code you write are functions, and many of them are pure, they are easy to test without mocking.

### Setting Up

We recommend [Mocha](http://mochajs.org/) as the testing engine.
Note that it runs in a Node environment, so you won’t have access to the DOM.

```
npm install --save-dev mocha
```

To use it together with [Babel](http://babeljs.io), you will need to install `babel-register`:

```js
npm install --save-dev babel-register
```

and configure it to use ES2015 features in `.babelrc`:

```js
{
  "presets": ["es2015"]
}
```

Then, add this to `scripts` in your `package.json`:

```js
{
  ...
  "scripts": {
    ...
    "test": "mocha --compilers js:babel-register --recursive",
    "test:watch": "npm test -- --watch",
  },
  ...
}
```

and run `npm test` to run it once, or `npm run test:watch` to test on every file change.

### Action Creators

In Redux, action creators are functions which return plain objects. When testing action creators we want to test whether the correct action creator was called and also whether the right action was returned.

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
import expect from 'expect'
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

For async action creators using [Redux Thunk](https://github.com/gaearon/redux-thunk) or other middleware, it’s best to completely mock the Redux store for tests. You can apply the middleware to a mock store using [redux-mock-store](https://github.com/arnaudbenard/redux-mock-store). You can also use [nock](https://github.com/pgte/nock) to mock the HTTP requests.

#### Example

```js
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
      .then(json => dispatch(fetchTodosSuccess(json.body)))
      .catch(ex => dispatch(fetchTodosFailure(ex)))
  }
}
```

can be tested like:

```js
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../../actions/counter'
import * as types from '../../constants/ActionTypes'
import nock from 'nock'
import expect from 'expect' // You can use any testing library

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

describe('async actions', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('creates FETCH_TODOS_SUCCESS when fetching todos has been done', () => {
    nock('http://example.com/')
      .get('/todos')
      .reply(200, { body: { todos: ['do something'] }})

    const expectedActions = [
      { type: types.FETCH_TODOS_REQUEST },
      { type: types.FETCH_TODOS_SUCCESS, body: { todos: ['do something']  } }
    ]
    const store = mockStore({ todos: [] })

    return store.dispatch(actions.fetchTodos())
      .then(() => { // return of async actions
        expect(store.getActions()).toEqual(expectedActions)
      })
  })
})
```

### Reducers

A reducer should return the new state after applying the action to the previous state, and that’s the behavior tested below.

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
import expect from 'expect'
import reducer from '../../reducers/todos'
import * as types from '../../constants/ActionTypes'

describe('todos reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual([
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
    ).toEqual(
      [
        {
          text: 'Run the tests',
          completed: false,
          id: 0
        }
      ]
    )

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
    ).toEqual(
      [
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
      ]
    )
  })
})
```

### Components

A nice thing about React components is that they are usually small and only rely on their props. That makes them easy to test.

First, we will install [React Test Utilities](https://facebook.github.io/react/docs/test-utils.html):

```
npm install --save-dev react-addons-test-utils
```

To test the components we make a `setup()` helper that passes the stubbed callbacks as props and renders the component with [React shallow renderer](https://facebook.github.io/react/docs/test-utils.html#shallow-rendering). This lets individual tests assert on whether the callbacks were called when expected.

#### Example

```js
import React, { PropTypes, Component } from 'react'
import TodoTextInput from './TodoTextInput'

class Header extends Component {
  handleSave(text) {
    if (text.length !== 0) {
      this.props.addTodo(text)
    }
  }

  render() {
    return (
      <header className='header'>
          <h1>todos</h1>
          <TodoTextInput newTodo={true}
                         onSave={this.handleSave.bind(this)}
                         placeholder='What needs to be done?' />
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
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Header from '../../components/Header'
import TodoTextInput from '../../components/TodoTextInput'

function setup() {
  let props = {
    addTodo: expect.createSpy()
  }

  let renderer = TestUtils.createRenderer()
  renderer.render(<Header {...props} />)
  let output = renderer.getRenderOutput()

  return {
    props,
    output,
    renderer
  }
}

describe('components', () => {
  describe('Header', () => {
    it('should render correctly', () => {
      const { output } = setup()

      expect(output.type).toBe('header')
      expect(output.props.className).toBe('header')

      let [ h1, input ] = output.props.children

      expect(h1.type).toBe('h1')
      expect(h1.props.children).toBe('todos')

      expect(input.type).toBe(TodoTextInput)
      expect(input.props.newTodo).toBe(true)
      expect(input.props.placeholder).toBe('What needs to be done?')
    })

    it('should call addTodo if length of text is greater than 0', () => {
      const { output, props } = setup()
      let input = output.props.children[1]
      input.props.onSave('')
      expect(props.addTodo.calls.length).toBe(0)
      input.props.onSave('Use Redux')
      expect(props.addTodo.calls.length).toBe(1)
    })
  })
})
```

#### Fixing Broken `setState()` in older React versions

In React <= 0.13, 0.14.4 and 0.14.5, Shallow rendering [used to throw an error if `setState` is called](https://github.com/facebook/react/issues/4019). React seems to expect that, if you use `setState`, the DOM is available. To work around the issue, we use jsdom so React doesn’t throw the exception when the DOM isn’t available. Here’s how to [set it up](https://github.com/facebook/react/issues/5046#issuecomment-146222515):

```
npm install --save-dev jsdom
```

Then create a `setup.js` file in your test directory:

```js
import { jsdom } from 'jsdom'

global.document = jsdom('<!doctype html><html><body></body></html>')
global.window = document.defaultView
global.navigator = global.window.navigator
```

It’s important that this code is evaluated *before* React is imported. To ensure this, modify your `mocha` command to include `--require ./test/setup.js` in the options in your `package.json`:

```js
{
  ...
  "scripts": {
    ...
    "test": "mocha --compilers js:babel-register --recursive --require ./test/setup.js",
  },
  ...
}
```

### Connected Components

If you use a library like [React Redux](https://github.com/reactjs/react-redux), you might be using [higher-order components](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750) like [`connect()`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options). This lets you inject Redux state into a regular React component.

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

However, when you import it, you’re actually holding the wrapper component returned by `connect()`, and not the `App` component itself. If you want to test its interaction with Redux, this is good news: you can wrap it in a [`<Provider>`](https://github.com/reactjs/react-redux#provider-store) with a store created specifically for this unit test. But sometimes you want to test just the rendering of the component, without a Redux store.

In order to be able to test the App component itself without having to deal with the decorator, we recommend you to also export the undecorated component:

```js
import { connect } from 'react-redux'

// Use named export for unconnected component (for tests)
export class App extends Component { /* ... */ }

// Use default export for the connected component (for app)
export default connect(mapStateToProps)(App)
```

Since the default export is still the decorated component, the import statement pictured above will work as before so you won’t have to change your application code. However, you can now import the undecorated `App` components in your test file like this:

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

```js
import expect from 'expect'
import * as types from '../../constants/ActionTypes'
import singleDispatch from '../../middleware/singleDispatch'

const createFakeStore = fakeData => ({
  getState() {
    return fakeData
  }
})

const dispatchWithStoreOf = (storeData, action) => {
  let dispatched = null
  const dispatch = singleDispatch(createFakeStore(storeData))(actionAttempt => dispatched = actionAttempt)
  dispatch(action)
  return dispatched
}

describe('middleware', () => {
  it('should dispatch if store is empty', () => {
    const action = {
      type: types.ADD_TODO
    }

    expect(
      dispatchWithStoreOf({}, action)
    ).toEqual(action)
  })

  it('should not dispatch if store already has type', () => {
    const action = {
      type: types.ADD_TODO
    }

    expect(
      dispatchWithStoreOf({
        [types.ADD_TODO]: 'dispatched'
      }, action)
    ).toNotExist()
  })
})
```

### Glossary

- [React Test Utils](http://facebook.github.io/react/docs/test-utils.html): Test Utilities for React.

- [jsdom](https://github.com/tmpvar/jsdom): A plain JavaScript implementation of the DOM API. jsdom allows us to run the tests without browser.

- [Shallow rendering](http://facebook.github.io/react/docs/test-utils.html#shallow-rendering): Shallow rendering lets you instantiate a component and get the result of its `render` method just a single level deep instead of rendering components recursively to a DOM. The result of shallow rendering is a [ReactElement](https://facebook.github.io/react/docs/glossary.html#react-elements). That means it is possible to access its children, props and test if it works as expected. This also means that changing a child component won’t affect the tests for parent component.
