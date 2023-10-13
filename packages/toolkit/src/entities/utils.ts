import type { EntityState, IdSelector, Update, EntityId } from './models'

export function selectIdValue<T>(entity: T, selectId: IdSelector<T>) {
  const key = selectId(entity)

  if (process.env.NODE_ENV !== 'production' && key === undefined) {
    console.warn(
      'The entity passed to the `selectId` implementation returned undefined.',
      'You should probably provide your own `selectId` implementation.',
      'The entity that was passed:',
      entity,
      'The `selectId` implementation:',
      selectId.toString()
    )
  }

  return key
}

export function ensureEntitiesArray<T>(
  entities: readonly T[] | Record<EntityId, T>
): readonly T[] {
  if (!Array.isArray(entities)) {
    entities = Object.values(entities)
  }

  return entities
}

export function splitAddedUpdatedEntities<T>(
  newEntities: readonly T[] | Record<EntityId, T>,
  selectId: IdSelector<T>,
  state: EntityState<T>
): [T[], Update<T>[]] {
  newEntities = ensureEntitiesArray(newEntities)

  const added: T[] = []
  const updated: Update<T>[] = []

  for (const entity of newEntities) {
    const id = selectIdValue(entity, selectId)
    if (id in state.entities) {
      updated.push({ id, changes: entity })
    } else {
      added.push(entity)
    }
  }
  return [added, updated]
}
