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


**TODO:** add async example

### [Reducers](https://github.com/gaearon/redux/blob/rewrite-docs-again/docs/api/combineReducers.md#arguments)
Reducer should return the new state after applying action on the previous state.

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

TODO

