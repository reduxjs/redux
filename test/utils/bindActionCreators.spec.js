import expect from 'expect';
import { bindActionCreators, createRedux } from '../../src';

const fakeState = { foo: 'bar' };

function fakeStore(state = 0, action) {
  if (action.type) {
    return fakeState;
  }
  return state;
}

const fakeActionCreators = {
  foo() {
    return { type: 'FOO' };
  },
  fooAsync() {
    return dispatch => {
      setImmediate(() => {
        dispatch({ type: 'FOO_ASYNC' });
      });
    };
  }
};

describe('Utils', () => {
  describe('bindActionCreators', () => {

    let redux;

    beforeEach(() => {
      redux = createRedux({ fakeStore });
    });

    it('should bind given actions to the dispatcher', done => {
      let expectedCallCount = 2;
      // Let us subscribe to monitor the dispatched actions
      redux.subscribe(() => {
        expectedCallCount--;
        const state = redux.getState();

        expect(state.fakeStore).toEqual(fakeState);
        if (expectedCallCount === 0) { done(); }
      });
      const actions = bindActionCreators(fakeActionCreators, redux.dispatch);
      expect(Object.keys(actions))
        .toEqual(Object.keys(fakeActionCreators));

      actions.foo();
      actions.fooAsync();
    });
  });
});
