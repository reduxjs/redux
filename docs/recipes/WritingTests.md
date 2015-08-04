# Writing tests
Because most of the Redux code you write are functions, and many of them are pure, they are easy test without mocking.

### Action creators
In Redux action creators are functions which return plain objects. When testing action creators we want to test whether the correct action creator was called and also whether the right action was returned.

#### Example
```javascript
function addTodo(text) {
  return {
    type: 'ADD_TODO'
  };
}
```
can be tested like:

```javascript
import expect from 'expect';
import * as actions from '../../actions/TodoActions';
import * as types from '../../constants/ActionTypes';

describe('actions', () => {

  it('add todo should create add todo action', () => {
    const myTodo = 'Finish docs';
    const expectedAction = {
      type: types.ADD_TODO,
      text: newTodo
    };
    expect(actions.addTodo(myTodo)).toEqual(expectedAction);
  });

}
```


### Reducers
Reducer should return the new state after applying action on the previous state. And that's the behavior tested below.

#### Example  

```javascript
import { ADD_TODO } from '../constants/ActionTypes';

const initialState = [{
  text: 'Use Redux',
  marked: false,
  id: 0
}];

export default function todos(state = initialState, action) {
  switch (action.type) {
  case ADD_TODO:
    return [{
      id: (state.length === 0) ? 0 : state[0].id + 1,
      marked: false,
      text: action.text
    }, ...state];

  default:
    return state;
  }
}
```
can be tested like:

```javascript
import expect from 'expect';
import reducer from '../../reducers/todos';
import * as types from '../../constants/ActionTypes';

describe('todos reducer', () => {

  it('should handle initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual([{
      text: 'Use Redux',
      marked: false,
      id: 0
    }]);
  });

  it('should handle ADD_TODO', () => {
    expect(
      reducer([], {
        type: types.ADD_TODO,
        text: 'Run the tests'
      })
    ).toEqual([
      {
      text: 'Run the tests',
      marked: false,
      id: 0
    }]);

    expect(
      reducer([{
        text: 'Use Redux',
        marked: false,
        id: 0
      }], {
        type: types.ADD_TODO,
        text: 'Run the tests'
      })
    ).toEqual([{
      text: 'Run the tests',
      marked: false,
      id: 1
    }, {
      text: 'Use Redux',
      marked: false,
      id: 0
    }]);
  });
```


### Components
Very good thing about React components is that they are usually small and are mostly relying on props. That makes them easy to test.
To test components we first make a setup in which we include:
props and shallow renderer. And later on check if they render correctly and if the functionality works as it supposed to.

#### Example

```javascript
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

```javascript
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

**Note:** Shallow rendering currently [throws an error if `setState` is called](https://github.com/facebook/react/issues/4019). React seems to expect that, if you use `setState`, DOM is available. To work around the issue, we use jsdom so React doesn’t throw the exception when DOM isn’t available. Here’s how to set it up:

1. `npm install --save-dev jsdom`
2. Add `jsdomReact` helper function that looks like this:  
   ```javascript
   import ExecutionEnvironment from 'react/lib/ExecutionEnvironment';
   import jsdom from 'mocha-jsdom';

   export default function jsdomReact() {
      jsdom();
      ExecutionEnvironment.canUseDOM = true;
   }

   ```
3. Call it before every test


### Glossary
- [React Test Utils](http://facebook.github.io/react/docs/test-utils.html) - test utilities.
- [jsdom](https://github.com/tmpvar/jsdom) - is an in-JavaScript implementation of the DOM. Jsdom allows us to run the tests without browser.
- [Shallow rendering](http://facebook.github.io/react/docs/test-utils.html#shallow-rendering) - the main concept of shallow rendering is to instantiate a component and get the result of its `render` method instead of rendering into a DOM. The result of shallow rendering is a [ReactElement](https://facebook.github.io/react/docs/glossary.html#react-elements) that means it is possible to access its children, props and test if it works as expected.
