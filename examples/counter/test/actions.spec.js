import expect from 'expect';
import { increment, decrement } from '../actions/CounterActions';
import { INCREMENT_COUNTER, DECREMENT_COUNTER } from '../constants/ActionTypes';


describe('actions', () => {
  it('returns increment counter action type', () => {
    const { type } = increment();

    expect(type).toEqual(INCREMENT_COUNTER);
  });

  it('returns decrement counter action type', () => {
    const { type } = decrement();

    expect(type).toEqual(DECREMENT_COUNTER);
  });
});
