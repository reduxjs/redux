import expect from 'expect';
import warnMutationsMiddleware from '../../src/middleware/warnMutations';

describe('middleware', () => {
  describe('warnMutationsMiddleware', () => {
    let state;
    const getState = () => state;

    it('should send the action through the middleware chain', () => {
      state = {foo: {bar: [2, 3, 4], baz: 'baz'}};
      const next = action => action;
      const dispatch = warnMutationsMiddleware(getState)(next);

      expect(dispatch({type: 'SOME_ACTION'})).toEqual({type: 'SOME_ACTION'});
    });

    it('should throw if there is a state mutation inside the dispatch', () => {
      state = {foo: {bar: [2, 3, 4], baz: 'baz'}};

      const next = action => {
        state.foo.baz = 'changed!';
        return action;
      };

      const dispatch = warnMutationsMiddleware(getState)(next);

      expect(() => {
        dispatch({type: 'SOME_ACTION'});
      }).toThrow();
    });

    it('should not throw if dispatch returns a new state object', () => {
      state = {foo: {bar: [2, 3, 4], baz: 'baz'}};

      const next = action => {
        state = {...state, foo: {...state.foo, baz: 'changed!'}};
        return action;
      };

      const dispatch = warnMutationsMiddleware(getState)(next);

      expect(() => {
        dispatch({type: 'SOME_ACTION'});
      }).toNotThrow();
    });

    it('should throw if a state mutation happened between dispatches', () => {
      state = {foo: {bar: [2, 3, 4], baz: 'baz'}};
      const next = action => action;

      const dispatch = warnMutationsMiddleware(getState)(next);

      dispatch({type: 'SOME_ACTION'});
      state.foo.baz = 'changed!';

      expect(() => {
        dispatch({type: 'SOME_OTHER_ACTION'});
      }).toThrow();
    });

    it('should not throw if there weren\'t any state mutations between dispatches', () => {
      state = {foo: {bar: [2, 3, 4], baz: 'baz'}};
      const next = action => action;

      const dispatch = warnMutationsMiddleware(getState)(next);

      dispatch({type: 'SOME_ACTION'});
      expect(() => {
        dispatch({type: 'SOME_OTHER_ACTION'});
      }).toNotThrow();
    });
  });
});
