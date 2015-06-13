import expect from 'expect';
import { bindActionCreators, createRedux } from '../../src';
import * as helpers from '../_helpers';

const { todoActions, todoStore } = helpers;

describe('Utils', () => {
  describe('bindActionCreators', () => {

    let redux;

    beforeEach(() => {
      redux = createRedux({ todoStore });
    });

    it('should bind given actions to the dispatcher', done => {
      let expectedCallCount = 2;
      // just for monitoring the dispatched actions
      redux.subscribe(() => {
        expectedCallCount--;
        if (expectedCallCount === 0) {
          const state = redux.getState();
          expect(state.todoStore).toEqual([
            { id: 2, text: 'World' },
            { id: 1, text: 'Hello' }
          ]);
          done();
        }
      });
      const actions = bindActionCreators(todoActions, redux.dispatch);
      expect(Object.keys(actions)).toEqual(Object.keys(todoActions));

      actions.addTodo('Hello');
      actions.addTodoAsync('World');
    });
  });
});
