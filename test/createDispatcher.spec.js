import expect from 'expect';
import { createDispatcher, composeStores } from '../src';
import thunkMiddleware from '../src/middleware/thunk';

const fakeState = { foo: 'bar' };
const fakeAction = { type: 'FOO', foo: 'bar' };
const fakeActionAsync = { type: 'FOO_ASYNC', fooAsync: 'barAsync' };

function fakeStore(state = fakeState, action) {
  const { type } = action;
  if (type === 'FOO') {
    return action.foo;
  }
  if (type === 'FOO_ASYNC') {
    return action.fooAsync;
  }
  return state;
}

function foo() {
  return fakeAction;
}

function fooAsync(cb/* for testing only */) {
  return dispatch => {
    setImmediate(() => {
      dispatch(fakeActionAsync);
      cb();
    });
  };
}

describe('createDispatcher', () => {

  it('should handle sync and async dispatches', done => {
    const spy = expect.createSpy(() => {});
    const dispatcher = createDispatcher(
      composeStores({ fakeStore }),
      getState => [thunkMiddleware(getState)]);
    expect(dispatcher).toBeA('function');

    const dispatchFn = dispatcher(fakeState, spy);
    expect(spy).toHaveBeenCalledWith({ fakeStore: fakeState });

    const fooAction = dispatchFn(foo());
    expect(fooAction).toEqual(fakeAction);
    expect(spy.calls.length).toBe(2);
    expect(spy).toHaveBeenCalledWith({ fakeStore: 'bar' });

    dispatchFn(fooAsync(() => {
      expect(spy.calls.length).toBe(3);
      expect(spy).toHaveBeenCalledWith({ fakeStore: 'barAsync' });
      done();
    }));
  });
});
