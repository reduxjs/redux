import { current, isDraft } from 'immer'
import { createSelector } from 'reselect'

/**
 * "Draft-Safe" version of `reselect`'s `createSelector`:
 * If an `immer`-drafted object is passed into the resulting selector's first argument,
 * the selector will act on the current draft value, instead of returning a cached value
 * that might be possibly outdated if the draft has been modified since.
 * @public
 */
export const createDraftSafeSelector: typeof createSelector = (
  ...args: unknown[]
) => {
  const selector = (createSelector as any)(...args)
  const wrappedSelector = (value: unknown, ...rest: unknown[]) =>
    selector(isDraft(value) ? current(value) : value, ...rest)
  return wrappedSelector as any
}
