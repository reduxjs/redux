import type {
  EntityState,
  EntityStateAdapter,
  IdSelector,
  Update,
  EntityId,
} from './models'
import {
  createStateOperator,
  createSingleArgumentStateOperator,
} from './state_adapter'
import {
  selectIdValue,
  ensureEntitiesArray,
  splitAddedUpdatedEntities,
} from './utils'

export function createUnsortedStateAdapter<T>(
  selectId: IdSelector<T>
): EntityStateAdapter<T> {
  type R = EntityState<T>

  function addOneMutably(entity: T, state: R): void {
    const key = selectIdValue(entity, selectId)

    if (key in state.entities) {
      return
    }

    state.ids.push(key)
    state.entities[key] = entity
  }

  function addManyMutably(
    newEntities: readonly T[] | Record<EntityId, T>,
    state: R
  ): void {
    newEntities = ensureEntitiesArray(newEntities)

    for (const entity of newEntities) {
      addOneMutably(entity, state)
    }
  }

  function setOneMutably(entity: T, state: R): void {
    const key = selectIdValue(entity, selectId)
    if (!(key in state.entities)) {
      state.ids.push(key)
    }
    state.entities[key] = entity
  }

  function setManyMutably(
    newEntities: readonly T[] | Record<EntityId, T>,
    state: R
  ): void {
    newEntities = ensureEntitiesArray(newEntities)
    for (const entity of newEntities) {
      setOneMutably(entity, state)
    }
  }

  function setAllMutably(
    newEntities: readonly T[] | Record<EntityId, T>,
    state: R
  ): void {
    newEntities = ensureEntitiesArray(newEntities)

    state.ids = []
    state.entities = {}

    addManyMutably(newEntities, state)
  }

  function removeOneMutably(key: EntityId, state: R): void {
    return removeManyMutably([key], state)
  }

  function removeManyMutably(keys: readonly EntityId[], state: R): void {
    let didMutate = false

    keys.forEach((key) => {
      if (key in state.entities) {
        delete state.entities[key]
        didMutate = true
      }
    })

    if (didMutate) {
      state.ids = state.ids.filter((id) => id in state.entities)
    }
  }

  function removeAllMutably(state: R): void {
    Object.assign(state, {
      ids: [],
      entities: {},
    })
  }

  function takeNewKey(
    keys: { [id: string]: EntityId },
    update: Update<T>,
    state: R
  ): boolean {
    const original = state.entities[update.id]
    const updated: T = Object.assign({}, original, update.changes)
    const newKey = selectIdValue(updated, selectId)
    const hasNewKey = newKey !== update.id

    if (hasNewKey) {
      keys[update.id] = newKey
      delete state.entities[update.id]
    }

    state.entities[newKey] = updated

    return hasNewKey
  }

  function updateOneMutably(update: Update<T>, state: R): void {
    return updateManyMutably([update], state)
  }

  function updateManyMutably(
    updates: ReadonlyArray<Update<T>>,
    state: R
  ): void {
    const newKeys: { [id: string]: EntityId } = {}

    const updatesPerEntity: { [id: string]: Update<T> } = {}

    updates.forEach((update) => {
      // Only apply updates to entities that currently exist
      if (update.id in state.entities) {
        // If there are multiple updates to one entity, merge them together
        updatesPerEntity[update.id] = {
          id: update.id,
          // Spreads ignore falsy values, so this works even if there isn't
          // an existing update already at this key
          changes: {
            ...(updatesPerEntity[update.id]
              ? updatesPerEntity[update.id].changes
              : null),
            ...update.changes,
          },
        }
      }
    })

    updates = Object.values(updatesPerEntity)

    const didMutateEntities = updates.length > 0

    if (didMutateEntities) {
      const didMutateIds =
        updates.filter((update) => takeNewKey(newKeys, update, state)).length >
        0

      if (didMutateIds) {
        state.ids = state.ids.map((id) => newKeys[id] || id)
      }
    }
  }

  function upsertOneMutably(entity: T, state: R): void {
    return upsertManyMutably([entity], state)
  }

  function upsertManyMutably(
    newEntities: readonly T[] | Record<EntityId, T>,
    state: R
  ): void {
    const [added, updated] = splitAddedUpdatedEntities<T>(
      newEntities,
      selectId,
      state
    )

    updateManyMutably(updated, state)
    addManyMutably(added, state)
  }

  return {
    removeAll: createSingleArgumentStateOperator(removeAllMutably),
    addOne: createStateOperator(addOneMutably),
    addMany: createStateOperator(addManyMutably),
    setOne: createStateOperator(setOneMutably),
    setMany: createStateOperator(setManyMutably),
    setAll: createStateOperator(setAllMutably),
    updateOne: createStateOperator(updateOneMutably),
    updateMany: createStateOperator(updateManyMutably),
    upsertOne: createStateOperator(upsertOneMutably),
    upsertMany: createStateOperator(upsertManyMutably),
    removeOne: createStateOperator(removeOneMutably),
    removeMany: createStateOperator(removeManyMutably),
  }
}
