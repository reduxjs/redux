import {
  Middleware, MiddlewareAPI,
  applyMiddleware, createStore, Dispatch, Reducer, Action
} from "../../index.d.ts";


type Thunk<S, O> = (dispatch: Dispatch, getState?: () => S) => O;

const thunkMiddleware: Middleware =
  <S>({dispatch, getState}: MiddlewareAPI<S>) =>
    (next: Dispatch) =>
      <A, B>(action: A | Thunk<S, B>): B =>
        typeof action === 'function' ?
          (<Thunk<S, B>>action)(dispatch, getState) :
          <B>next(<A>action)


const loggerMiddleware: Middleware =
  <S>({getState}: MiddlewareAPI<S>) =>
    (next: Dispatch) =>
      (action: any): any => {
        console.log('will dispatch', action)

        // Call the next dispatch method in the middleware chain.
        const returnValue = next(action)

        console.log('state after dispatch', getState())

        // This will likely be the action itself, unless
        // a middleware further in chain changed it.
        return returnValue
      }



type State = {
  todos: string[];
}

const reducer: Reducer<State> = (state: State, action: Action): State => {
  return state;
}

const storeWithThunkMiddleware = createStore(
  reducer,
  applyMiddleware(thunkMiddleware)
);

storeWithThunkMiddleware.dispatch(
  (dispatch: Dispatch, getState: () => State) => {
    const todos: string[] = getState().todos;
    dispatch({type: 'ADD_TODO'})
  }
)


const storeWithMultipleMiddleware = createStore(
  reducer,
  applyMiddleware(loggerMiddleware, thunkMiddleware)
)
