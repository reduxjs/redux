import type { MutationHooks, QueryHooks } from './buildHooks'
import { buildHooks } from './buildHooks'
import { isQueryDefinition, isMutationDefinition } from '../endpointDefinitions'
import type {
  EndpointDefinitions,
  QueryDefinition,
  MutationDefinition,
  QueryArgFrom,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import type { Api, Module } from '../apiTypes'
import { capitalize } from '../utils'
import { safeAssign } from '../tsHelpers'
import type { BaseQueryFn } from '@reduxjs/toolkit/dist/query/baseQueryTypes'

import type { HooksWithUniqueNames } from './versionedTypes'

import {
  useDispatch as rrUseDispatch,
  useSelector as rrUseSelector,
  useStore as rrUseStore,
  batch as rrBatch,
} from 'react-redux'
import type { QueryKeys } from '../core/apiState'
import type { PrefetchOptions } from '../core/module'

export const reactHooksModuleName = /* @__PURE__ */ Symbol()
export type ReactHooksModule = typeof reactHooksModuleName

declare module '@reduxjs/toolkit/dist/query/apiTypes' {
  export interface ApiModules<
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BaseQuery extends BaseQueryFn,
    Definitions extends EndpointDefinitions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ReducerPath extends string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TagTypes extends string
  > {
    [reactHooksModuleName]: {
      /**
       *  Endpoints based on the input endpoints provided to `createApi`, containing `select`, `hooks` and `action matchers`.
       */
      endpoints: {
        [K in keyof Definitions]: Definitions[K] extends QueryDefinition<
          any,
          any,
          any,
          any,
          any
        >
          ? QueryHooks<Definitions[K]>
          : Definitions[K] extends MutationDefinition<any, any, any, any, any>
          ? MutationHooks<Definitions[K]>
          : never
      }
      /**
       * A hook that accepts a string endpoint name, and provides a callback that when called, pre-fetches the data for that endpoint.
       */
      usePrefetch<EndpointName extends QueryKeys<Definitions>>(
        endpointName: EndpointName,
        options?: PrefetchOptions
      ): (
        arg: QueryArgFrom<Definitions[EndpointName]>,
        options?: PrefetchOptions
      ) => void
    } & HooksWithUniqueNames<Definitions>
  }
}

type RR = typeof import('react-redux')

export interface ReactHooksModuleOptions {
  /**
   * The version of the `batchedUpdates` function to be used
   */
  batch?: RR['batch']
  /**
   * The version of the `useDispatch` hook to be used
   */
  useDispatch?: RR['useDispatch']
  /**
   * The version of the `useSelector` hook to be used
   */
  useSelector?: RR['useSelector']
  /**
   * The version of the `useStore` hook to be used
   */
  useStore?: RR['useStore']
  /**
   * Enables performing asynchronous tasks immediately within a render.
   *
   * @example
   *
   * ```ts
   * import {
   *   buildCreateApi,
   *   coreModule,
   *   reactHooksModule
   * } from '@reduxjs/toolkit/query/react'
   *
   * const createApi = buildCreateApi(
   *   coreModule(),
   *   reactHooksModule({ unstable__sideEffectsInRender: true })
   * )
   * ```
   */
  unstable__sideEffectsInRender?: boolean
}

/**
 * Creates a module that generates react hooks from endpoints, for use with `buildCreateApi`.
 *
 *  @example
 * ```ts
 * const MyContext = React.createContext<ReactReduxContextValue>(null as any);
 * const customCreateApi = buildCreateApi(
 *   coreModule(),
 *   reactHooksModule({ useDispatch: createDispatchHook(MyContext) })
 * );
 * ```
 *
 * @returns A module for use with `buildCreateApi`
 */
export const reactHooksModule = ({
  batch = rrBatch,
  useDispatch = rrUseDispatch,
  useSelector = rrUseSelector,
  useStore = rrUseStore,
  unstable__sideEffectsInRender = false,
}: ReactHooksModuleOptions = {}): Module<ReactHooksModule> => ({
  name: reactHooksModuleName,
  init(api, { serializeQueryArgs }, context) {
    const anyApi = api as any as Api<
      any,
      Record<string, any>,
      string,
      string,
      ReactHooksModule
    >
    const { buildQueryHooks, buildMutationHook, usePrefetch } = buildHooks({
      api,
      moduleOptions: {
        batch,
        useDispatch,
        useSelector,
        useStore,
        unstable__sideEffectsInRender,
      },
      serializeQueryArgs,
      context,
    })
    safeAssign(anyApi, { usePrefetch })
    safeAssign(context, { batch })

    return {
      injectEndpoint(endpointName, definition) {
        if (isQueryDefinition(definition)) {
          const {
            useQuery,
            useLazyQuery,
            useLazyQuerySubscription,
            useQueryState,
            useQuerySubscription,
          } = buildQueryHooks(endpointName)
          safeAssign(anyApi.endpoints[endpointName], {
            useQuery,
            useLazyQuery,
            useLazyQuerySubscription,
            useQueryState,
            useQuerySubscription,
          })
          ;(api as any)[`use${capitalize(endpointName)}Query`] = useQuery
          ;(api as any)[`useLazy${capitalize(endpointName)}Query`] =
            useLazyQuery
        } else if (isMutationDefinition(definition)) {
          const useMutation = buildMutationHook(endpointName)
          safeAssign(anyApi.endpoints[endpointName], {
            useMutation,
          })
          ;(api as any)[`use${capitalize(endpointName)}Mutation`] = useMutation
        }
      },
    }
  },
})
