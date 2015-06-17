import expect from 'expect';
import { createDispatcher, composeStores } from '../src';
import thunkMiddleware from '../src/middleware/thunk';
import * as helpers from './_helpers';

const { constants, defaultText, todoActions, todoStore } = helpers;
const { addTodo, addTodoAsync } = todoActions;
const { ADD_TODO } = constants;

describe('createDispatcher', () => {
  it('should handle sync and async dispatches', done => {
    const dispatcher = createDispatcher(
      composeStores({ todoStore }),
      // we need this middleware to handle async actions
      ({ _getState, _dispatch }) => [thunkMiddleware(_getState, _dispatch)]
    );

    expect(dispatcher).toBeA('function');

    // Mock Redux interface
    let state, dispatchFn;
    const getState = () => state;
    const dispatch = action => dispatchFn(action);
    const setState = newState => state = newState;

    dispatchFn = dispatcher({ getState, setState, dispatch });
    dispatchFn({}); // Initial dispatch
    expect(state).toEqual({ todoStore: [] });

    const addTodoAction = dispatchFn(addTodo(defaultText));
    expect(addTodoAction).toEqual({ type: ADD_TODO, text: defaultText });
    expect(state).toEqual({ todoStore: [
      { id: 1, text: defaultText }
    ] });

    dispatchFn(addTodoAsync(('Say hi!'), () => {
      expect(state).toEqual({ todoStore: [
        { id: 2, text: 'Say hi!' },
        { id: 1, text: defaultText }
      ] });
      done();
    }));
  });
});
