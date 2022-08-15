import type { AnyAction, PayloadAction } from '@reduxjs/toolkit'
import {
  combineReducers,
  createAction,
  createSlice,
  isAnyOf,
  isFulfilled,
  isRejectedWithValue,
  createNextState,
} from '@reduxjs/toolkit'
import type {
  CombinedState as CombinedQueryState,
  QuerySubstateIdentifier,
  QuerySubState,
  MutationSubstateIdentifier,
  MutationSubState,
  MutationState,
  QueryState,
  InvalidationState,
  Subscribers,
  QueryCacheKey,
  SubscriptionState,
  ConfigState,
} from './apiState'
import { QueryStatus } from './apiState'
import type { MutationThunk, QueryThunk, RejectedAction } from './buildThunks'
import { calculateProvidedByThunk } from './buildThunks'
import type {
  AssertTagTypes,
  EndpointDefinitions,
  QueryDefinition,
} from '../endpointDefinitions'
import type { Patch } from 'immer'
import { applyPatches } from 'immer'
import { onFocus, onFocusLost, onOffline, onOnline } from './setupListeners'
import {
  isDocumentVisible,
  isOnline,
  copyWithStructuralSharing,
} from '../utils'
import type { ApiContext } from '../apiTypes'

function updateQuerySubstateIfExists(
  state: QueryState<any>,
  queryCacheKey: QueryCacheKey,
  update: (substate: QuerySubState<any>) => void
) {
  const substate = state[queryCacheKey]
  if (substate) {
    update(substate)
  }
}

export function getMutationCacheKey(
  id:
    | MutationSubstateIdentifier
    | { requestId: string; arg: { fixedCacheKey?: string | undefined } }
): string
export function getMutationCacheKey(id: {
  fixedCacheKey?: string
  requestId?: string
}): string | undefined

export function getMutationCacheKey(
  id:
    | { fixedCacheKey?: string; requestId?: string }
    | MutationSubstateIdentifier
    | { requestId: string; arg: { fixedCacheKey?: string | undefined } }
): string | undefined {
  return ('arg' in id ? id.arg.fixedCacheKey : id.fixedCacheKey) ?? id.requestId
}

function updateMutationSubstateIfExists(
  state: MutationState<any>,
  id:
    | MutationSubstateIdentifier
    | { requestId: string; arg: { fixedCacheKey?: string | undefined } },
  update: (substate: MutationSubState<any>) => void
) {
  const substate = state[getMutationCacheKey(id)]
  if (substate) {
    update(substate)
  }
}

const initialState = {} as any

export function buildSlice({
  reducerPath,
  queryThunk,
  mutationThunk,
  context: {
    endpointDefinitions: definitions,
    apiUid,
    extractRehydrationInfo,
    hasRehydrationInfo,
  },
  assertTagType,
  config,
}: {
  reducerPath: string
  queryThunk: QueryThunk
  mutationThunk: MutationThunk
  context: ApiContext<EndpointDefinitions>
  assertTagType: AssertTagTypes
  config: Omit<
    ConfigState<string>,
    'online' | 'focused' | 'middlewareRegistered'
  >
}) {
  const resetApiState = createAction(`${reducerPath}/resetApiState`)
  const querySlice = createSlice({
    name: `${reducerPath}/queries`,
    initialState: initialState as QueryState<any>,
    reducers: {
      removeQueryResult(
        draft,
        { payload: { queryCacheKey } }: PayloadAction<QuerySubstateIdentifier>
      ) {
        delete draft[queryCacheKey]
      },
      queryResultPatched(
        draft,
        {
          payload: { queryCacheKey, patches },
        }: PayloadAction<
          QuerySubstateIdentifier & { patches: readonly Patch[] }
        >
      ) {
        updateQuerySubstateIfExists(draft, queryCacheKey, (substate) => {
          substate.data = applyPatches(substate.data as any, patches.concat())
        })
      },
    },
    extraReducers(builder) {
      builder
        .addCase(queryThunk.pending, (draft, { meta, meta: { arg } }) => {
          if (arg.subscribe) {
            // only initialize substate if we want to subscribe to it
            draft[arg.queryCacheKey] ??= {
              status: QueryStatus.uninitialized,
              endpointName: arg.endpointName,
            }
          }

          updateQuerySubstateIfExists(draft, arg.queryCacheKey, (substate) => {
            substate.status = QueryStatus.pending
            substate.requestId = meta.requestId
            if (arg.originalArgs !== undefined) {
              substate.originalArgs = arg.originalArgs
            }
            substate.startedTimeStamp = meta.startedTimeStamp
          })
        })
        .addCase(queryThunk.fulfilled, (draft, { meta, payload }) => {
          updateQuerySubstateIfExists(
            draft,
            meta.arg.queryCacheKey,
            (substate) => {
              if (substate.requestId !== meta.requestId) return
              const { merge } = definitions[
                meta.arg.endpointName
              ] as QueryDefinition<any, any, any, any>
              substate.status = QueryStatus.fulfilled

              if (merge) {
                if (substate.data !== undefined) {
                  // There's existing cache data. Let the user merge it in themselves.
                  // We're already inside an Immer-powered reducer, and the user could just mutate `substate.data`
                  // themselves inside of `merge()`. But, they might also want to return a new value.
                  // Try to let Immer figure that part out, save the result, and assign it to `substate.data`.
                  let newData = createNextState(
                    substate.data,
                    (draftSubstateData) => {
                      // As usual with Immer, you can mutate _or_ return inside here, but not both
                      return merge(draftSubstateData, payload)
                    }
                  )
                  substate.data = newData
                } else {
                  // Presumably a fresh request. Just cache the response data.
                  substate.data = payload
                }
              } else {
                // Assign or safely update the cache data.
                substate.data =
                  definitions[meta.arg.endpointName].structuralSharing ?? true
                    ? copyWithStructuralSharing(substate.data, payload)
                    : payload
              }

              delete substate.error
              substate.fulfilledTimeStamp = meta.fulfilledTimeStamp
            }
          )
        })
        .addCase(
          queryThunk.rejected,
          (draft, { meta: { condition, arg, requestId }, error, payload }) => {
            updateQuerySubstateIfExists(
              draft,
              arg.queryCacheKey,
              (substate) => {
                if (condition) {
                  // request was aborted due to condition (another query already running)
                } else {
                  // request failed
                  if (substate.requestId !== requestId) return
                  substate.status = QueryStatus.rejected
                  substate.error = (payload ?? error) as any
                }
              }
            )
          }
        )
        .addMatcher(hasRehydrationInfo, (draft, action) => {
          const { queries } = extractRehydrationInfo(action)!
          for (const [key, entry] of Object.entries(queries)) {
            if (
              // do not rehydrate entries that were currently in flight.
              entry?.status === QueryStatus.fulfilled ||
              entry?.status === QueryStatus.rejected
            ) {
              draft[key] = entry
            }
          }
        })
    },
  })
  const mutationSlice = createSlice({
    name: `${reducerPath}/mutations`,
    initialState: initialState as MutationState<any>,
    reducers: {
      removeMutationResult(
        draft,
        { payload }: PayloadAction<MutationSubstateIdentifier>
      ) {
        const cacheKey = getMutationCacheKey(payload)
        if (cacheKey in draft) {
          delete draft[cacheKey]
        }
      },
    },
    extraReducers(builder) {
      builder
        .addCase(
          mutationThunk.pending,
          (draft, { meta, meta: { requestId, arg, startedTimeStamp } }) => {
            if (!arg.track) return

            draft[getMutationCacheKey(meta)] = {
              requestId,
              status: QueryStatus.pending,
              endpointName: arg.endpointName,
              startedTimeStamp,
            }
          }
        )
        .addCase(mutationThunk.fulfilled, (draft, { payload, meta }) => {
          if (!meta.arg.track) return

          updateMutationSubstateIfExists(draft, meta, (substate) => {
            if (substate.requestId !== meta.requestId) return
            substate.status = QueryStatus.fulfilled
            substate.data = payload
            substate.fulfilledTimeStamp = meta.fulfilledTimeStamp
          })
        })
        .addCase(mutationThunk.rejected, (draft, { payload, error, meta }) => {
          if (!meta.arg.track) return

          updateMutationSubstateIfExists(draft, meta, (substate) => {
            if (substate.requestId !== meta.requestId) return

            substate.status = QueryStatus.rejected
            substate.error = (payload ?? error) as any
          })
        })
        .addMatcher(hasRehydrationInfo, (draft, action) => {
          const { mutations } = extractRehydrationInfo(action)!
          for (const [key, entry] of Object.entries(mutations)) {
            if (
              // do not rehydrate entries that were currently in flight.
              (entry?.status === QueryStatus.fulfilled ||
                entry?.status === QueryStatus.rejected) &&
              // only rehydrate endpoints that were persisted using a `fixedCacheKey`
              key !== entry?.requestId
            ) {
              draft[key] = entry
            }
          }
        })
    },
  })

  const invalidationSlice = createSlice({
    name: `${reducerPath}/invalidation`,
    initialState: initialState as InvalidationState<string>,
    reducers: {},
    extraReducers(builder) {
      builder
        .addCase(
          querySlice.actions.removeQueryResult,
          (draft, { payload: { queryCacheKey } }) => {
            for (const tagTypeSubscriptions of Object.values(draft)) {
              for (const idSubscriptions of Object.values(
                tagTypeSubscriptions
              )) {
                const foundAt = idSubscriptions.indexOf(queryCacheKey)
                if (foundAt !== -1) {
                  idSubscriptions.splice(foundAt, 1)
                }
              }
            }
          }
        )
        .addMatcher(hasRehydrationInfo, (draft, action) => {
          const { provided } = extractRehydrationInfo(action)!
          for (const [type, incomingTags] of Object.entries(provided)) {
            for (const [id, cacheKeys] of Object.entries(incomingTags)) {
              const subscribedQueries = ((draft[type] ??= {})[
                id || '__internal_without_id'
              ] ??= [])
              for (const queryCacheKey of cacheKeys) {
                const alreadySubscribed =
                  subscribedQueries.includes(queryCacheKey)
                if (!alreadySubscribed) {
                  subscribedQueries.push(queryCacheKey)
                }
              }
            }
          }
        })
        .addMatcher(
          isAnyOf(isFulfilled(queryThunk), isRejectedWithValue(queryThunk)),
          (draft, action) => {
            const providedTags = calculateProvidedByThunk(
              action,
              'providesTags',
              definitions,
              assertTagType
            )
            const { queryCacheKey } = action.meta.arg

            for (const { type, id } of providedTags) {
              const subscribedQueries = ((draft[type] ??= {})[
                id || '__internal_without_id'
              ] ??= [])
              const alreadySubscribed =
                subscribedQueries.includes(queryCacheKey)
              if (!alreadySubscribed) {
                subscribedQueries.push(queryCacheKey)
              }
            }
          }
        )
    },
  })

  const subscriptionSlice = createSlice({
    name: `${reducerPath}/subscriptions`,
    initialState: initialState as SubscriptionState,
    reducers: {
      updateSubscriptionOptions(
        draft,
        {
          payload: { queryCacheKey, requestId, options },
        }: PayloadAction<
          {
            endpointName: string
            requestId: string
            options: Subscribers[number]
          } & QuerySubstateIdentifier
        >
      ) {
        if (draft?.[queryCacheKey]?.[requestId]) {
          draft[queryCacheKey]![requestId] = options
        }
      },
      unsubscribeQueryResult(
        draft,
        {
          payload: { queryCacheKey, requestId },
        }: PayloadAction<{ requestId: string } & QuerySubstateIdentifier>
      ) {
        if (draft[queryCacheKey]) {
          delete draft[queryCacheKey]![requestId]
        }
      },
      subscriptionRequestsRejected(
        draft,
        action: PayloadAction<RejectedAction<QueryThunk, any>[]>
      ) {
        // We need to process "rejected" actions caused by a component trying to start a subscription
        // after there's already a cache entry. Since many components may mount at once and all want
        // the same data, we use a middleware that intercepts those actions batches these together
        // into a single larger action , and we'll process all of them at once.
        for (let rejectedAction of action.payload) {
          const {
            meta: { condition, arg, requestId },
          } = rejectedAction
          // request was aborted due to condition (another query already running)
          if (condition && arg.subscribe) {
            const substate = (draft[arg.queryCacheKey] ??= {})
            substate[requestId] =
              arg.subscriptionOptions ?? substate[requestId] ?? {}
          }
        }
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(
          querySlice.actions.removeQueryResult,
          (draft, { payload: { queryCacheKey } }) => {
            delete draft[queryCacheKey]
          }
        )
        .addCase(queryThunk.pending, (draft, { meta: { arg, requestId } }) => {
          if (arg.subscribe) {
            const substate = (draft[arg.queryCacheKey] ??= {})
            substate[requestId] =
              arg.subscriptionOptions ?? substate[requestId] ?? {}
          }
        })
        // update the state to be a new object to be picked up as a "state change"
        // by redux-persist's `autoMergeLevel2`
        .addMatcher(hasRehydrationInfo, (draft) => ({ ...draft }))
    },
  })

  const configSlice = createSlice({
    name: `${reducerPath}/config`,
    initialState: {
      online: isOnline(),
      focused: isDocumentVisible(),
      middlewareRegistered: false,
      ...config,
    } as ConfigState<string>,
    reducers: {
      middlewareRegistered(state, { payload }: PayloadAction<string>) {
        state.middlewareRegistered =
          state.middlewareRegistered === 'conflict' || apiUid !== payload
            ? 'conflict'
            : true
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(onOnline, (state) => {
          state.online = true
        })
        .addCase(onOffline, (state) => {
          state.online = false
        })
        .addCase(onFocus, (state) => {
          state.focused = true
        })
        .addCase(onFocusLost, (state) => {
          state.focused = false
        })
        // update the state to be a new object to be picked up as a "state change"
        // by redux-persist's `autoMergeLevel2`
        .addMatcher(hasRehydrationInfo, (draft) => ({ ...draft }))
    },
  })

  const combinedReducer = combineReducers<
    CombinedQueryState<any, string, string>
  >({
    queries: querySlice.reducer,
    mutations: mutationSlice.reducer,
    provided: invalidationSlice.reducer,
    subscriptions: subscriptionSlice.reducer,
    config: configSlice.reducer,
  })

  const reducer: typeof combinedReducer = (state, action) =>
    combinedReducer(resetApiState.match(action) ? undefined : state, action)

  const actions = {
    ...configSlice.actions,
    ...querySlice.actions,
    ...subscriptionSlice.actions,
    ...mutationSlice.actions,
    /** @deprecated has been renamed to `removeMutationResult` */
    unsubscribeMutationResult: mutationSlice.actions.removeMutationResult,
    resetApiState,
  }

  return { reducer, actions }
}
export type SliceActions = ReturnType<typeof buildSlice>['actions']
