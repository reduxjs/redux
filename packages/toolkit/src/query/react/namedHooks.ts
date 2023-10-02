import type { UseMutation, UseLazyQuery, UseQuery } from './buildHooks'
import type {
  DefinitionType,
  EndpointDefinitions,
  MutationDefinition,
  QueryDefinition,
} from '@reduxjs/toolkit/query'

export type HooksWithUniqueNames<Definitions extends EndpointDefinitions> = {
  [K in keyof Definitions as Definitions[K] extends {
    type: DefinitionType.query
  }
    ? `use${Capitalize<K & string>}Query`
    : never]: UseQuery<
    Extract<Definitions[K], QueryDefinition<any, any, any, any>>
  >
} &
  {
    [K in keyof Definitions as Definitions[K] extends {
      type: DefinitionType.query
    }
      ? `useLazy${Capitalize<K & string>}Query`
      : never]: UseLazyQuery<
      Extract<Definitions[K], QueryDefinition<any, any, any, any>>
    >
  } &
  {
    [K in keyof Definitions as Definitions[K] extends {
      type: DefinitionType.mutation
    }
      ? `use${Capitalize<K & string>}Mutation`
      : never]: UseMutation<
      Extract<Definitions[K], MutationDefinition<any, any, any, any>>
    >
  }
