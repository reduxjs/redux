import type { SubMiddlewareBuilder } from './types'

export const build: SubMiddlewareBuilder = ({
  api,
  context: { apiUid },
  reducerPath,
}) => {
  return (mwApi) => {
    let initialized = false
    return (next) => (action) => {
      if (!initialized) {
        initialized = true
        // dispatch before any other action
        mwApi.dispatch(api.internalActions.middlewareRegistered(apiUid))
      }

      const result = next(action)

      if (api.util.resetApiState.match(action)) {
        // dispatch after api reset
        mwApi.dispatch(api.internalActions.middlewareRegistered(apiUid))
      }

      if (
        typeof process !== 'undefined' &&
        process.env.NODE_ENV === 'development'
      ) {
        if (
          api.internalActions.middlewareRegistered.match(action) &&
          action.payload === apiUid &&
          mwApi.getState()[reducerPath]?.config?.middlewareRegistered ===
            'conflict'
        ) {
          console.warn(`There is a mismatch between slice and middleware for the reducerPath "${reducerPath}".
You can only have one api per reducer path, this will lead to crashes in various situations!${
            reducerPath === 'api'
              ? `
If you have multiple apis, you *have* to specify the reducerPath option when using createApi!`
              : ''
          }`)
        }
      }

      return result
    }
  }
}
