import {
  createAction,
  nanoid,
  PayloadAction,
  Middleware,
  Dispatch,
  AnyAction,
  MiddlewareAPI,
  Action,
  ThunkDispatch,
} from '@reduxjs/toolkit'

interface BaseActionCreator<P, T extends string, M = never, E = never> {
  type: T
  match(action: Action<unknown>): action is PayloadAction<P, T, M, E>
}

interface TypedActionCreator<Type extends string> {
  (...args: any[]): Action<Type>
  type: Type
  match: MatchFunction<any>
}

type ListenerPredicate<Action extends AnyAction, State> = (
  action: Action,
  currentState?: State,
  originalState?: State
) => boolean

type ConditionFunction<Action extends AnyAction, State> = (
  predicate: ListenerPredicate<Action, State> | (() => boolean),
  timeout?: number
) => Promise<boolean>

type MatchFunction<T> = (v: any) => v is T

export interface HasMatchFunction<T> {
  match: MatchFunction<T>
}

export const hasMatchFunction = <T>(
  v: Matcher<T>
): v is HasMatchFunction<T> => {
  return v && typeof (v as HasMatchFunction<T>).match === 'function'
}

export const isActionCreator = (
  item: Function
): item is TypedActionCreator<any> => {
  return (
    typeof item === 'function' &&
    typeof (item as any).type === 'string' &&
    hasMatchFunction(item as any)
  )
}

/** @public */
export type Matcher<T> = HasMatchFunction<T> | MatchFunction<T>

const declaredMiddlewareType: unique symbol = undefined as any
export type WithMiddlewareType<T extends Middleware<any, any, any>> = {
  [declaredMiddlewareType]: T
}

export type MiddlewarePhase = 'beforeReducer' | 'afterReducer'

export type When = MiddlewarePhase | 'both' | undefined
type WhenFromOptions<O extends ActionListenerOptions> =
  O extends ActionListenerOptions ? O['when'] : never

/**
 * @alpha
 */
export interface ActionListenerMiddlewareAPI<
  S,
  D extends Dispatch<AnyAction>,
  O extends ActionListenerOptions
> extends MiddlewareAPI<D, S> {
  getOriginalState: () => S
  unsubscribe(): void
  condition: ConditionFunction<AnyAction, S>
  currentPhase: MiddlewarePhase
  // TODO Figure out how to pass this through the other types correctly
  extra: unknown
}

/**
 * @alpha
 */
export type ActionListener<
  A extends AnyAction,
  S,
  D extends Dispatch<AnyAction>,
  O extends ActionListenerOptions
> = (action: A, api: ActionListenerMiddlewareAPI<S, D, O>) => void

export interface ActionListenerOptions {
  /**
   * Determines if the listener runs 'before' or 'after' the reducers have been called.
   * If set to 'before', calling `api.stopPropagation()` from the listener becomes possible.
   * Defaults to 'before'.
   */
  when?: When
}

export interface CreateListenerMiddlewareOptions<ExtraArgument = unknown> {
  extra?: ExtraArgument
}

export interface AddListenerAction<
  A extends AnyAction,
  S,
  D extends Dispatch<AnyAction>,
  O extends ActionListenerOptions
> {
  type: 'actionListenerMiddleware/add'
  payload: {
    type: string
    listener: ActionListener<A, S, D, O>
    options?: O
  }
}

/**
 * @alpha
 */
export const addListenerAction = createAction(
  'actionListenerMiddleware/add',
  function prepare(
    typeOrActionCreator: string | TypedActionCreator<string>,
    listener: ActionListener<any, any, any, any>,
    options?: ActionListenerOptions
  ) {
    const type =
      typeof typeOrActionCreator === 'string'
        ? typeOrActionCreator
        : (typeOrActionCreator as TypedActionCreator<string>).type

    return {
      payload: {
        type,
        listener,
        options,
      },
    }
  }
) as BaseActionCreator<
  {
    type: string
    listener: ActionListener<any, any, any, any>
    options: ActionListenerOptions
  },
  'actionListenerMiddleware/add'
> & {
  <
    C extends TypedActionCreator<any>,
    S,
    D extends Dispatch,
    O extends ActionListenerOptions
  >(
    actionCreator: C,
    listener: ActionListener<ReturnType<C>, S, D, O>,
    options?: O
  ): AddListenerAction<ReturnType<C>, S, D, O>

  <S, D extends Dispatch, O extends ActionListenerOptions>(
    type: string,
    listener: ActionListener<AnyAction, S, D, O>,
    options?: O
  ): AddListenerAction<AnyAction, S, D, O>
}

interface RemoveListenerAction<
  A extends AnyAction,
  S,
  D extends Dispatch<AnyAction>
> {
  type: 'actionListenerMiddleware/remove'
  payload: {
    type: string
    listener: ActionListener<A, S, D, any>
  }
}

/**
 * @alpha
 */
export const removeListenerAction = createAction(
  'actionListenerMiddleware/remove',
  function prepare(
    typeOrActionCreator: string | TypedActionCreator<string>,
    listener: ActionListener<any, any, any, any>
  ) {
    const type =
      typeof typeOrActionCreator === 'string'
        ? typeOrActionCreator
        : (typeOrActionCreator as TypedActionCreator<string>).type

    return {
      payload: {
        type,
        listener,
      },
    }
  }
) as BaseActionCreator<
  { type: string; listener: ActionListener<any, any, any, any> },
  'actionListenerMiddleware/remove'
> & {
  <C extends TypedActionCreator<any>, S, D extends Dispatch>(
    actionCreator: C,
    listener: ActionListener<ReturnType<C>, S, D, any>
  ): RemoveListenerAction<ReturnType<C>, S, D>

  <S, D extends Dispatch>(
    type: string,
    listener: ActionListener<AnyAction, S, D, any>
  ): RemoveListenerAction<AnyAction, S, D>
}

const defaultWhen: MiddlewarePhase = 'afterReducer'
const actualMiddlewarePhases = ['beforeReducer', 'afterReducer'] as const

/**
 * @alpha
 */
export function createActionListenerMiddleware<
  S = any,
  // TODO Carry through the thunk extra arg somehow?
  D extends Dispatch<AnyAction> = ThunkDispatch<S, unknown, AnyAction>,
  ExtraArgument = unknown
>(middlewareOptions: CreateListenerMiddlewareOptions<ExtraArgument> = {}) {
  type ListenerEntry = ActionListenerOptions & {
    id: string
    listener: ActionListener<any, S, D, any>
    unsubscribe: () => void
    type?: string
    predicate: ListenerPredicate<any, any>
  }

  const listenerMap = new Map<string, ListenerEntry>()
  const { extra } = middlewareOptions

  const middleware: Middleware<
    {
      (action: Action<'actionListenerMiddleware/add'>): Unsubscribe
    },
    S,
    D
  > = (api) => (next) => (action) => {
    if (addListenerAction.match(action)) {
      const unsubscribe = addListener(
        action.payload.type,
        action.payload.listener,
        action.payload.options
      )

      return unsubscribe
    }
    if (removeListenerAction.match(action)) {
      // @ts-ignore
      removeListener(action.payload.type, action.payload.listener)

      return
    }

    if (listenerMap.size === 0) {
      return next(action)
    }

    let result: unknown
    const originalState = api.getState()
    const getOriginalState = () => originalState

    for (const currentPhase of actualMiddlewarePhases) {
      let currentState = api.getState()
      for (let entry of listenerMap.values()) {
        const runThisPhase =
          entry.when === 'both' || entry.when === currentPhase
        const runListener =
          runThisPhase && entry.predicate(action, currentState, originalState)
        if (!runListener) {
          continue
        }

        try {
          entry.listener(action, {
            ...api,
            getOriginalState,
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            condition,
            currentPhase,
            extra,
            unsubscribe: entry.unsubscribe,
          })
        } catch (err) {
          // ignore errors deliberately
        }
      }
      if (currentPhase === 'beforeReducer') {
        result = next(action)
      } else {
        return result
      }
    }
  }

  type Unsubscribe = () => void

  type GuardedType<T> = T extends (x: any) => x is infer T ? T : never

  function addListener<
    C extends TypedActionCreator<any>,
    O extends ActionListenerOptions
  >(
    actionCreator: C,
    listener: ActionListener<ReturnType<C>, S, D, O>,
    options?: O
  ): Unsubscribe
  // eslint-disable-next-line no-redeclare
  function addListener<T extends string, O extends ActionListenerOptions>(
    type: T,
    listener: ActionListener<Action<T>, S, D, O>,
    options?: O
  ): Unsubscribe
  // eslint-disable-next-line no-redeclare
  function addListener<
    MA extends AnyAction,
    M extends MatchFunction<MA>,
    O extends ActionListenerOptions
  >(
    matcher: M,
    listener: ActionListener<GuardedType<M>, S, D, O>,
    options?: O
  ): Unsubscribe
  // eslint-disable-next-line no-redeclare
  function addListener<
    MA extends AnyAction,
    M extends ListenerPredicate<MA, S>,
    O extends ActionListenerOptions
  >(
    matcher: M,
    listener: ActionListener<AnyAction, S, D, O>,
    options?: O
  ): Unsubscribe
  // eslint-disable-next-line no-redeclare
  function addListener(
    typeOrActionCreator:
      | string
      | TypedActionCreator<any>
      | ListenerPredicate<any, any>,
    listener: ActionListener<AnyAction, S, D, any>,
    options?: ActionListenerOptions
  ): Unsubscribe {
    let predicate: ListenerPredicate<any, any>
    let type: string | undefined

    let entry = findListenerEntry(
      (existingEntry) => existingEntry.listener === listener
    )

    if (!entry) {
      if (typeof typeOrActionCreator === 'string') {
        type = typeOrActionCreator
        predicate = (action: any) => action.type === type
      } else {
        if (isActionCreator(typeOrActionCreator)) {
          type = typeOrActionCreator.type
          predicate = typeOrActionCreator.match
        } else {
          predicate = typeOrActionCreator as unknown as ListenerPredicate<
            any,
            any
          >
        }
      }

      const id = nanoid()
      const unsubscribe = () => listenerMap.delete(id)
      entry = {
        when: defaultWhen,
        ...options,
        id,
        listener,
        type,
        predicate,
        unsubscribe,
      }

      listenerMap.set(id, entry)
    }

    return entry.unsubscribe
  }

  function removeListener<C extends TypedActionCreator<any>>(
    actionCreator: C,
    listener: ActionListener<ReturnType<C>, S, D, any>
  ): boolean
  // eslint-disable-next-line no-redeclare
  function removeListener(
    type: string,
    listener: ActionListener<AnyAction, S, D, any>
  ): boolean
  // eslint-disable-next-line no-redeclare
  function removeListener(
    typeOrActionCreator: string | TypedActionCreator<any>,
    listener: ActionListener<AnyAction, S, D, any>
  ): boolean {
    const type =
      typeof typeOrActionCreator === 'string'
        ? typeOrActionCreator
        : typeOrActionCreator.type

    let entry = findListenerEntry(
      (entry) => entry.type === type && entry.listener === listener
    )

    if (!entry) {
      return false
    }

    listenerMap.delete(entry.id)
    return true
  }

  function findListenerEntry(
    comparator: (entry: ListenerEntry) => boolean
  ): ListenerEntry | undefined {
    for (const entry of listenerMap.values()) {
      if (comparator(entry)) {
        return entry
      }
    }

    return undefined
  }

  const condition: ConditionFunction<AnyAction, S> = async (
    predicate,
    timeout
  ) => {
    let unsubscribe: Unsubscribe = () => {}

    const conditionSucceededPromise = new Promise<boolean>(
      (resolve, reject) => {
        unsubscribe = addListener(predicate, (action, listenerApi) => {
          // One-shot listener that cleans up as soon as the predicate resolves
          listenerApi.unsubscribe()
          resolve(true)
        })
      }
    )

    if (timeout === undefined) {
      return conditionSucceededPromise
    }

    const timedOutPromise = new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        resolve(false)
      }, timeout)
    })

    const result = await Promise.race([
      conditionSucceededPromise,
      timedOutPromise,
    ])

    unsubscribe()
    return result
  }

  return Object.assign(
    middleware,
    { addListener, removeListener },
    {} as WithMiddlewareType<typeof middleware>
  )
}
