import expect from 'expect';
import { createDispatcher, composeStores } from '../src';
import thunkMiddleware from '../src/middleware/thunk';
import * as helpers from './_helpers';

const { constants, defaultText, todoActions, todoStore } = helpers;
const { addTodo, addTodoAsync } = todoActions;
const { ADD_TODO } = constants;

describe('createDispatcher', () => {

  it('should handle sync and async dispatches', done => {
    const spy = expect.createSpy(
      nextState => nextState
    ).andCallThrough();

    const dispatcher = createDispatcher(
      composeStores({ todoStore }),
      // we need this middleware to handle async actions
      getState => [thunkMiddleware(getState)]
    );

    expect(dispatcher).toBeA('function');

    const dispatchFn = dispatcher(undefined, spy);
    expect(spy.calls.length).toBe(1);
    expect(spy).toHaveBeenCalledWith({ todoStore: [] });

    const addTodoAction = dispatchFn(addTodo(defaultText));
    expect(addTodoAction).toEqual({ type: ADD_TODO, text: defaultText });
    expect(spy.calls.length).toBe(2);
    expect(spy).toHaveBeenCalledWith({ todoStore: [
      { id: 1, text: defaultText }
    ] });

    dispatchFn(addTodoAsync(('Say hi!'), () => {
      expect(spy.calls.length).toBe(3);
      expect(spy).toHaveBeenCalledWith({ todoStore: [
        { id: 2, text: 'Say hi!' },
        { id: 1, text: defaultText }
      ] });
      done();
    }));
  });
});
