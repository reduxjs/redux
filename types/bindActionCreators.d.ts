import { Dispatch } from './types/store';
import { ActionCreator, ActionCreatorsMapObject } from './types/actions';
/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass an action creator as the first argument,
 * and get a dispatch wrapped function in return.
 *
 * @param actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */
export default function bindActionCreators<A, C extends ActionCreator<A>>(actionCreator: C, dispatch: Dispatch): C;
export default function bindActionCreators<A extends ActionCreator<any>, B extends ActionCreator<any>>(actionCreator: A, dispatch: Dispatch): B;
export default function bindActionCreators<A, M extends ActionCreatorsMapObject<A>>(actionCreators: M, dispatch: Dispatch): M;
export default function bindActionCreators<M extends ActionCreatorsMapObject<any>, N extends ActionCreatorsMapObject<any>>(actionCreators: M, dispatch: Dispatch): N;
//# sourceMappingURL=bindActionCreators.d.ts.map