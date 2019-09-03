import { Store, PreloadedState, StoreEnhancer } from './types/store';
import { Action } from './types/actions';
import { Reducer } from './types/reducers';
/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} [enhancer] The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
export default function createStore<S, A extends Action, Ext, StateExt>(reducer: Reducer<S, A>, enhancer?: StoreEnhancer<Ext, StateExt>): Store<S & StateExt, A> & Ext;
export default function createStore<S, A extends Action, Ext, StateExt>(reducer: Reducer<S, A>, preloadedState?: PreloadedState<S>, enhancer?: StoreEnhancer<Ext>): Store<S & StateExt, A> & Ext;
//# sourceMappingURL=createStore.d.ts.map