import type { PayloadAction } from '../createAction'
import type { IsAny } from '../tsHelpers'

/**
 * @public
 */
export type EntityId = number | string

/**
 * @public
 */
export type Comparer<T> = (a: T, b: T) => number

/**
 * @public
 */
export type IdSelector<T> = (model: T) => EntityId

/**
 * @public
 */
export interface DictionaryNum<T> {
  [id: number]: T | undefined
}

/**
 * @public
 */
export interface Dictionary<T> extends DictionaryNum<T> {
  [id: string]: T | undefined
}

/**
 * @public
 */
export type Update<T> = { id: EntityId; changes: Partial<T> }

/**
 * @public
 */
export interface EntityState<T> {
  ids: EntityId[]
  entities: Dictionary<T>
}

/**
 * @public
 */
export interface EntityDefinition<T> {
  selectId: IdSelector<T>
  sortComparer: false | Comparer<T>
}

export type PreventAny<S, T> = IsAny<S, EntityState<T>, S>

/**
 * @public
 */
export interface EntityStateAdapter<T> {
  addOne<S extends EntityState<T>>(state: PreventAny<S, T>, entity: T): S
  addOne<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    action: PayloadAction<T>
  ): S

  addMany<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    entities: readonly T[] | Record<EntityId, T>
  ): S
  addMany<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    entities: PayloadAction<readonly T[] | Record<EntityId, T>>
  ): S

  setOne<S extends EntityState<T>>(state: PreventAny<S, T>, entity: T): S
  setOne<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    action: PayloadAction<T>
  ): S
  setMany<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    entities: readonly T[] | Record<EntityId, T>
  ): S
  setMany<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    entities: PayloadAction<readonly T[] | Record<EntityId, T>>
  ): S
  setAll<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    entities: readonly T[] | Record<EntityId, T>
  ): S
  setAll<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    entities: PayloadAction<readonly T[] | Record<EntityId, T>>
  ): S

  removeOne<S extends EntityState<T>>(state: PreventAny<S, T>, key: EntityId): S
  removeOne<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    key: PayloadAction<EntityId>
  ): S

  removeMany<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    keys: readonly EntityId[]
  ): S
  removeMany<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    keys: PayloadAction<readonly EntityId[]>
  ): S

  removeAll<S extends EntityState<T>>(state: PreventAny<S, T>): S

  updateOne<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    update: Update<T>
  ): S
  updateOne<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    update: PayloadAction<Update<T>>
  ): S

  updateMany<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    updates: ReadonlyArray<Update<T>>
  ): S
  updateMany<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    updates: PayloadAction<ReadonlyArray<Update<T>>>
  ): S

  upsertOne<S extends EntityState<T>>(state: PreventAny<S, T>, entity: T): S
  upsertOne<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    entity: PayloadAction<T>
  ): S

  upsertMany<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    entities: readonly T[] | Record<EntityId, T>
  ): S
  upsertMany<S extends EntityState<T>>(
    state: PreventAny<S, T>,
    entities: PayloadAction<readonly T[] | Record<EntityId, T>>
  ): S
}

/**
 * @public
 */
export interface EntitySelectors<T, V> {
  selectIds: (state: V) => EntityId[]
  selectEntities: (state: V) => Dictionary<T>
  selectAll: (state: V) => T[]
  selectTotal: (state: V) => number
  selectById: (state: V, id: EntityId) => T | undefined
}

/**
 * @public
 */
export interface EntityAdapter<T> extends EntityStateAdapter<T> {
  selectId: IdSelector<T>
  sortComparer: false | Comparer<T>
  getInitialState(): EntityState<T>
  getInitialState<S extends object>(state: S): EntityState<T> & S
  getSelectors(): EntitySelectors<T, EntityState<T>>
  getSelectors<V>(
    selectState: (state: V) => EntityState<T>
  ): EntitySelectors<T, V>
}
