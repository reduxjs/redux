import expect from 'expect';
import * as actions from '../../actions/counter';

describe('actions', () => {
  it('increment should create increment action', () => {
    expect(actions.increment()).toEqual({ type: actions.INCREMENT_COUNTER });
  });

  it('decrement should create decrement action', () => {
    expect(actions.decrement()).toEqual({ type: actions.DECREMENT_COUNTER });
  });

  it('incrementIfOdd should create increment action', () => {
    const fn = actions.incrementIfOdd();
    expect(fn).toBeA('function');
    const dispatch = expect.createSpy();
    const getState = () => ({ counter: 1 });
    fn(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith({ type: actions.INCREMENT_COUNTER });
  });

  it('incrementIfOdd shouldnt create increment action if counter is even', () => {
    const fn = actions.incrementIfOdd();
    const dispatch = expect.createSpy();
    const getState = () => ({ counter: 2 });
    fn(dispatch, getState);
    expect(dispatch.calls.length).toBe(0);
  });

  // There's no nice way to test this at the moment...
  it('incrementAsync', (done) => {
    const fn = actions.incrementAsync(1);
    expect(fn).toBeA('function');
    const dispatch = expect.createSpy();
    fn(dispatch);
    setTimeout(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: actions.INCREMENT_COUNTER });
      done();
    }, 5);
  });
});
