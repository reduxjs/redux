import type { UseMutation, UseLazyQuery, UseQuery } from './buildHooks'
import type {
  DefinitionType,
  EndpointDefinitions,
  MutationDefinition,
  QueryDefinition,
} from '@reduxjs/toolkit/query'

type QueryHookNames<Definitions extends EndpointDefinitions> = {
  [K in keyof Definitions as Definitions[K] extends {
    type: DefinitionType.query
  }
    ? `use${Capitalize<K & string>}Query`
    : never]: UseQuery<
    Extract<Definitions[K], QueryDefinition<any, any, any, any>>
  >
}

type LazyQueryHookNames<Definitions extends EndpointDefinitions> = {
  [K in keyof Definitions as Definitions[K] extends {
    type: DefinitionType.query
  }
    ? `useLazy${Capitalize<K & string>}Query`
    : never]: UseLazyQuery<
    Extract<Definitions[K], QueryDefinition<any, any, any, any>>
  >
}

type MutationHookNames<Definitions extends EndpointDefinitions> = {
  [K in keyof Definitions as Definitions[K] extends {
    type: DefinitionType.mutation
  }
    ? `use${Capitalize<K & string>}Mutation`
    : never]: UseMutation<
    Extract<Definitions[K], MutationDefinition<any, any, any, any>>
  >
}

export type HooksWithUniqueNames<Definitions extends EndpointDefinitions> =
  QueryHookNames<Definitions> &
    LazyQueryHookNames<Definitions> &
    MutationHookNames<Definitions>
