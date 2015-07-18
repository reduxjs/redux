import expect from 'expect';
import { bindActionCreators } from 'redux';
import createCounterStore from '../../store/createCounterStore';
import * as CounterActions from '../../actions/CounterActions';

describe('actions', () => {
  let store;
  let actions;

  beforeEach(() => {
    store = createCounterStore();
    actions = bindActionCreators(CounterActions, store.dispatch);
  });

  it('increment', () => {
    actions.increment();
    expect(store.getState().counter).toBe(1);
  });

  it('incrementAsync', (done) => {
    store.subscribe(() => {
      expect(store.getState().counter).toBe(1);
      done();
    });
    actions.incrementAsync();
  });
});

