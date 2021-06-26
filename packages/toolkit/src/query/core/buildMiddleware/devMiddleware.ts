import type { SubMiddlewareBuilder } from './types'

export const build: SubMiddlewareBuilder = ({ api }) => {
  return (mwApi) => {
    let initialized = false
    return (next) => (action) => {
      if (!initialized) {
        initialized = true
        // dispatch before any other action
        mwApi.dispatch(api.internalActions.middlewareRegistered())
      }

      const result = next(action)

      if (api.util.resetApiState.match(action)) {
        // dispatch after api reset
        mwApi.dispatch(api.internalActions.middlewareRegistered())
      }

      return result
    }
  }
}
