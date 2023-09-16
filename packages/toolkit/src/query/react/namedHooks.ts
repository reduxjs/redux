import type { UseMutation, UseLazyQuery, UseQuery } from './buildHooks'
import type {
  DefinitionType,
  EndpointDefinitions,
  MutationDefinition,
  QueryDefinition,
} from '@reduxjs/toolkit/query'

export type HooksWithUniqueNames<Definitions extends EndpointDefinitions> =
  keyof Definitions extends infer Keys
    ? Keys extends string
      ? Definitions[Keys] extends { type: DefinitionType.query }
        ? {
            [K in Keys as `use${Capitalize<K>}Query`]: UseQuery<
              Extract<Definitions[K], QueryDefinition<any, any, any, any>>
            >
          } &
            {
              [K in Keys as `useLazy${Capitalize<K>}Query`]: UseLazyQuery<
                Extract<Definitions[K], QueryDefinition<any, any, any, any>>
              >
            }
        : Definitions[Keys] extends { type: DefinitionType.mutation }
        ? {
            [K in Keys as `use${Capitalize<K>}Mutation`]: UseMutation<
              Extract<Definitions[K], MutationDefinition<any, any, any, any>>
            >
          }
        : never
      : never
    : never
