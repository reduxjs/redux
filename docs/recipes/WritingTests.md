# Writing tests

Because most of the Redux code you write are functions, and many of them are pure, they are easy test without mocking.

### Setting Up

We recommend [Mocha](http://mochajs.org/) as the testing engine.  
Note that it runs in a Node environment, so you won’t have access to DOM.

```
npm install --save-dev mocha
```

To use it together with [Babel](http://babeljs.io), add this to `scripts` in your `package.json`:

```js
{
  ...
  "scripts": {
    ...
    "test": "mocha --compilers js:babel/register --recursive",
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
  };
}
```
can be tested like:

```js
import expect from 'expect';
import * as actions from '../../actions/TodoActions';
import * as types from '../../constants/ActionTypes';

describe('actions', () => {
  it('should create an action to add a todo', () => {
    const text = 'Finish docs';
    const expectedAction = {
      type: types.ADD_TODO,
      text
    };
    expect(actions.addTodo(text)).toEqual(expectedAction);
  });
}
```

### Reducers

A reducer should return the new state after applying the action to the previous state, and that’s the behavior tested below.

#### Example  

```js
import { ADD_TODO } from '../constants/ActionTypes';

const initialState = [{
  text: 'Use Redux',
  completed: false,
  id: 0
}];

export default function todos(state = initialState, action) {
  switch (action.type) {
  case ADD_TODO:
    return [{
      id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
      completed: false,
      text: action.text
    }, ...state];

  default:
    return state;
  }
}
```
can be tested like:

```js
import expect from 'expect';
import reducer from '../../reducers/todos';
import * as types from '../../constants/ActionTypes';

describe('todos reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual([{
      text: 'Use Redux',
      completed: false,
      id: 0
    }]);
  });

  it('should handle ADD_TODO', () => {
    expect(
      reducer([], {
        type: types.ADD_TODO,
        text: 'Run the tests'
      })
    ).toEqual([{
      text: 'Run the tests',
      completed: false,
      id: 0
    }]);

    expect(
      reducer([{
        text: 'Use Redux',
        completed: false,
        id: 0
      }], {
        type: types.ADD_TODO,
        text: 'Run the tests'
      })
    ).toEqual([{
      text: 'Run the tests',
      completed: false,
      id: 1
    }, {
      text: 'Use Redux',
      completed: false,
      id: 0
    }]);
  });
```

### Components

A nice thing about React components is that they are usually small and only rely on their props. That makes them easy to test.

To test the components we make a `setup()` helper that passes the stubbed callbacks as props and renders the component with [React shallow renderer](https://facebook.github.io/react/docs/test-utils.html#shallow-rendering). This lets individual tests assert on whether the callbacks were called when expected.

#### Example

```js
import React, { PropTypes, Component } from 'react';
import TodoTextInput from './TodoTextInput';

class Header extends Component {
  handleSave(text) {
    if (text.length !== 0) {
      this.props.addTodo(text);
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
    );
  }
}

Header.propTypes = {
  addTodo: PropTypes.func.isRequired
};

export default Header;
```

can be tested like:

```js
import expect from 'expect';
import jsdomReact from '../jsdomReact';
import React from 'react/addons';
import Header from '../../components/Header';
import TodoTextInput from '../../components/TodoTextInput';

const { TestUtils } = React.addons;

function setup() {
  let props = {
    addTodo: expect.createSpy()
  };

  let renderer = TestUtils.createRenderer();
  renderer.render(<Header {...props} />);
  let output = renderer.getRenderOutput();

  return {
    props,
    output,
    renderer
  };
}

describe('components', () => {
  jsdomReact();

  describe('Header', () => {
    it('should render correctly', () => {
      const { output } = setup();

      expect(output.type).toBe('header');
      expect(output.props.className).toBe('header');

      let [h1, input] = output.props.children;

      expect(h1.type).toBe('h1');
      expect(h1.props.children).toBe('todos');

      expect(input.type).toBe(TodoTextInput);
      expect(input.props.newTodo).toBe(true);
      expect(input.props.placeholder).toBe('What needs to be done?');
    });

    it('should call addTodo if length of text is greater than 0', () => {
      const { output, props } = setup();
      let input = output.props.children[1];
      input.props.onSave('');
      expect(props.addTodo.calls.length).toBe(0);
      input.props.onSave('Use Redux');
      expect(props.addTodo.calls.length).toBe(1);
    });
  });
});
```

#### Fixing Broken `setState()`

Shallow rendering currently [throws an error if `setState` is called](https://github.com/facebook/react/issues/4019). React seems to expect that, if you use `setState`, DOM is available. To work around the issue, we use jsdom so React doesn’t throw the exception when DOM isn’t available. Here’s how to set it up:

```
npm install --save-dev jsdom mocha-jsdom
```

Then add a `jsdomReact()` helper function that looks like this:  

```js
import ExecutionEnvironment from 'react/lib/ExecutionEnvironment';
import jsdom from 'mocha-jsdom';

export default function jsdomReact() {
  jsdom();
  ExecutionEnvironment.canUseDOM = true;
}
```

Call it before running any component tests. Note this is a dirty workaround, and it can be removed once [facebook/react#4019](https://github.com/facebook/react/issues/4019) is fixed.

### Connected Components

In order to achieve separation of concerns and create reusable components, we often wrap one component inside another using decorators. For example, consider the `App` component:

```js
import { connect } from 'react-redux';

class App extends Component { /* ... */ }
export default connect(mapStateToProps)(App);
```

In a unit test, you would normally import the class like this:

```js
import App from './App';
```

However when you import the component, you’re actually holding the wrapper component returned by `connect()`, and not the `App` component itself. If you want to test its interaction with Redux, this is good news: you can wrap it in a [`<Provider>`](https://github.com/rackt/react-redux#provider-store) with a store created specifically for this unit test. But sometimes you want to test just the rendering of the component, without a Redux store.

In order to be able to test the App component itself without having to deal with the decorator, we recommend you to also export the undecorated component:

```js
import { connect } from 'react-redux';

// Use named export for unconnected component (for tests)
export class App extends Component { /* ... */ }

// Use default export for the connected component (for app)
export default connect(mapDispatchToProps)(App);
```

Since the default export is still the decorated component, the import statement pictured above will work as before so you won’t have to change your application code. However, you can now import the undecorated `App` components in your test file like this:

```js
// Note the curly brances: grab the named export instead of default export
import { App } from './App';
```

And if you need both:

```js
import ConnectedApp, { App } from './App';
```

>##### A Note on Mixing ES6 Modules and CommonJS

>If you are using ES6 in your application source, but write your tests in ES5, you should know that Babel handles the interchangeable use of ES6 `import` and CommonJS `require` through its [interop](http://babeljs.io/docs/usage/modules/#interop) capability to run two module formats side-by-side, but the behavior is [slightly different](https://github.com/babel/babel/issues/2047). If you add a second export beside your default export, you can no longer import the default using `require('./App')`. Instead you have to use `require('./App').default`.

### Glossary

- [React Test Utils](http://facebook.github.io/react/docs/test-utils.html): Test utilities that ship with React.

- [jsdom](https://github.com/tmpvar/jsdom): An in-JavaScript implementation of the DOM. Jsdom allows us to run the tests without browser.

- [Shallow rendering](http://facebook.github.io/react/docs/test-utils.html#shallow-rendering): The main idea of shallow rendering is to instantiate a component and get the result of its `render` method just a single level deep instead of rendering into a DOM. The result of shallow rendering is a [ReactElement](https://facebook.github.io/react/docs/glossary.html#react-elements). That means it is possible to access its children, props and test if it works as expected.
