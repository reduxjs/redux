import compose from './compose'
import { Middleware, MiddlewareAPI } from './types/middleware'
import { AnyAction } from './types/actions'
import {
  StoreEnhancer,
  Dispatch,
  PreloadedState,
  StoreEnhancerStoreCreator
} from './types/store'
import { Reducer } from './types/reducers'

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param middlewares The middleware chain to be applied.
 * @returns A store enhancer applying the middleware.
 *
 * @template Ext Dispatch signature added by a middleware.
 * @template S The type of the state supported by a middleware.
 */
export default function applyMiddleware(): StoreEnhancer
export default function applyMiddleware<Ext1, S, D extends Dispatch = Dispatch>(
  middleware1: Middleware<Ext1, S, D>
): StoreEnhancer<{ dispatch: Ext1 }>
export default function applyMiddleware<
  Ext1,
  Ext2,
  S,
  D extends Dispatch = Dispatch
>(
  middleware1: Middleware<Ext1, S, D>,
  middleware2: Middleware<Ext2, S, D>
): StoreEnhancer<{ dispatch: Ext1 & Ext2 }>
export default function applyMiddleware<
  Ext1,
  Ext2,
  Ext3,
  S,
  D extends Dispatch = Dispatch
>(
  middleware1: Middleware<Ext1, S, D>,
  middleware2: Middleware<Ext2, S, D>,
  middleware3: Middleware<Ext3, S, D>
): StoreEnhancer<{ dispatch: Ext1 & Ext2 & Ext3 }>
export default function applyMiddleware<
  Ext1,
  Ext2,
  Ext3,
  Ext4,
  S,
  D extends Dispatch = Dispatch
>(
  middleware1: Middleware<Ext1, S, D>,
  middleware2: Middleware<Ext2, S, D>,
  middleware3: Middleware<Ext3, S, D>,
  middleware4: Middleware<Ext4, S, D>
): StoreEnhancer<{ dispatch: Ext1 & Ext2 & Ext3 & Ext4 }>
export default function applyMiddleware<
  Ext1,
  Ext2,
  Ext3,
  Ext4,
  Ext5,
  S,
  D extends Dispatch = Dispatch
>(
  middleware1: Middleware<Ext1, S, D>,
  middleware2: Middleware<Ext2, S, D>,
  middleware3: Middleware<Ext3, S, D>,
  middleware4: Middleware<Ext4, S, D>,
  middleware5: Middleware<Ext5, S, D>
): StoreEnhancer<{ dispatch: Ext1 & Ext2 & Ext3 & Ext4 & Ext5 }>
export default function applyMiddleware<Ext, S = any, D extends Dispatch = Dispatch>(
  ...middlewares: Middleware<any, S, D>[]
): StoreEnhancer<{ dispatch: Ext }>
export default function applyMiddleware(
  ...middlewares: Middleware[]
): StoreEnhancer<any> {
  return (createStore: StoreEnhancerStoreCreator) =>
    <S, A extends AnyAction>(
      reducer: Reducer<S, A>,
      preloadedState?: PreloadedState<S>
    ) => {
      const store = createStore(reducer, preloadedState)
      let dispatch: Dispatch = () => {
        throw new Error(
          'Dispatching while constructing your middleware is not allowed. ' +
            'Other middleware would not be applied to this dispatch.'
        )
      }

      const middlewareAPI: MiddlewareAPI = {
        getState: store.getState,
        dispatch: (action, ...args) => dispatch(action, ...args)
      }
      const chain = middlewares.map(middleware => middleware(middlewareAPI))
      dispatch = compose<typeof dispatch>(...chain)(store.dispatch)

      return {
        ...store,
        dispatch
      }
    }
}
