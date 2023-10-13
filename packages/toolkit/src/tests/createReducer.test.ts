import type {
  CaseReducer,
  PayloadAction,
  Draft,
  Reducer,
  AnyAction,
} from '@reduxjs/toolkit'
import { createReducer, createAction, createNextState } from '@reduxjs/toolkit'
import {
  mockConsole,
  createConsole,
  getLog,
} from 'console-testing-library/pure'

interface Todo {
  text: string
  completed?: boolean
}

interface AddTodoPayload {
  newTodo: Todo
}

interface ToggleTodoPayload {
  index: number
}

type TodoState = Todo[]
type TodosReducer = Reducer<TodoState, PayloadAction<any>>
type AddTodoReducer = CaseReducer<TodoState, PayloadAction<AddTodoPayload>>

type ToggleTodoReducer = CaseReducer<
  TodoState,
  PayloadAction<ToggleTodoPayload>
>

type CreateReducer = typeof createReducer

describe('createReducer', () => {
  let restore: () => void

  beforeEach(() => {
    restore = mockConsole(createConsole())
  })
  describe('given impure reducers with immer', () => {
    const addTodo: AddTodoReducer = (state, action) => {
      const { newTodo } = action.payload

      // Can safely call state.push() here
      state.push({ ...newTodo, completed: false })
    }

    const toggleTodo: ToggleTodoReducer = (state, action) => {
      const { index } = action.payload

      const todo = state[index]
      // Can directly modify the todo object
      todo.completed = !todo.completed
    }

    const todosReducer = createReducer([] as TodoState, {
      ADD_TODO: addTodo,
      TOGGLE_TODO: toggleTodo,
    })

    behavesLikeReducer(todosReducer)
  })

  describe('Deprecation warnings', () => {
    let originalNodeEnv = process.env.NODE_ENV

    beforeEach(() => {
      jest.resetModules()
    })

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv
    })

    it('Warns about object notation deprecation, once', () => {
      const { createReducer } = require('../createReducer')
      let dummyReducer = (createReducer as CreateReducer)([] as TodoState, {})

      expect(getLog().levels.warn).toMatch(
        /The object notation for `createReducer` is deprecated/
      )
      restore = mockConsole(createConsole())

      dummyReducer = (createReducer as CreateReducer)([] as TodoState, {})
      expect(getLog().levels.warn).toBe('')
    })

    it('Does not warn in production', () => {
      process.env.NODE_ENV = 'production'
      const { createReducer } = require('../createReducer')
      let dummyReducer = (createReducer as CreateReducer)([] as TodoState, {})

      expect(getLog().levels.warn).toBe('')
    })
  })

  describe('Immer in a production environment', () => {
    let originalNodeEnv = process.env.NODE_ENV

    beforeEach(() => {
      jest.resetModules()
      process.env.NODE_ENV = 'production'
    })

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv
    })

    test('Freezes data in production', () => {
      const { createReducer } = require('../createReducer')
      const addTodo: AddTodoReducer = (state, action) => {
        const { newTodo } = action.payload
        state.push({ ...newTodo, completed: false })
      }

      const toggleTodo: ToggleTodoReducer = (state, action) => {
        const { index } = action.payload
        const todo = state[index]
        todo.completed = !todo.completed
      }

      const todosReducer = createReducer([] as TodoState, {
        ADD_TODO: addTodo,
        TOGGLE_TODO: toggleTodo,
      })

      const result = todosReducer([], {
        type: 'ADD_TODO',
        payload: { text: 'Buy milk' },
      })

      const mutateStateOutsideReducer = () => (result[0].text = 'edited')
      expect(mutateStateOutsideReducer).toThrowError(
        'Cannot add property text, object is not extensible'
      )
    })

    test('Freezes initial state', () => {
      const initialState = [{ text: 'Buy milk' }]
      const todosReducer = createReducer(initialState, {})
      const frozenInitialState = todosReducer(undefined, { type: 'dummy' })

      const mutateStateOutsideReducer = () =>
        (frozenInitialState[0].text = 'edited')
      expect(mutateStateOutsideReducer).toThrowError(
        /Cannot assign to read only property/
      )
    })
    test('does not throw error if initial state is not draftable', () => {
      expect(() => createReducer(new URLSearchParams(), {})).not.toThrowError()
    })
  })

  describe('given pure reducers with immutable updates', () => {
    const addTodo: AddTodoReducer = (state, action) => {
      const { newTodo } = action.payload

      // Updates the state immutably without relying on immer
      return state.concat({ ...newTodo, completed: false })
    }

    const toggleTodo: ToggleTodoReducer = (state, action) => {
      const { index } = action.payload

      // Updates the todo object immutably withot relying on immer
      return state.map((todo, i) => {
        if (i !== index) return todo
        return { ...todo, completed: !todo.completed }
      })
    }

    const todosReducer = createReducer([] as TodoState, {
      ADD_TODO: addTodo,
      TOGGLE_TODO: toggleTodo,
    })

    behavesLikeReducer(todosReducer)
  })

  describe('Accepts a lazy state init function to generate initial state', () => {
    const addTodo: AddTodoReducer = (state, action) => {
      const { newTodo } = action.payload
      state.push({ ...newTodo, completed: false })
    }

    const toggleTodo: ToggleTodoReducer = (state, action) => {
      const { index } = action.payload
      const todo = state[index]
      todo.completed = !todo.completed
    }

    const lazyStateInit = () => [] as TodoState

    const todosReducer = createReducer(lazyStateInit, {
      ADD_TODO: addTodo,
      TOGGLE_TODO: toggleTodo,
    })

    behavesLikeReducer(todosReducer)

    it('Should only call the init function when `undefined` state is passed in', () => {
      const spy = jest.fn().mockReturnValue(42)

      const dummyReducer = createReducer(spy, {})
      expect(spy).not.toHaveBeenCalled()

      dummyReducer(123, { type: 'dummy' })
      expect(spy).not.toHaveBeenCalled()

      const initialState = dummyReducer(undefined, { type: 'dummy' })
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('given draft state from immer', () => {
    const addTodo: AddTodoReducer = (state, action) => {
      const { newTodo } = action.payload

      // Can safely call state.push() here
      state.push({ ...newTodo, completed: false })
    }

    const toggleTodo: ToggleTodoReducer = (state, action) => {
      const { index } = action.payload

      const todo = state[index]
      // Can directly modify the todo object
      todo.completed = !todo.completed
    }

    const todosReducer = createReducer([] as TodoState, {
      ADD_TODO: addTodo,
      TOGGLE_TODO: toggleTodo,
    })

    const wrappedReducer: TodosReducer = (state = [], action) => {
      return createNextState(state, (draft: Draft<TodoState>) => {
        todosReducer(draft, action)
      })
    }

    behavesLikeReducer(wrappedReducer)
  })

  describe('actionMatchers argument', () => {
    const prepareNumberAction = (payload: number) => ({
      payload,
      meta: { type: 'number_action' },
    })
    const prepareStringAction = (payload: string) => ({
      payload,
      meta: { type: 'string_action' },
    })

    const numberActionMatcher = (a: AnyAction): a is PayloadAction<number> =>
      a.meta && a.meta.type === 'number_action'
    const stringActionMatcher = (a: AnyAction): a is PayloadAction<string> =>
      a.meta && a.meta.type === 'string_action'

    const incrementBy = createAction('increment', prepareNumberAction)
    const decrementBy = createAction('decrement', prepareNumberAction)
    const concatWith = createAction('concat', prepareStringAction)

    const initialState = { numberActions: 0, stringActions: 0 }
    const numberActionsCounter = {
      matcher: numberActionMatcher,
      reducer(state: typeof initialState) {
        state.numberActions = state.numberActions * 10 + 1
      },
    }
    const stringActionsCounter = {
      matcher: stringActionMatcher,
      reducer(state: typeof initialState) {
        state.stringActions = state.stringActions * 10 + 1
      },
    }

    test('uses the reducer of matching actionMatchers', () => {
      const reducer = createReducer(initialState, {}, [
        numberActionsCounter,
        stringActionsCounter,
      ])
      expect(reducer(undefined, incrementBy(1))).toEqual({
        numberActions: 1,
        stringActions: 0,
      })
      expect(reducer(undefined, decrementBy(1))).toEqual({
        numberActions: 1,
        stringActions: 0,
      })
      expect(reducer(undefined, concatWith('foo'))).toEqual({
        numberActions: 0,
        stringActions: 1,
      })
    })
    test('fallback to default case', () => {
      const reducer = createReducer(
        initialState,
        {},
        [numberActionsCounter, stringActionsCounter],
        (state) => {
          state.numberActions = -1
          state.stringActions = -1
        }
      )
      expect(reducer(undefined, { type: 'somethingElse' })).toEqual({
        numberActions: -1,
        stringActions: -1,
      })
    })
    test('runs reducer cases followed by all matching actionMatchers', () => {
      const reducer = createReducer(
        initialState,
        {
          [incrementBy.type](state) {
            state.numberActions = state.numberActions * 10 + 2
          },
        },
        [
          {
            matcher: numberActionMatcher,
            reducer(state) {
              state.numberActions = state.numberActions * 10 + 3
            },
          },
          numberActionsCounter,
          stringActionsCounter,
        ]
      )
      expect(reducer(undefined, incrementBy(1))).toEqual({
        numberActions: 231,
        stringActions: 0,
      })
      expect(reducer(undefined, decrementBy(1))).toEqual({
        numberActions: 31,
        stringActions: 0,
      })
      expect(reducer(undefined, concatWith('foo'))).toEqual({
        numberActions: 0,
        stringActions: 1,
      })
    })
    test('works with `actionCreator.match`', () => {
      const reducer = createReducer(initialState, {}, [
        {
          matcher: incrementBy.match,
          reducer(state) {
            state.numberActions += 100
          },
        },
      ])
      expect(reducer(undefined, incrementBy(1))).toEqual({
        numberActions: 100,
        stringActions: 0,
      })
    })
  })

  describe('alternative builder callback for actionMap', () => {
    const increment = createAction<number, 'increment'>('increment')
    const decrement = createAction<number, 'decrement'>('decrement')

    test('can be used with ActionCreators', () => {
      const reducer = createReducer(0, (builder) =>
        builder
          .addCase(increment, (state, action) => state + action.payload)
          .addCase(decrement, (state, action) => state - action.payload)
      )
      expect(reducer(0, increment(5))).toBe(5)
      expect(reducer(5, decrement(5))).toBe(0)
    })
    test('can be used with string types', () => {
      const reducer = createReducer(0, (builder) =>
        builder
          .addCase(
            'increment',
            (state, action: { type: 'increment'; payload: number }) =>
              state + action.payload
          )
          .addCase(
            'decrement',
            (state, action: { type: 'decrement'; payload: number }) =>
              state - action.payload
          )
      )
      expect(reducer(0, increment(5))).toBe(5)
      expect(reducer(5, decrement(5))).toBe(0)
    })
    test('can be used with ActionCreators and string types combined', () => {
      const reducer = createReducer(0, (builder) =>
        builder
          .addCase(increment, (state, action) => state + action.payload)
          .addCase(
            'decrement',
            (state, action: { type: 'decrement'; payload: number }) =>
              state - action.payload
          )
      )
      expect(reducer(0, increment(5))).toBe(5)
      expect(reducer(5, decrement(5))).toBe(0)
    })
    test('will throw an error when returning undefined from a non-draftable state', () => {
      const reducer = createReducer(0, (builder) =>
        builder.addCase(
          'decrement',
          (state, action: { type: 'decrement'; payload: number }) => {}
        )
      )
      expect(() => reducer(5, decrement(5))).toThrowErrorMatchingInlineSnapshot(
        `"A case reducer on a non-draftable value must not return undefined"`
      )
    })
    test('allows you to return undefined if the state was null, thus skipping an update', () => {
      const reducer = createReducer(null as number | null, (builder) =>
        builder.addCase(
          'decrement',
          (state, action: { type: 'decrement'; payload: number }) => {
            if (typeof state === 'number') {
              return state - action.payload
            }
            return undefined
          }
        )
      )
      expect(reducer(0, decrement(5))).toBe(-5)
      expect(reducer(null, decrement(5))).toBe(null)
    })
    test('allows you to return null', () => {
      const reducer = createReducer(0 as number | null, (builder) =>
        builder.addCase(
          'decrement',
          (state, action: { type: 'decrement'; payload: number }) => {
            return null
          }
        )
      )
      expect(reducer(5, decrement(5))).toBe(null)
    })
    test('allows you to return 0', () => {
      const reducer = createReducer(0, (builder) =>
        builder.addCase(
          'decrement',
          (state, action: { type: 'decrement'; payload: number }) =>
            state - action.payload
        )
      )
      expect(reducer(5, decrement(5))).toBe(0)
    })
    test('will throw if the same type is used twice', () => {
      expect(() =>
        createReducer(0, (builder) =>
          builder
            .addCase(increment, (state, action) => state + action.payload)
            .addCase(increment, (state, action) => state + action.payload)
            .addCase(decrement, (state, action) => state - action.payload)
        )
      ).toThrowErrorMatchingInlineSnapshot(
        '"`builder.addCase` cannot be called with two reducers for the same action type"'
      )
      expect(() =>
        createReducer(0, (builder) =>
          builder
            .addCase(increment, (state, action) => state + action.payload)
            .addCase('increment', (state) => state + 1)
            .addCase(decrement, (state, action) => state - action.payload)
        )
      ).toThrowErrorMatchingInlineSnapshot(
        '"`builder.addCase` cannot be called with two reducers for the same action type"'
      )
    })

    test('will throw if an empty type is used', () => {
      const customActionCreator = (payload: number) => ({
        type: 'custom_action',
        payload,
      })
      customActionCreator.type = ""
      expect(() =>
        createReducer(0, (builder) =>
          builder.addCase(
            customActionCreator,
            (state, action) => state + action.payload
          )
        )
      ).toThrowErrorMatchingInlineSnapshot(
        '"`builder.addCase` cannot be called with an empty action type"'
      )
    })
  })

  describe('builder "addMatcher" method', () => {
    const prepareNumberAction = (payload: number) => ({
      payload,
      meta: { type: 'number_action' },
    })
    const prepareStringAction = (payload: string) => ({
      payload,
      meta: { type: 'string_action' },
    })

    const numberActionMatcher = (a: AnyAction): a is PayloadAction<number> =>
      a.meta && a.meta.type === 'number_action'
    const stringActionMatcher = (a: AnyAction): a is PayloadAction<string> =>
      a.meta && a.meta.type === 'string_action'

    const incrementBy = createAction('increment', prepareNumberAction)
    const decrementBy = createAction('decrement', prepareNumberAction)
    const concatWith = createAction('concat', prepareStringAction)

    const initialState = { numberActions: 0, stringActions: 0 }

    test('uses the reducer of matching actionMatchers', () => {
      const reducer = createReducer(initialState, (builder) =>
        builder
          .addMatcher(numberActionMatcher, (state) => {
            state.numberActions += 1
          })
          .addMatcher(stringActionMatcher, (state) => {
            state.stringActions += 1
          })
      )
      expect(reducer(undefined, incrementBy(1))).toEqual({
        numberActions: 1,
        stringActions: 0,
      })
      expect(reducer(undefined, decrementBy(1))).toEqual({
        numberActions: 1,
        stringActions: 0,
      })
      expect(reducer(undefined, concatWith('foo'))).toEqual({
        numberActions: 0,
        stringActions: 1,
      })
    })
    test('falls back to defaultCase', () => {
      const reducer = createReducer(initialState, (builder) =>
        builder
          .addCase(concatWith, (state) => {
            state.stringActions += 1
          })
          .addMatcher(numberActionMatcher, (state) => {
            state.numberActions += 1
          })
          .addDefaultCase((state) => {
            state.numberActions = -1
            state.stringActions = -1
          })
      )
      expect(reducer(undefined, { type: 'somethingElse' })).toEqual({
        numberActions: -1,
        stringActions: -1,
      })
    })
    test('runs reducer cases followed by all matching actionMatchers', () => {
      const reducer = createReducer(initialState, (builder) =>
        builder
          .addCase(incrementBy, (state) => {
            state.numberActions = state.numberActions * 10 + 1
          })
          .addMatcher(numberActionMatcher, (state) => {
            state.numberActions = state.numberActions * 10 + 2
          })
          .addMatcher(stringActionMatcher, (state) => {
            state.stringActions = state.stringActions * 10 + 1
          })
          .addMatcher(numberActionMatcher, (state) => {
            state.numberActions = state.numberActions * 10 + 3
          })
      )
      expect(reducer(undefined, incrementBy(1))).toEqual({
        numberActions: 123,
        stringActions: 0,
      })
      expect(reducer(undefined, decrementBy(1))).toEqual({
        numberActions: 23,
        stringActions: 0,
      })
      expect(reducer(undefined, concatWith('foo'))).toEqual({
        numberActions: 0,
        stringActions: 1,
      })
    })
    test('works with `actionCreator.match`', () => {
      const reducer = createReducer(initialState, (builder) =>
        builder.addMatcher(incrementBy.match, (state) => {
          state.numberActions += 100
        })
      )
      expect(reducer(undefined, incrementBy(1))).toEqual({
        numberActions: 100,
        stringActions: 0,
      })
    })
    test('calling addCase, addMatcher and addDefaultCase in a nonsensical order should result in an error in development mode', () => {
      expect(() =>
        createReducer(initialState, (builder: any) =>
          builder
            .addMatcher(numberActionMatcher, () => {})
            .addCase(incrementBy, () => {})
        )
      ).toThrowErrorMatchingInlineSnapshot(
        `"\`builder.addCase\` should only be called before calling \`builder.addMatcher\`"`
      )
      expect(() =>
        createReducer(initialState, (builder: any) =>
          builder.addDefaultCase(() => {}).addCase(incrementBy, () => {})
        )
      ).toThrowErrorMatchingInlineSnapshot(
        `"\`builder.addCase\` should only be called before calling \`builder.addDefaultCase\`"`
      )
      expect(() =>
        createReducer(initialState, (builder: any) =>
          builder
            .addDefaultCase(() => {})
            .addMatcher(numberActionMatcher, () => {})
        )
      ).toThrowErrorMatchingInlineSnapshot(
        `"\`builder.addMatcher\` should only be called before calling \`builder.addDefaultCase\`"`
      )
      expect(() =>
        createReducer(initialState, (builder: any) =>
          builder.addDefaultCase(() => {}).addDefaultCase(() => {})
        )
      ).toThrowErrorMatchingInlineSnapshot(
        `"\`builder.addDefaultCase\` can only be called once"`
      )
    })
  })
})

function behavesLikeReducer(todosReducer: TodosReducer) {
  it('should handle initial state', () => {
    const initialAction = { type: '', payload: undefined }
    expect(todosReducer(undefined, initialAction)).toEqual([])
  })

  it('should handle ADD_TODO', () => {
    expect(
      todosReducer([], {
        type: 'ADD_TODO',
        payload: { newTodo: { text: 'Run the tests' } },
      })
    ).toEqual([
      {
        text: 'Run the tests',
        completed: false,
      },
    ])

    expect(
      todosReducer(
        [
          {
            text: 'Run the tests',
            completed: false,
          },
        ],
        {
          type: 'ADD_TODO',
          payload: { newTodo: { text: 'Use Redux' } },
        }
      )
    ).toEqual([
      {
        text: 'Run the tests',
        completed: false,
      },
      {
        text: 'Use Redux',
        completed: false,
      },
    ])

    expect(
      todosReducer(
        [
          {
            text: 'Run the tests',
            completed: false,
          },
          {
            text: 'Use Redux',
            completed: false,
          },
        ],
        {
          type: 'ADD_TODO',
          payload: { newTodo: { text: 'Fix the tests' } },
        }
      )
    ).toEqual([
      {
        text: 'Run the tests',
        completed: false,
      },
      {
        text: 'Use Redux',
        completed: false,
      },
      {
        text: 'Fix the tests',
        completed: false,
      },
    ])
  })

  it('should handle TOGGLE_TODO', () => {
    expect(
      todosReducer(
        [
          {
            text: 'Run the tests',
            completed: false,
          },
          {
            text: 'Use Redux',
            completed: false,
          },
        ],
        {
          type: 'TOGGLE_TODO',
          payload: { index: 0 },
        }
      )
    ).toEqual([
      {
        text: 'Run the tests',
        completed: true,
      },
      {
        text: 'Use Redux',
        completed: false,
      },
    ])
  })
}
