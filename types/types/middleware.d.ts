import { Dispatch } from './store';
import { AnyAction } from './actions';
export interface MiddlewareAPI<D extends Dispatch = Dispatch, S = any> {
    dispatch: D;
    getState(): S;
}
/**
 * A middleware is a higher-order function that composes a dispatch function
 * to return a new dispatch function. It often turns async actions into
 * actions.
 *
 * Middleware is composable using function composition. It is useful for
 * logging actions, performing side effects like routing, or turning an
 * asynchronous API call into a series of synchronous actions.
 *
 * @template DispatchExt Extra Dispatch signature added by this middleware.
 * @template S The type of the state supported by this middleware.
 * @template D The type of Dispatch of the store where this middleware is
 *   installed.
 */
export interface Middleware<_DispatchExt = {}, // TODO: remove unused component
S = any, D extends Dispatch = Dispatch> {
    (api: MiddlewareAPI<D, S>): (next: Dispatch<AnyAction>) => (action: any) => any;
}
//# sourceMappingURL=middleware.d.ts.map