import {
  applyMiddleware, createStore,
  Middleware, Dispatch
} from "../../index.d.ts";

export const loggerMiddleware: Middleware = ({getState}) => {
  return (next: Dispatch) =>
    (action: any) => {
      console.log('will dispatch', action)

      // Call the next dispatch method in the middleware chain.
      let returnValue = next(action)

      console.log('state after dispatch', getState())

      // This will likely be the action itself, unless
      // a middleware further in chain changed it.
      return returnValue
    }
}

function todos(state: any, action: any) {
  return state;
}

let store = createStore(
  todos,
  ['Use Redux'],
  applyMiddleware(loggerMiddleware)
);

store.dispatch({
  type: 'ADD_TODO',
  text: 'Understand the middleware'
})
