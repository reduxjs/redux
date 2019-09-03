import { Reducer } from './types/reducers';
import { AnyAction, Action } from './types/actions';
import { ReducersMapObject, StateFromReducersMapObject, ActionFromReducersMapObject } from './types/reducers';
import { CombinedState } from './types/store';
/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @template S Combined state object type.
 *
 * @param reducers An object whose values correspond to different reducer
 *   functions that need to be combined into one. One handy way to obtain it
 *   is to use ES6 `import * as reducers` syntax. The reducers may never
 *   return undefined for any action. Instead, they should return their
 *   initial state if the state passed to them was undefined, and the current
 *   state for any unrecognized action.
 *
 * @returns A reducer function that invokes every reducer inside the passed
 *   object, and builds a state object with the same shape.
 */
export default function combineReducers<S>(reducers: ReducersMapObject<S, any>): Reducer<CombinedState<S>>;
export default function combineReducers<S, A extends Action = AnyAction>(reducers: ReducersMapObject<S, A>): Reducer<CombinedState<S>, A>;
export default function combineReducers<M extends ReducersMapObject<any, any>>(reducers: M): Reducer<CombinedState<StateFromReducersMapObject<M>>, ActionFromReducersMapObject<M>>;
//# sourceMappingURL=combineReducers.d.ts.map