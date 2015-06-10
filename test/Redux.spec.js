import expect from 'expect';
import Redux from '../src/Redux';

const initialState = {};
const fakeState = { foo: 'bar' };

function fakeStore(state = initialState, action) {
  const { type } = action;
  if (type === 'FOO') {
    return action.body;
  }
  return state;
}

function foo() {
  return {
    type: 'FOO',
    body: fakeState
  };
}

describe('Redux', () => {

  let redux;

  beforeEach(() => {
    redux = new Redux({ fakeStore });
  });

  it('should correctly initialize', () => {
    expect(redux.state).toEqual({ fakeStore: {} });
    expect(redux.listeners).toEqual([]);
    expect(redux.dispatcher).toBeA('function');
    expect(redux.dispatchFn).toBeA('function');
  });

  it('should subscribe to changes', done => {
    let state = redux.getState();
    expect(state.fakeStore).toEqual({});
    redux.subscribe(() => {
      state = redux.getState();
      expect(state.fakeStore).toEqual(fakeState);
      done();
    });
    redux.dispatch(foo());
  });

  it('should unsubscribe a listener', () => {
    const changeListenerSpy = expect.createSpy(() => {});
    const unsubscribe = redux.subscribe(changeListenerSpy);

    expect(changeListenerSpy.calls.length).toBe(0);

    redux.setState(fakeState);
    expect(changeListenerSpy.calls.length).toBe(1);

    unsubscribe();
    redux.setState(fakeState);
    expect(changeListenerSpy.calls.length).toBe(1);
  });
});
