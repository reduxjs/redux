import type { Selector } from 'reselect'
import { createDraftSafeSelector } from '../createDraftSafeSelector'
import type {
  EntityState,
  EntitySelectors,
  Dictionary,
  EntityId,
} from './models'

export function createSelectorsFactory<T>() {
  function getSelectors(): EntitySelectors<T, EntityState<T>>
  function getSelectors<V>(
    selectState: (state: V) => EntityState<T>
  ): EntitySelectors<T, V>
  function getSelectors<V>(
    selectState?: (state: V) => EntityState<T>
  ): EntitySelectors<T, any> {
    const selectIds = (state: EntityState<T>) => state.ids

    const selectEntities = (state: EntityState<T>) => state.entities

    const selectAll = createDraftSafeSelector(
      selectIds,
      selectEntities,
      (ids, entities): T[] => ids.map((id) => entities[id]!)
    )

    const selectId = (_: unknown, id: EntityId) => id

    const selectById = (entities: Dictionary<T>, id: EntityId) => entities[id]

    const selectTotal = createDraftSafeSelector(selectIds, (ids) => ids.length)

    if (!selectState) {
      return {
        selectIds,
        selectEntities,
        selectAll,
        selectTotal,
        selectById: createDraftSafeSelector(
          selectEntities,
          selectId,
          selectById
        ),
      }
    }

    const selectGlobalizedEntities = createDraftSafeSelector(
      selectState as Selector<V, EntityState<T>>,
      selectEntities
    )

    return {
      selectIds: createDraftSafeSelector(selectState, selectIds),
      selectEntities: selectGlobalizedEntities,
      selectAll: createDraftSafeSelector(selectState, selectAll),
      selectTotal: createDraftSafeSelector(selectState, selectTotal),
      selectById: createDraftSafeSelector(
        selectGlobalizedEntities,
        selectId,
        selectById
      ),
    }
  }

  return { getSelectors }
}
