import { composeReducers } from '../src'

describe('Utils', () => {
  describe('composeReducers', () => {
    const calculator = (state, action) => {
      switch (action.type) {
        case 'ADD':
        return state + action.payload;

        case 'MULTIPLY':
        return state * action.payload;

        default:
        return state;
      }
    }

    const percentage = (state, action) => {
      switch (action.type) {
        case 'ADD_PERCENTAGE':
        return state + ((state / 100) * action.payload);

        case 'SUBTRACT_PERCENTAGE':
        return state - ((state / 100) * action.payload);

        default:
        return state;
      }
    }

    it('composes reducers from right to left', () => {
      const composedReducer = composeReducers(5, calculator, percentage);
      expect(composedReducer(undefined, {
        type: 'ADD',
        payload: 5
      })).toBe(10);
      expect(composedReducer(undefined, {
        type: 'MULTIPLY',
        payload: 5
      })).toBe(25);
      expect(composedReducer(100, {
        type: 'ADD_PERCENTAGE',
        payload: 10
      })).toBe(110);
      expect(composedReducer(100, {
        type: 'SUBTRACT_PERCENTAGE',
        payload: 10
      })).toBe(90);
    })

    it('returns the first given argument if given no functions', () => {
      expect(composeReducers()(1, 2)).toBe(1)
      expect(composeReducers()(3)).toBe(3)
      expect(composeReducers()()).toBe(undefined)
    })

    it('returns the first function if given only one', () => {
      const fn = () => {}

      expect(composeReducers({}, fn)).toBe(fn)
    })
  })
})
