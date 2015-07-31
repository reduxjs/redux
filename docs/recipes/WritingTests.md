# Writing tests
Because of Redux's functional nature the testing should be pretty straight forward. The very nice thing about pure functions is that they are so easy to test. Because there is no internal state, there are no state transitions to test. The only testing is to gather the inputs that test for all the boundary conditions, pass each one of them through the function which is being tested and validate the output.

### Action creators
In Redux action creators are functions which return plain object. When testing action creators we want to test whether the correct action creator was called and also whether the right action was returned.

#### Example
```
function increment() {
  return {
    type: 'INCREMENT_COUNTER'
  };
}
```

```
import expect from 'expect';
import * as actions from '../../actions/CounterActions';
import * as types from '../../constants/ActionTypes';

describe('actions', () => {

  it('increment should create increment action', () => {
    expect(actions.increment()).toEqual({ type: types.INCREMENT_COUNTER });
  });

}
```

**TODO:** Async example

### [Reducers](https://github.com/gaearon/redux/blob/rewrite-docs-again/docs/api/combineReducers.md#arguments)


### Components

