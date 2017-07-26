import {
  Middleware, SpecificMiddleware, MiddlewareAPI,
  applyMiddleware, createStore, Dispatch, Reducer, Action
} from "../../index";

declare module "../../index" {
    export interface Dispatch<S> {
        <R>(asyncAction: (dispatch: Dispatch<S>, getState: () => S) => R): R;
    }
}

type Thunk<S, O> = (dispatch: Dispatch<S>, getState: () => S) => O;

const thunkSpecificMiddleware: SpecificMiddleware<State> =
  ({dispatch, getState}: MiddlewareAPI<State>) =>
    (next: Dispatch<State>) =>
      <A extends Action, B>(action: A | Thunk<State, B>): B|Action =>
        typeof action === 'function' ?
          (<Thunk<State, B>>action)(dispatch, getState) :
          next(<A>action)

const thunkGenericMiddleware: Middleware =
  <S>({dispatch, getState}: MiddlewareAPI<S>) =>
    (next: Dispatch<S>) =>
      <A extends Action, B>(action: A | Thunk<S, B>): B|Action =>
        typeof action === 'function' ?
          (<Thunk<S, B>>action)(dispatch, getState) :
          next(<A>action)


const loggerSpecificMiddleware: SpecificMiddleware<State> =
  ({getState}: MiddlewareAPI<State>) =>
    (next: Dispatch<State>) =>
      (action: any): any => {
        console.log('will dispatch', action)

        // Call the next dispatch method in the middleware chain.
        const returnValue = next(action)

        console.log('state after dispatch', getState())

        // This will likely be the action itself, unless
        // a middleware further in chain changed it.
        return returnValue
      }

const loggerGenericMiddleware: Middleware =
  <S>({getState}: MiddlewareAPI<S>) =>
    (next: Dispatch<S>) =>
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
  applyMiddleware(thunkGenericMiddleware)
);

storeWithThunkMiddleware.dispatch(
  (dispatch, getState) => {
    const todos: string[] = getState().todos;
    dispatch({type: 'ADD_TODO'})
  }
)


const storeWithMultipleMiddleware = createStore(
  reducer,
  applyMiddleware(loggerGenericMiddleware, thunkGenericMiddleware)
)
