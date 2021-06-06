import type { EndpointDefinitions } from '@reduxjs/toolkit/dist/query/endpointDefinitions'

// For TS 4.0 and earlier, disallow use of the per-endpoint
// hooks defined at the root of each API object, because we
// can't use the string literal types here.
export declare type HooksWithUniqueNames<
  Definitions extends EndpointDefinitions
> = unknown
export {}
