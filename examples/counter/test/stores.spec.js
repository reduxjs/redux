import expect from 'expect';
import counter from '../stores/counter';
import { INCREMENT_COUNTER, DECREMENT_COUNTER } from '../constants/ActionTypes';

describe('stores', () => {

  describe('counter', () => {

    it('increments the counter', () => {
      const action = {
        type: INCREMENT_COUNTER
      };

      const state = counter(0, action);

      expect(state).toEqual(1);
    });

    it('decrements the counter', () => {
      const action = {
        type: DECREMENT_COUNTER
      };

      const state = counter(0, action);

      expect(state).toEqual(-1);
    });

    it('returns the state by default', () => {
      const action = {
        type: null
      };

      const state = counter(2, action);

      expect(state).toEqual(2);
    });

  });
});
