import expect from 'expect';
import { bindActionCreators, createStore } from '../../src';
import { todos } from '../helpers/reducers';
import * as actionCreators from '../helpers/actionCreators';

describe('bindActionCreators', () => {
  let store;

  beforeEach(() => {
    store = createStore(todos);
  });

  it('should wrap the action creators with the dispatch function', () => {
    const boundActionCreators = bindActionCreators(actionCreators, store.dispatch);
    expect(
      Object.keys(boundActionCreators)
    ).toEqual(
      Object.keys(actionCreators)
    );

    const action = boundActionCreators.addTodo('Hello');
    expect(action).toEqual(
      actionCreators.addTodo('Hello')
    );
    expect(store.getState()).toEqual([
      { id: 1, text: 'Hello' }
    ]);
  });
});
