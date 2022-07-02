import type { EntityAdapter, EntityState } from '../models'
import { createEntityAdapter } from '../create_adapter'
import { createAction, createSlice, configureStore } from '@reduxjs/toolkit'
import type { BookModel } from './fixtures/book'
import {
  TheGreatGatsby,
  AClockworkOrange,
  AnimalFarm,
  TheHobbit,
} from './fixtures/book'
import { createNextState } from '../..'

describe('Sorted State Adapter', () => {
  let adapter: EntityAdapter<BookModel>
  let state: EntityState<BookModel>

  beforeAll(() => {
    //eslint-disable-next-line
    Object.defineProperty(Array.prototype, 'unwantedField', {
      enumerable: true,
      configurable: true,
      value: 'This should not appear anywhere',
    })
  })

  afterAll(() => {
    delete (Array.prototype as any).unwantedField
  })

  beforeEach(() => {
    adapter = createEntityAdapter({
      selectId: (book: BookModel) => book.id,
      sortComparer: (a, b) => {
        return a.title.localeCompare(b.title)
      },
    })

    state = { ids: [], entities: {} }
  })

  it('should let you add one entity to the state', () => {
    const withOneEntity = adapter.addOne(state, TheGreatGatsby)

    expect(withOneEntity).toEqual({
      ids: [TheGreatGatsby.id],
      entities: {
        [TheGreatGatsby.id]: TheGreatGatsby,
      },
    })
  })

  it('should let you add one entity to the state as an FSA', () => {
    const bookAction = createAction<BookModel>('books/add')
    const withOneEntity = adapter.addOne(state, bookAction(TheGreatGatsby))

    expect(withOneEntity).toEqual({
      ids: [TheGreatGatsby.id],
      entities: {
        [TheGreatGatsby.id]: TheGreatGatsby,
      },
    })
  })

  it('should not change state if you attempt to re-add an entity', () => {
    const withOneEntity = adapter.addOne(state, TheGreatGatsby)

    const readded = adapter.addOne(withOneEntity, TheGreatGatsby)

    expect(readded).toBe(withOneEntity)
  })

  it('should let you add many entities to the state', () => {
    const withOneEntity = adapter.addOne(state, TheGreatGatsby)

    const withManyMore = adapter.addMany(withOneEntity, [
      AClockworkOrange,
      AnimalFarm,
    ])

    expect(withManyMore).toEqual({
      ids: [AClockworkOrange.id, AnimalFarm.id, TheGreatGatsby.id],
      entities: {
        [TheGreatGatsby.id]: TheGreatGatsby,
        [AClockworkOrange.id]: AClockworkOrange,
        [AnimalFarm.id]: AnimalFarm,
      },
    })
  })

  it('should let you add many entities to the state from a dictionary', () => {
    const withOneEntity = adapter.addOne(state, TheGreatGatsby)

    const withManyMore = adapter.addMany(withOneEntity, {
      [AClockworkOrange.id]: AClockworkOrange,
      [AnimalFarm.id]: AnimalFarm,
    })

    expect(withManyMore).toEqual({
      ids: [AClockworkOrange.id, AnimalFarm.id, TheGreatGatsby.id],
      entities: {
        [TheGreatGatsby.id]: TheGreatGatsby,
        [AClockworkOrange.id]: AClockworkOrange,
        [AnimalFarm.id]: AnimalFarm,
      },
    })
  })

  it('should remove existing and add new ones on setAll', () => {
    const withOneEntity = adapter.addOne(state, TheGreatGatsby)

    const withAll = adapter.setAll(withOneEntity, [
      AClockworkOrange,
      AnimalFarm,
    ])

    expect(withAll).toEqual({
      ids: [AClockworkOrange.id, AnimalFarm.id],
      entities: {
        [AClockworkOrange.id]: AClockworkOrange,
        [AnimalFarm.id]: AnimalFarm,
      },
    })
  })

  it('should remove existing and add new ones on setAll when passing in a dictionary', () => {
    const withOneEntity = adapter.addOne(state, TheGreatGatsby)

    const withAll = adapter.setAll(withOneEntity, {
      [AClockworkOrange.id]: AClockworkOrange,
      [AnimalFarm.id]: AnimalFarm,
    })

    expect(withAll).toEqual({
      ids: [AClockworkOrange.id, AnimalFarm.id],
      entities: {
        [AClockworkOrange.id]: AClockworkOrange,
        [AnimalFarm.id]: AnimalFarm,
      },
    })
  })

  it('should remove existing and add new ones on addAll (deprecated)', () => {
    const withOneEntity = adapter.addOne(state, TheGreatGatsby)

    const withAll = adapter.setAll(withOneEntity, [
      AClockworkOrange,
      AnimalFarm,
    ])

    expect(withAll).toEqual({
      ids: [AClockworkOrange.id, AnimalFarm.id],
      entities: {
        [AClockworkOrange.id]: AClockworkOrange,
        [AnimalFarm.id]: AnimalFarm,
      },
    })
  })

  it('should let you add remove an entity from the state', () => {
    const withOneEntity = adapter.addOne(state, TheGreatGatsby)

    const withoutOne = adapter.removeOne(withOneEntity, TheGreatGatsby.id)

    expect(withoutOne).toEqual({
      ids: [],
      entities: {},
    })
  })

  it('should let you remove many entities by id from the state', () => {
    const withAll = adapter.setAll(state, [
      TheGreatGatsby,
      AClockworkOrange,
      AnimalFarm,
    ])

    const withoutMany = adapter.removeMany(withAll, [
      TheGreatGatsby.id,
      AClockworkOrange.id,
    ])

    expect(withoutMany).toEqual({
      ids: [AnimalFarm.id],
      entities: {
        [AnimalFarm.id]: AnimalFarm,
      },
    })
  })

  it('should let you remove all entities from the state', () => {
    const withAll = adapter.setAll(state, [
      TheGreatGatsby,
      AClockworkOrange,
      AnimalFarm,
    ])

    const withoutAll = adapter.removeAll(withAll)

    expect(withoutAll).toEqual({
      ids: [],
      entities: {},
    })
  })

  it('should let you update an entity in the state', () => {
    const withOne = adapter.addOne(state, TheGreatGatsby)
    const changes = { title: 'A New Hope' }

    const withUpdates = adapter.updateOne(withOne, {
      id: TheGreatGatsby.id,
      changes,
    })

    expect(withUpdates).toEqual({
      ids: [TheGreatGatsby.id],
      entities: {
        [TheGreatGatsby.id]: {
          ...TheGreatGatsby,
          ...changes,
        },
      },
    })
  })

  it('should not change state if you attempt to update an entity that has not been added', () => {
    const withUpdates = adapter.updateOne(state, {
      id: TheGreatGatsby.id,
      changes: { title: 'A New Title' },
    })

    expect(withUpdates).toBe(state)
  })

  it('Replaces an existing entity if you change the ID while updating', () => {
    const withAdded = adapter.setAll(state, [
      { id: 'a', title: 'First' },
      { id: 'b', title: 'Second' },
      { id: 'c', title: 'Third' },
    ])

    const withUpdated = adapter.updateOne(withAdded, {
      id: 'b',
      changes: {
        id: 'c',
      },
    })

    const { ids, entities } = withUpdated

    expect(ids.length).toBe(2)
    expect(entities.a).toBeTruthy()
    expect(entities.b).not.toBeTruthy()
    expect(entities.c).toBeTruthy()
    expect(entities.c!.id).toBe('c')
    expect(entities.c!.title).toBe('Second')
  })

  it('should not change ids state if you attempt to update an entity that does not impact sorting', () => {
    const withAll = adapter.setAll(state, [
      TheGreatGatsby,
      AClockworkOrange,
      AnimalFarm,
    ])
    const changes = { title: 'The Great Gatsby II' }

    const withUpdates = adapter.updateOne(withAll, {
      id: TheGreatGatsby.id,
      changes,
    })

    expect(withAll.ids).toBe(withUpdates.ids)
  })

  it('should let you update the id of entity', () => {
    const withOne = adapter.addOne(state, TheGreatGatsby)
    const changes = { id: 'A New Id' }

    const withUpdates = adapter.updateOne(withOne, {
      id: TheGreatGatsby.id,
      changes,
    })

    expect(withUpdates).toEqual({
      ids: [changes.id],
      entities: {
        [changes.id]: {
          ...TheGreatGatsby,
          ...changes,
        },
      },
    })
  })

  it('should resort correctly if same id but sort key update', () => {
    const withAll = adapter.setAll(state, [
      TheGreatGatsby,
      AnimalFarm,
      AClockworkOrange,
    ])
    const changes = { title: 'A New Hope' }

    const withUpdates = adapter.updateOne(withAll, {
      id: TheGreatGatsby.id,
      changes,
    })

    expect(withUpdates).toEqual({
      ids: [AClockworkOrange.id, TheGreatGatsby.id, AnimalFarm.id],
      entities: {
        [AClockworkOrange.id]: AClockworkOrange,
        [TheGreatGatsby.id]: {
          ...TheGreatGatsby,
          ...changes,
        },
        [AnimalFarm.id]: AnimalFarm,
      },
    })
  })

  it('should resort correctly if the id and sort key update', () => {
    const withOne = adapter.setAll(state, [
      TheGreatGatsby,
      AnimalFarm,
      AClockworkOrange,
    ])
    const changes = { id: 'A New Id', title: 'A New Hope' }

    const withUpdates = adapter.updateOne(withOne, {
      id: TheGreatGatsby.id,
      changes,
    })

    expect(withUpdates).toEqual({
      ids: [AClockworkOrange.id, changes.id, AnimalFarm.id],
      entities: {
        [AClockworkOrange.id]: AClockworkOrange,
        [changes.id]: {
          ...TheGreatGatsby,
          ...changes,
        },
        [AnimalFarm.id]: AnimalFarm,
      },
    })
  })

  it('should maintain a stable sorting order when updating items', () => {
    interface OrderedEntity {
      id: string
      order: number
      ts: number
    }
    const sortedItemsAdapter = createEntityAdapter<OrderedEntity>({
      sortComparer: (a, b) => a.order - b.order,
    })
    const withInitialItems = sortedItemsAdapter.setAll(
      sortedItemsAdapter.getInitialState(),
      [
        { id: 'A', order: 1, ts: 0 },
        { id: 'B', order: 2, ts: 0 },
        { id: 'C', order: 3, ts: 0 },
        { id: 'D', order: 3, ts: 0 },
        { id: 'E', order: 3, ts: 0 },
      ]
    )

    const updated = sortedItemsAdapter.updateOne(withInitialItems, {
      id: 'C',
      changes: { ts: 5 },
    })

    expect(updated.ids).toEqual(['A', 'B', 'C', 'D', 'E'])
  })

  it('should let you update many entities by id in the state', () => {
    const firstChange = { title: 'Zack' }
    const secondChange = { title: 'Aaron' }
    const withMany = adapter.setAll(state, [TheGreatGatsby, AClockworkOrange])

    const withUpdates = adapter.updateMany(withMany, [
      { id: TheGreatGatsby.id, changes: firstChange },
      { id: AClockworkOrange.id, changes: secondChange },
    ])

    expect(withUpdates).toEqual({
      ids: [AClockworkOrange.id, TheGreatGatsby.id],
      entities: {
        [TheGreatGatsby.id]: {
          ...TheGreatGatsby,
          ...firstChange,
        },
        [AClockworkOrange.id]: {
          ...AClockworkOrange,
          ...secondChange,
        },
      },
    })
  })

  it('should let you add one entity to the state with upsert()', () => {
    const withOneEntity = adapter.upsertOne(state, TheGreatGatsby)
    expect(withOneEntity).toEqual({
      ids: [TheGreatGatsby.id],
      entities: {
        [TheGreatGatsby.id]: TheGreatGatsby,
      },
    })
  })

  it('should let you update an entity in the state with upsert()', () => {
    const withOne = adapter.addOne(state, TheGreatGatsby)
    const changes = { title: 'A New Hope' }

    const withUpdates = adapter.upsertOne(withOne, {
      ...TheGreatGatsby,
      ...changes,
    })
    expect(withUpdates).toEqual({
      ids: [TheGreatGatsby.id],
      entities: {
        [TheGreatGatsby.id]: {
          ...TheGreatGatsby,
          ...changes,
        },
      },
    })
  })

  it('should let you upsert many entities in the state', () => {
    const firstChange = { title: 'Zack' }
    const withMany = adapter.setAll(state, [TheGreatGatsby])

    const withUpserts = adapter.upsertMany(withMany, [
      { ...TheGreatGatsby, ...firstChange },
      AClockworkOrange,
    ])

    expect(withUpserts).toEqual({
      ids: [AClockworkOrange.id, TheGreatGatsby.id],
      entities: {
        [TheGreatGatsby.id]: {
          ...TheGreatGatsby,
          ...firstChange,
        },
        [AClockworkOrange.id]: AClockworkOrange,
      },
    })
  })

  it('should do nothing when upsertMany is given an empty array', () => {
    const withMany = adapter.setAll(state, [TheGreatGatsby])

    const withUpserts = adapter.upsertMany(withMany, [])

    expect(withUpserts).toEqual({
      ids: [TheGreatGatsby.id],
      entities: {
        [TheGreatGatsby.id]: TheGreatGatsby,
      },
    })
  })

  it('should throw when upsertMany is passed undefined or null', async () => {
    const withMany = adapter.setAll(state, [TheGreatGatsby])

    const fakeRequest = (response: null | undefined) =>
      new Promise((resolve) => setTimeout(() => resolve(response), 50))

    const undefinedBooks = (await fakeRequest(undefined)) as BookModel[]
    expect(() => adapter.upsertMany(withMany, undefinedBooks)).toThrow()

    const nullBooks = (await fakeRequest(null)) as BookModel[]
    expect(() => adapter.upsertMany(withMany, nullBooks)).toThrow()
  })

  it('should let you upsert many entities in the state when passing in a dictionary', () => {
    const firstChange = { title: 'Zack' }
    const withMany = adapter.setAll(state, [TheGreatGatsby])

    const withUpserts = adapter.upsertMany(withMany, {
      [TheGreatGatsby.id]: { ...TheGreatGatsby, ...firstChange },
      [AClockworkOrange.id]: AClockworkOrange,
    })

    expect(withUpserts).toEqual({
      ids: [AClockworkOrange.id, TheGreatGatsby.id],
      entities: {
        [TheGreatGatsby.id]: {
          ...TheGreatGatsby,
          ...firstChange,
        },
        [AClockworkOrange.id]: AClockworkOrange,
      },
    })
  })

  it('should let you add a new entity in the state with setOne() and keep the sorting', () => {
    const withMany = adapter.setAll(state, [AnimalFarm, TheHobbit])
    const withOneMore = adapter.setOne(withMany, TheGreatGatsby)
    expect(withOneMore).toEqual({
      ids: [AnimalFarm.id, TheGreatGatsby.id, TheHobbit.id],
      entities: {
        [AnimalFarm.id]: AnimalFarm,
        [TheHobbit.id]: TheHobbit,
        [TheGreatGatsby.id]: TheGreatGatsby,
      },
    })
  })

  it('should let you replace an entity in the state with setOne()', () => {
    let withOne = adapter.setOne(state, TheHobbit)
    const changeWithoutAuthor = { id: TheHobbit.id, title: 'Silmarillion' }
    withOne = adapter.setOne(withOne, changeWithoutAuthor)

    expect(withOne).toEqual({
      ids: [TheHobbit.id],
      entities: {
        [TheHobbit.id]: changeWithoutAuthor,
      },
    })
  })

  it('should do nothing when setMany is given an empty array', () => {
    const withMany = adapter.setAll(state, [TheGreatGatsby])

    const withUpserts = adapter.setMany(withMany, [])

    expect(withUpserts).toEqual({
      ids: [TheGreatGatsby.id],
      entities: {
        [TheGreatGatsby.id]: TheGreatGatsby,
      },
    })
  })

  it('should let you set many entities in the state', () => {
    const firstChange = { id: TheHobbit.id, title: 'Silmarillion' }
    const withMany = adapter.setAll(state, [TheHobbit])

    const withSetMany = adapter.setMany(withMany, [
      firstChange,
      AClockworkOrange,
    ])

    expect(withSetMany).toEqual({
      ids: [AClockworkOrange.id, TheHobbit.id],
      entities: {
        [TheHobbit.id]: firstChange,
        [AClockworkOrange.id]: AClockworkOrange,
      },
    })
  })

  it('should let you set many entities in the state when passing in a dictionary', () => {
    const changeWithoutAuthor = { id: TheHobbit.id, title: 'Silmarillion' }
    const withMany = adapter.setAll(state, [TheHobbit])

    const withSetMany = adapter.setMany(withMany, {
      [TheHobbit.id]: changeWithoutAuthor,
      [AClockworkOrange.id]: AClockworkOrange,
    })

    expect(withSetMany).toEqual({
      ids: [AClockworkOrange.id, TheHobbit.id],
      entities: {
        [TheHobbit.id]: changeWithoutAuthor,
        [AClockworkOrange.id]: AClockworkOrange,
      },
    })
  })

  it("only returns one entry for that id in the id's array", () => {
    const book1: BookModel = { id: 'a', title: 'First' }
    const book2: BookModel = { id: 'b', title: 'Second' }
    const initialState = adapter.getInitialState()
    const withItems = adapter.addMany(initialState, [book1, book2])

    expect(withItems.ids).toEqual(['a', 'b'])
    const withUpdate = adapter.updateOne(withItems, {
      id: 'a',
      changes: { id: 'b' },
    })

    expect(withUpdate.ids).toEqual(['b'])
    expect(withUpdate.entities['b']!.title).toBe(book1.title)
  })

  describe('can be used mutably when wrapped in createNextState', () => {
    test('removeAll', () => {
      const withTwo = adapter.addMany(state, [TheGreatGatsby, AnimalFarm])
      const result = createNextState(withTwo, (draft) => {
        adapter.removeAll(draft)
      })
      expect(result).toMatchInlineSnapshot(`
        Object {
          "entities": Object {},
          "ids": Array [],
        }
      `)
    })

    test('addOne', () => {
      const result = createNextState(state, (draft) => {
        adapter.addOne(draft, TheGreatGatsby)
      })

      expect(result).toMatchInlineSnapshot(`
        Object {
          "entities": Object {
            "tgg": Object {
              "id": "tgg",
              "title": "The Great Gatsby",
            },
          },
          "ids": Array [
            "tgg",
          ],
        }
      `)
    })

    test('addMany', () => {
      const result = createNextState(state, (draft) => {
        adapter.addMany(draft, [TheGreatGatsby, AnimalFarm])
      })

      expect(result).toMatchInlineSnapshot(`
        Object {
          "entities": Object {
            "af": Object {
              "id": "af",
              "title": "Animal Farm",
            },
            "tgg": Object {
              "id": "tgg",
              "title": "The Great Gatsby",
            },
          },
          "ids": Array [
            "af",
            "tgg",
          ],
        }
      `)
    })

    test('setAll', () => {
      const result = createNextState(state, (draft) => {
        adapter.setAll(draft, [TheGreatGatsby, AnimalFarm])
      })

      expect(result).toMatchInlineSnapshot(`
        Object {
          "entities": Object {
            "af": Object {
              "id": "af",
              "title": "Animal Farm",
            },
            "tgg": Object {
              "id": "tgg",
              "title": "The Great Gatsby",
            },
          },
          "ids": Array [
            "af",
            "tgg",
          ],
        }
      `)
    })

    test('updateOne', () => {
      const withOne = adapter.addOne(state, TheGreatGatsby)
      const changes = { title: 'A New Hope' }
      const result = createNextState(withOne, (draft) => {
        adapter.updateOne(draft, {
          id: TheGreatGatsby.id,
          changes,
        })
      })

      expect(result).toMatchInlineSnapshot(`
        Object {
          "entities": Object {
            "tgg": Object {
              "id": "tgg",
              "title": "A New Hope",
            },
          },
          "ids": Array [
            "tgg",
          ],
        }
      `)
    })

    test('updateMany', () => {
      const firstChange = { title: 'First Change' }
      const secondChange = { title: 'Second Change' }
      const thirdChange = { title: 'Third Change' }
      const fourthChange = { author: 'Fourth Change' }
      const withMany = adapter.setAll(state, [
        TheGreatGatsby,
        AClockworkOrange,
        TheHobbit,
      ])

      const result = createNextState(withMany, (draft) => {
        adapter.updateMany(draft, [
          { id: TheHobbit.id, changes: firstChange },
          { id: TheGreatGatsby.id, changes: secondChange },
          { id: AClockworkOrange.id, changes: thirdChange },
          { id: TheHobbit.id, changes: fourthChange },
        ])
      })

      expect(result).toMatchInlineSnapshot(`
        Object {
          "entities": Object {
            "aco": Object {
              "id": "aco",
              "title": "Third Change",
            },
            "tgg": Object {
              "id": "tgg",
              "title": "Second Change",
            },
            "th": Object {
              "author": "Fourth Change",
              "id": "th",
              "title": "First Change",
            },
          },
          "ids": Array [
            "th",
            "tgg",
            "aco",
          ],
        }
      `)
    })

    test('upsertOne (insert)', () => {
      const result = createNextState(state, (draft) => {
        adapter.upsertOne(draft, TheGreatGatsby)
      })
      expect(result).toMatchInlineSnapshot(`
        Object {
          "entities": Object {
            "tgg": Object {
              "id": "tgg",
              "title": "The Great Gatsby",
            },
          },
          "ids": Array [
            "tgg",
          ],
        }
      `)
    })

    test('upsertOne (update)', () => {
      const withOne = adapter.upsertOne(state, TheGreatGatsby)
      const result = createNextState(withOne, (draft) => {
        adapter.upsertOne(draft, {
          id: TheGreatGatsby.id,
          title: 'A New Hope',
        })
      })
      expect(result).toMatchInlineSnapshot(`
        Object {
          "entities": Object {
            "tgg": Object {
              "id": "tgg",
              "title": "A New Hope",
            },
          },
          "ids": Array [
            "tgg",
          ],
        }
      `)
    })

    test('upsertMany', () => {
      const withOne = adapter.upsertOne(state, TheGreatGatsby)
      const result = createNextState(withOne, (draft) => {
        adapter.upsertMany(draft, [
          {
            id: TheGreatGatsby.id,
            title: 'A New Hope',
          },
          AnimalFarm,
        ])
      })
      expect(result).toMatchInlineSnapshot(`
        Object {
          "entities": Object {
            "af": Object {
              "id": "af",
              "title": "Animal Farm",
            },
            "tgg": Object {
              "id": "tgg",
              "title": "A New Hope",
            },
          },
          "ids": Array [
            "tgg",
            "af",
          ],
        }
      `)
    })

    test('setOne (insert)', () => {
      const result = createNextState(state, (draft) => {
        adapter.setOne(draft, TheGreatGatsby)
      })
      expect(result).toMatchInlineSnapshot(`
        Object {
          "entities": Object {
            "tgg": Object {
              "id": "tgg",
              "title": "The Great Gatsby",
            },
          },
          "ids": Array [
            "tgg",
          ],
        }
      `)
    })

    test('setOne (update)', () => {
      const withOne = adapter.setOne(state, TheHobbit)
      const result = createNextState(withOne, (draft) => {
        adapter.setOne(draft, {
          id: TheHobbit.id,
          title: 'Silmarillion',
        })
      })
      expect(result).toMatchInlineSnapshot(`
        Object {
          "entities": Object {
            "th": Object {
              "id": "th",
              "title": "Silmarillion",
            },
          },
          "ids": Array [
            "th",
          ],
        }
      `)
    })

    test('setMany', () => {
      const withOne = adapter.setOne(state, TheHobbit)
      const result = createNextState(withOne, (draft) => {
        adapter.setMany(draft, [
          {
            id: TheHobbit.id,
            title: 'Silmarillion',
          },
          AnimalFarm,
        ])
      })
      expect(result).toMatchInlineSnapshot(`
        Object {
          "entities": Object {
            "af": Object {
              "id": "af",
              "title": "Animal Farm",
            },
            "th": Object {
              "id": "th",
              "title": "Silmarillion",
            },
          },
          "ids": Array [
            "af",
            "th",
          ],
        }
      `)
    })

    test('removeOne', () => {
      const withTwo = adapter.addMany(state, [TheGreatGatsby, AnimalFarm])
      const result = createNextState(withTwo, (draft) => {
        adapter.removeOne(draft, TheGreatGatsby.id)
      })
      expect(result).toMatchInlineSnapshot(`
        Object {
          "entities": Object {
            "af": Object {
              "id": "af",
              "title": "Animal Farm",
            },
          },
          "ids": Array [
            "af",
          ],
        }
      `)
    })

    test('removeMany', () => {
      const withThree = adapter.addMany(state, [
        TheGreatGatsby,
        AnimalFarm,
        AClockworkOrange,
      ])
      const result = createNextState(withThree, (draft) => {
        adapter.removeMany(draft, [TheGreatGatsby.id, AnimalFarm.id])
      })
      expect(result).toMatchInlineSnapshot(`
        Object {
          "entities": Object {
            "aco": Object {
              "id": "aco",
              "title": "A Clockwork Orange",
            },
          },
          "ids": Array [
            "aco",
          ],
        }
      `)
    })
  })
})
