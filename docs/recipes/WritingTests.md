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
    props: props,
    output: output,
    renderer: renderer
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

    it('should call call addTodo if length of text is greater than 0', () => {
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

### Glossary

- [React Test Utils](http://facebook.github.io/react/docs/test-utils.html): Test utilities that ship with React.

- [jsdom](https://github.com/tmpvar/jsdom): An in-JavaScript implementation of the DOM. Jsdom allows us to run the tests without browser.

- [Shallow rendering](http://facebook.github.io/react/docs/test-utils.html#shallow-rendering): The main idea of shallow rendering is to instantiate a component and get the result of its `render` method just a single level deep instead of rendering into a DOM. The result of shallow rendering is a [ReactElement](https://facebook.github.io/react/docs/glossary.html#react-elements). That means it is possible to access its children, props and test if it works as expected.
