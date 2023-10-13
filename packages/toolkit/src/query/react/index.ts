import { coreModule, buildCreateApi } from '@reduxjs/toolkit/query'
import { reactHooksModule, reactHooksModuleName } from './module'

export * from '@reduxjs/toolkit/query'
export { ApiProvider } from './ApiProvider'

const createApi = /* @__PURE__ */ buildCreateApi(
  coreModule(),
  reactHooksModule()
)

export type {
  TypedUseQueryHookResult,
  TypedUseQueryStateResult,
  TypedUseQuerySubscriptionResult,
  TypedUseMutationResult,
} from './buildHooks'
export { createApi, reactHooksModule, reactHooksModuleName }
