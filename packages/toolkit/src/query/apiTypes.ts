import type {
  EndpointDefinitions,
  EndpointBuilder,
  EndpointDefinition,
  ReplaceTagTypes,
} from './endpointDefinitions'
import type {
  UnionToIntersection,
  NoInfer,
  WithRequiredProp,
} from './tsHelpers'
import type { CoreModule } from './core/module'
import type { CreateApiOptions } from './createApi'
import type { BaseQueryFn } from './baseQueryTypes'
import type { CombinedState } from './core/apiState'
import type { AnyAction } from '@reduxjs/toolkit'

export interface ApiModules<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BaseQuery extends BaseQueryFn,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Definitions extends EndpointDefinitions,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ReducerPath extends string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TagTypes extends string
> {}

export type ModuleName = keyof ApiModules<any, any, any, any>

export type Module<Name extends ModuleName> = {
  name: Name
  init<
    BaseQuery extends BaseQueryFn,
    Definitions extends EndpointDefinitions,
    ReducerPath extends string,
    TagTypes extends string
  >(
    api: Api<BaseQuery, EndpointDefinitions, ReducerPath, TagTypes, ModuleName>,
    options: WithRequiredProp<
      CreateApiOptions<BaseQuery, Definitions, ReducerPath, TagTypes>,
      | 'reducerPath'
      | 'serializeQueryArgs'
      | 'keepUnusedDataFor'
      | 'refetchOnMountOrArgChange'
      | 'refetchOnFocus'
      | 'refetchOnReconnect'
      | 'tagTypes'
    >,
    context: ApiContext<Definitions>
  ): {
    injectEndpoint(
      endpointName: string,
      definition: EndpointDefinition<any, any, any, any>
    ): void
  }
}

export interface ApiContext<Definitions extends EndpointDefinitions> {
  apiUid: string
  endpointDefinitions: Definitions
  batch(cb: () => void): void
  extractRehydrationInfo: (
    action: AnyAction
  ) => CombinedState<any, any, any> | undefined
  hasRehydrationInfo: (action: AnyAction) => boolean
}

export type Api<
  BaseQuery extends BaseQueryFn,
  Definitions extends EndpointDefinitions,
  ReducerPath extends string,
  TagTypes extends string,
  Enhancers extends ModuleName = CoreModule
> = UnionToIntersection<
  ApiModules<BaseQuery, Definitions, ReducerPath, TagTypes>[Enhancers]
> & {
  /**
   * A function to inject the endpoints into the original API, but also give you that same API with correct types for these endpoints back. Useful with code-splitting.
   */
  injectEndpoints<NewDefinitions extends EndpointDefinitions>(_: {
    endpoints: (
      build: EndpointBuilder<BaseQuery, TagTypes, ReducerPath>
    ) => NewDefinitions
    overrideExisting?: boolean
  }): Api<
    BaseQuery,
    Definitions & NewDefinitions,
    ReducerPath,
    TagTypes,
    Enhancers
  >
  /**
   *A function to enhance a generated API with additional information. Useful with code-generation.
   */
  enhanceEndpoints<NewTagTypes extends string = never>(_: {
    addTagTypes?: readonly NewTagTypes[]
    endpoints?: ReplaceTagTypes<
      Definitions,
      TagTypes | NoInfer<NewTagTypes>
    > extends infer NewDefinitions
      ? {
          [K in keyof NewDefinitions]?:
            | Partial<NewDefinitions[K]>
            | ((definition: NewDefinitions[K]) => void)
        }
      : never
  }): Api<
    BaseQuery,
    ReplaceTagTypes<Definitions, TagTypes | NewTagTypes>,
    ReducerPath,
    TagTypes | NewTagTypes,
    Enhancers
  >
}
