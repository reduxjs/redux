import { Dictionary } from '@reduxjs/toolkit'
import {
  defaultSerializeQueryArgs,
  SerializeQueryArgs,
} from './defaultSerializeQueryArgs'

export function buildSerializeQueryArgs(
  globalSerializer: SerializeQueryArgs<any> = defaultSerializeQueryArgs
) {
  const endpointSpecificSerializers: Dictionary<SerializeQueryArgs<any>> = {}

  const serializeQueryArgs: SerializeQueryArgs<any> = (params) => {
    const endpointSpecificSerializer =
      endpointSpecificSerializers[params.endpointName]

    if (endpointSpecificSerializer) {
      return endpointSpecificSerializer(params)
    }

    return globalSerializer(params)
  }

  const registerArgsSerializerForEndpoint = (
    endpointName: string,
    serializer: SerializeQueryArgs<any>
  ) => {
    endpointSpecificSerializers[endpointName] = serializer
  }

  return {
    serializeQueryArgs,
    registerArgsSerializerForEndpoint,
  }
}
