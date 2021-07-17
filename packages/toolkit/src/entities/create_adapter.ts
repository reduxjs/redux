import type {
  EntityDefinition,
  Comparer,
  IdSelector,
  EntityAdapter,
} from './models'
import { createInitialStateFactory } from './entity_state'
import { createSelectorsFactory } from './state_selectors'
import { createSortedStateAdapter } from './sorted_state_adapter'
import { createUnsortedStateAdapter } from './unsorted_state_adapter'

/**
 *
 * @param options
 *
 * @public
 */
export function createEntityAdapter<T>(
  options: {
    selectId?: IdSelector<T>
    sortComparer?: false | Comparer<T>
  } = {}
): EntityAdapter<T> {
  const { selectId, sortComparer }: EntityDefinition<T> = {
    sortComparer: false,
    selectId: (instance: any) => instance.id,
    ...options,
  }

  const stateFactory = createInitialStateFactory<T>()
  const selectorsFactory = createSelectorsFactory<T>()
  const stateAdapter = sortComparer
    ? createSortedStateAdapter(selectId, sortComparer)
    : createUnsortedStateAdapter(selectId)

  return {
    selectId,
    sortComparer,
    ...stateFactory,
    ...selectorsFactory,
    ...stateAdapter,
  }
}
