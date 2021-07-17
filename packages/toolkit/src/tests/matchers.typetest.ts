import { expectExactType, expectUnknown } from './helpers'
import { IsUnknown } from '@internal/tsHelpers'
import type { AnyAction } from 'redux'
import type { SerializedError } from '../../src'
import {
  createAction,
  createAsyncThunk,
  isAllOf,
  isAnyOf,
  isAsyncThunkAction,
  isFulfilled,
  isPending,
  isRejected,
  isRejectedWithValue,
} from '../../src'

/* isAnyOf */

/*
 * Test: isAnyOf correctly narrows types when used with action creators
 */
function isAnyOfActionTest(action: AnyAction) {
  const actionA = createAction('a', () => {
    return {
      payload: {
        prop1: 1,
        prop3: 2,
      },
    }
  })

  const actionB = createAction('b', () => {
    return {
      payload: {
        prop1: 1,
        prop2: 2,
      },
    }
  })

  if (isAnyOf(actionA, actionB)(action)) {
    return {
      prop1: action.payload.prop1,
      // @ts-expect-error
      prop2: action.payload.prop2,
      // @ts-expect-error
      prop3: action.payload.prop3,
    }
  }
}

/*
 * Test: isAnyOf correctly narrows types when used with async thunks
 */
function isAnyOfThunkTest(action: AnyAction) {
  const asyncThunk1 = createAsyncThunk<{ prop1: number; prop3: number }>(
    'asyncThunk1',

    async () => {
      return {
        prop1: 1,
        prop3: 3,
      }
    }
  )

  const asyncThunk2 = createAsyncThunk<{ prop1: number; prop2: number }>(
    'asyncThunk2',

    async () => {
      return {
        prop1: 1,
        prop2: 2,
      }
    }
  )

  if (isAnyOf(asyncThunk1.fulfilled, asyncThunk2.fulfilled)(action)) {
    return {
      prop1: action.payload.prop1,
      // @ts-expect-error
      prop2: action.payload.prop2,
      // @ts-expect-error
      prop3: action.payload.prop3,
    }
  }
}

/*
 * Test: isAnyOf correctly narrows types when used with type guards
 */
function isAnyOfTypeGuardTest(action: AnyAction) {
  interface ActionA {
    type: 'a'
    payload: {
      prop1: 1
      prop3: 2
    }
  }

  interface ActionB {
    type: 'b'
    payload: {
      prop1: 1
      prop2: 2
    }
  }

  const guardA = (v: any): v is ActionA => {
    return v.type === 'a'
  }

  const guardB = (v: any): v is ActionB => {
    return v.type === 'b'
  }

  if (isAnyOf(guardA, guardB)(action)) {
    return {
      prop1: action.payload.prop1,
      // @ts-expect-error
      prop2: action.payload.prop2,
      // @ts-expect-error
      prop3: action.payload.prop3,
    }
  }
}

/* isAllOf */

interface SpecialAction {
  payload: {
    special: boolean
  }
}

const isSpecialAction = (v: any): v is SpecialAction => {
  return v.meta.isSpecial
}

/*
 * Test: isAllOf correctly narrows types when used with action creators
 *       and type guards
 */
function isAllOfActionTest(action: AnyAction) {
  const actionA = createAction('a', () => {
    return {
      payload: {
        prop1: 1,
        prop3: 2,
      },
    }
  })

  if (isAllOf(actionA, isSpecialAction)(action)) {
    return {
      prop1: action.payload.prop1,
      // @ts-expect-error
      prop2: action.payload.prop2,
      prop3: action.payload.prop3,
      special: action.payload.special,
    }
  }
}

/*
 * Test: isAllOf correctly narrows types when used with async thunks
 *       and type guards
 */
function isAllOfThunkTest(action: AnyAction) {
  const asyncThunk1 = createAsyncThunk<{ prop1: number; prop3: number }>(
    'asyncThunk1',

    async () => {
      return {
        prop1: 1,
        prop3: 3,
      }
    }
  )

  if (isAllOf(asyncThunk1.fulfilled, isSpecialAction)(action)) {
    return {
      prop1: action.payload.prop1,
      // @ts-expect-error
      prop2: action.payload.prop2,
      prop3: action.payload.prop3,
      special: action.payload.special,
    }
  }
}

/*
 * Test: isAnyOf correctly narrows types when used with type guards
 */
function isAllOfTypeGuardTest(action: AnyAction) {
  interface ActionA {
    type: 'a'
    payload: {
      prop1: 1
      prop3: 2
    }
  }

  const guardA = (v: any): v is ActionA => {
    return v.type === 'a'
  }

  if (isAllOf(guardA, isSpecialAction)(action)) {
    return {
      prop1: action.payload.prop1,
      // @ts-expect-error
      prop2: action.payload.prop2,
      prop3: action.payload.prop3,
      special: action.payload.special,
    }
  }
}

/*
 * Test: isPending correctly narrows types
 */
function isPendingTest(action: AnyAction) {
  if (isPending(action)) {
    expectExactType<undefined>(action.payload)
    // @ts-expect-error
    action.error
  }

  const thunk = createAsyncThunk<string>('a', () => 'result')

  if (isPending(thunk)(action)) {
    expectExactType<undefined>(action.payload)
    // @ts-expect-error
    action.error
  }
}

/*
 * Test: isRejected correctly narrows types
 */
function isRejectedTest(action: AnyAction) {
  if (isRejected(action)) {
    // might be there if rejected with payload
    expectUnknown(action.payload)
    expectExactType<SerializedError>(action.error)
  }

  const thunk = createAsyncThunk<string>('a', () => 'result')

  if (isRejected(thunk)(action)) {
    // might be there if rejected with payload
    expectUnknown(action.payload)
    expectExactType<SerializedError>(action.error)
  }
}

/*
 * Test: isFulfilled correctly narrows types
 */
function isFulfilledTest(action: AnyAction) {
  if (isFulfilled(action)) {
    expectUnknown(action.payload)
    // @ts-expect-error
    action.error
  }

  const thunk = createAsyncThunk<string>('a', () => 'result')
  if (isFulfilled(thunk)(action)) {
    expectExactType('' as string)(action.payload)
    // @ts-expect-error
    action.error
  }
}

/*
 * Test: isAsyncThunkAction correctly narrows types
 */
function isAsyncThunkActionTest(action: AnyAction) {
  if (isAsyncThunkAction(action)) {
    expectUnknown(action.payload)
    // do not expect an error property because pending/fulfilled lack it
    // @ts-expect-error
    action.error
  }

  const thunk = createAsyncThunk<string>('a', () => 'result')
  if (isAsyncThunkAction(thunk)(action)) {
    // we should expect the payload to be available, but of unknown type because the action may be pending/rejected
    expectUnknown(action.payload)
    // do not expect an error property because pending/fulfilled lack it
    // @ts-expect-error
    action.error
  }
}

/*
 * Test: isRejectedWithValue correctly narrows types
 */
function isRejectedWithValueTest(action: AnyAction) {
  if (isRejectedWithValue(action)) {
    expectUnknown(action.payload)
    expectExactType<SerializedError>(action.error)
  }

  const thunk = createAsyncThunk<
    string,
    void,
    { rejectValue: { message: string } }
  >('a', () => 'result')
  if (isRejectedWithValue(thunk)(action)) {
    expectExactType({ message: '' as string })(action.payload)
    expectExactType<SerializedError>(action.error)
  }
}
