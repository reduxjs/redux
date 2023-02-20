import type { QueryCacheKey } from './core/apiState'
import type { EndpointDefinition } from './endpointDefinitions'
import { isPlainObject } from '@reduxjs/toolkit'

const cache: WeakMap<any, string> | undefined = WeakMap
  ? new WeakMap()
  : undefined

export const defaultSerializeQueryArgs: SerializeQueryArgs<any> = ({
  endpointName,
  queryArgs,
}) => {
  let serialized = ''

  const cached = cache?.get(queryArgs)

  if (typeof cached === 'string') {
    serialized = cached
  } else {
    const stringified = JSON.stringify(queryArgs, (key, value) =>
      isPlainObject(value)
        ? Object.keys(value)
            .sort()
            .reduce<any>((acc, key) => {
              acc[key] = (value as any)[key]
              return acc
            }, {})
        : value
    )
    if (isPlainObject(queryArgs)) {
      cache?.set(queryArgs, stringified)
    }
    serialized = stringified
  }
  // Sort the object keys before stringifying, to prevent useQuery({ a: 1, b: 2 }) having a different cache key than useQuery({ b: 2, a: 1 })
  return `${endpointName}(${serialized})`
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
