import expect from 'expect';
import Redux from '../src/Redux';

const fakeState = { foo: 'bar' };

function fakeStore() {
  return fakeState;
}

describe('Redux', () => {

  let redux;

  beforeEach(() => {
    redux = new Redux({ fakeStore });
  });

  it('should correctly initialize', () => {
    expect(redux.state).toEqual({ fakeStore: fakeState });
    expect(redux.listeners).toEqual([]);
    expect(redux.dispatcher).toBeA('function');
    expect(redux.dispatchFn).toBeA('function');
  });

  it('should subscribe to changes', done => {
    redux.subscribe(() => {
      const state = redux.getState();
      expect(state).toEqual(fakeState);
      done();
    });
    redux.setState(fakeState);
  });

  it('should unsubscribe a listener', () => {
    const changeListenerSpy = expect.createSpy(() => {});
    const unsubscribe = redux.subscribe(changeListenerSpy);

    expect(changeListenerSpy.calls.length).toBe(0);

    redux.setState(fakeState);

    expect(changeListenerSpy.calls.length).toBe(1);

    unsubscribe();
    expect(changeListenerSpy.calls.length).toBe(1);
  });
});
