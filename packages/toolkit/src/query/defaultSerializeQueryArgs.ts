import type { QueryCacheKey } from './core/apiState'
import type { EndpointDefinition } from './endpointDefinitions'
import { isPlainObject } from '@reduxjs/toolkit'

export const defaultSerializeQueryArgs: SerializeQueryArgs<any> = ({
  endpointName,
  queryArgs,
}) => {
  // Sort the object keys before stringifying, to prevent useQuery({ a: 1, b: 2 }) having a different cache key than useQuery({ b: 2, a: 1 })
  return `${endpointName}(${JSON.stringify(queryArgs, (key, value) =>
    isPlainObject(value)
      ? Object.keys(value)
          .sort()
          .reduce<any>((acc, key) => {
            acc[key] = (value as any)[key]
            return acc
          }, {})
      : value
  )})`
}

export type SerializeQueryArgs<QueryArgs, ReturnType = string> = (_: {
  queryArgs: QueryArgs
  endpointDefinition: EndpointDefinition<any, any, any, any>
  endpointName: string
}) => ReturnType

export type InternalSerializeQueryArgs = (_: {
  queryArgs: any
  endpointDefinition: EndpointDefinition<any, any, any, any>
  endpointName: string
}) => QueryCacheKey
