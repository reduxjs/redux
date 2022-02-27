import type { Action, ActionCreator, StoreEnhancer } from 'redux'
import { compose } from 'redux'

/**
 * @public
 */
export interface EnhancerOptions {
  /**
   * the instance name to be showed on the monitor page. Default value is `document.title`.
   * If not specified and there's no document title, it will consist of `tabId` and `instanceId`.
   */
  name?: string
  /**
   * action creators functions to be available in the Dispatcher.
   */
  actionCreators?: ActionCreator<any>[] | { [key: string]: ActionCreator<any> }
  /**
   * if more than one action is dispatched in the indicated interval, all new actions will be collected and sent at once.
   * It is the joint between performance and speed. When set to `0`, all actions will be sent instantly.
   * Set it to a higher value when experiencing perf issues (also `maxAge` to a lower value).
   *
   * @default 500 ms.
   */
  latency?: number
  /**
   * (> 1) - maximum allowed actions to be stored in the history tree. The oldest actions are removed once maxAge is reached. It's critical for performance.
   *
   * @default 50
   */
  maxAge?: number
  /**
   * See detailed documentation at https://github.com/reduxjs/redux-devtools/blob/%40redux-devtools/extension%403.2.1/extension/docs/API/Arguments.md#serialize
   */
  serialize?:
    | boolean
    | {
        options?:
          | boolean
          | {
              date?: boolean
              regex?: boolean
              undefined?: boolean
              error?: boolean
              symbol?: boolean
              map?: boolean
              set?: boolean
              function?: boolean | Function
            }
        replacer?: (key: string, value: unknown) => unknown
        reviver?: (key: string, value: unknown) => unknown
        immutable?: unknown
        refs?: unknown[]
      }
  /**
   * function which takes `action` object and id number as arguments, and should return `action` object back.
   */
  actionSanitizer?: <A extends Action>(action: A, id: number) => A
  /**
   * function which takes `state` object and index as arguments, and should return `state` object back.
   */
  stateSanitizer?: <S>(state: S, index: number) => S
  /**
   * *string or array of strings as regex* - actions types to be hidden / shown in the monitors (while passed to the reducers).
   * If `actionsWhitelist` specified, `actionsBlacklist` is ignored.
   */
  actionsBlacklist?: string | string[]
  /**
   * *string or array of strings as regex* - actions types to be hidden / shown in the monitors (while passed to the reducers).
   * If `actionsWhitelist` specified, `actionsBlacklist` is ignored.
   */
  actionsWhitelist?: string | string[]
  /**
   * called for every action before sending, takes `state` and `action` object, and returns `true` in case it allows sending the current data to the monitor.
   * Use it as a more advanced version of `actionsBlacklist`/`actionsWhitelist` parameters.
   */
  predicate?: <S, A extends Action>(state: S, action: A) => boolean
  /**
   * if specified as `false`, it will not record the changes till clicking on `Start recording` button.
   * Available only for Redux enhancer, for others use `autoPause`.
   *
   * @default true
   */
  shouldRecordChanges?: boolean
  /**
   * if specified, whenever clicking on `Pause recording` button and there are actions in the history log, will add this action type.
   * If not specified, will commit when paused. Available only for Redux enhancer.
   *
   * @default "@@PAUSED""
   */
  pauseActionType?: string
  /**
   * auto pauses when the extension’s window is not opened, and so has zero impact on your app when not in use.
   * Not available for Redux enhancer (as it already does it but storing the data to be sent).
   *
   * @default false
   */
  autoPause?: boolean
  /**
   * if specified as `true`, it will not allow any non-monitor actions to be dispatched till clicking on `Unlock changes` button.
   * Available only for Redux enhancer.
   *
   * @default false
   */
  shouldStartLocked?: boolean
  /**
   * if set to `false`, will not recompute the states on hot reloading (or on replacing the reducers). Available only for Redux enhancer.
   *
   * @default true
   */
  shouldHotReload?: boolean
  /**
   * if specified as `true`, whenever there's an exception in reducers, the monitors will show the error message, and next actions will not be dispatched.
   *
   * @default false
   */
  shouldCatchErrors?: boolean
  /**
   * If you want to restrict the extension, specify the features you allow.
   * If not specified, all of the features are enabled. When set as an object, only those included as `true` will be allowed.
   * Note that except `true`/`false`, `import` and `export` can be set as `custom` (which is by default for Redux enhancer), meaning that the importing/exporting occurs on the client side.
   * Otherwise, you'll get/set the data right from the monitor part.
   */
  features?: {
    /**
     * start/pause recording of dispatched actions
     */
    pause?: boolean
    /**
     * lock/unlock dispatching actions and side effects
     */
    lock?: boolean
    /**
     * persist states on page reloading
     */
    persist?: boolean
    /**
     * export history of actions in a file
     */
    export?: boolean | 'custom'
    /**
     * import history of actions from a file
     */
    import?: boolean | 'custom'
    /**
     * jump back and forth (time travelling)
     */
    jump?: boolean
    /**
     * skip (cancel) actions
     */
    skip?: boolean
    /**
     * drag and drop actions in the history list
     */
    reorder?: boolean
    /**
     * dispatch custom actions or action creators
     */
    dispatch?: boolean
    /**
     * generate tests for the selected actions
     */
    test?: boolean
  }
  /**
   * Set to true or a stacktrace-returning function to record call stack traces for dispatched actions.
   * Defaults to false.
   */
  trace?: boolean | (<A extends Action>(action: A) => string)
  /**
   * The maximum number of stack trace entries to record per action. Defaults to 10.
   */
  traceLimit?: number
}

type Compose = typeof compose

interface ComposeWithDevTools {
  (options: EnhancerOptions): Compose
  <StoreExt>(...funcs: StoreEnhancer<StoreExt>[]): StoreEnhancer<StoreExt>
}

/**
 * @public
 */
export const composeWithDevTools: ComposeWithDevTools =
  typeof window !== 'undefined' &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : function () {
        if (arguments.length === 0) return undefined
        if (typeof arguments[0] === 'object') return compose
        return compose.apply(null, arguments as any as Function[])
      }

/**
 * @public
 */
export const devToolsEnhancer: {
  (options: EnhancerOptions): StoreEnhancer<any>
} =
  typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION__
    : function () {
        return function (noop) {
          return noop
        }
      }
