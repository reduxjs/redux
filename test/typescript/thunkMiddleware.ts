import {
  Middleware, MiddlewareAPI,
  applyMiddleware, createStore, Dispatch
} from "../../index";


type Thunk<S> = <O>(dispatch: Dispatch, getState?: () => S) => O;


const thunkMiddleware: Middleware =
  <S>({dispatch, getState}: MiddlewareAPI<S>) =>
    (next: Dispatch) =>
      <A>(action: A | Thunk<S>) =>
        typeof action === 'function' ?
          (<Thunk<S>>action)(dispatch, getState) :
          next(action)


function todos(state: any, action: any) {
  return state;
}

let store = createStore(
  todos,
  ['Use Redux'],
  applyMiddleware(thunkMiddleware)
);

store.dispatch<Thunk<any>, void>((dispatch: Dispatch) => {
  dispatch({type: 'ADD_TODO'})
})
