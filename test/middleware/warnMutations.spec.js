import expect from 'expect';
import warnMutationsMiddleware from '../../src/middleware/warnMutations';

describe('middleware', () => {
  describe('warnMutationsMiddleware', () => {
    let warnSpy, state;
    const getState = () => state;

    beforeEach(() => {
      const original = console.warn;
      warnSpy = expect.spyOn(console, 'warn');
      warnSpy.original = original;
    });

    afterEach(() => {
      console.warn = warnSpy.original;
    });


    it('should send the action through the middleware chain', () => {
      state = {foo: {bar: [2, 3, 4], baz: 'baz'}};
      const next = action => action;
      const dispatch = warnMutationsMiddleware(getState)(next);

      expect(dispatch({type: 'SOME_ACTION'})).toEqual({type: 'SOME_ACTION'});
    });

    it('should warn if there is a state mutation inside the dispatch', () => {
      state = {foo: {bar: [2, 3, 4], baz: 'baz'}};

      const next = action => {
        state.foo.baz = 'changed!';
        return action;
      };

      const dispatch = warnMutationsMiddleware(getState)(next);

      dispatch({type: 'SOME_ACTION'});
      expect(warnSpy).toHaveBeenCalled();
    });

    it('should not warn if dispatch returns a new state object', () => {
      state = {foo: {bar: [2, 3, 4], baz: 'baz'}};

      const next = action => {
        state = {...state, foo: {...state.foo, baz: 'changed!'}};
        return action;
      };

      const dispatch = warnMutationsMiddleware(getState)(next);

      dispatch({type: 'SOME_ACTION'});
      expect(warnSpy.calls.length).toBe(0);
    });

    it('should warn if a state mutation happened between dispatches', () => {
      state = {foo: {bar: [2, 3, 4], baz: 'baz'}};
      const next = action => action;

      const dispatch = warnMutationsMiddleware(getState)(next);

      dispatch({type: 'SOME_ACTION'});
      state.foo.baz = 'changed!';
      dispatch({type: 'SOME_OTHER_ACTION'});
      expect(warnSpy).toHaveBeenCalled();
    });

    it('should not warn if there weren\'t any state mutations between dispatches', () => {
      state = {foo: {bar: [2, 3, 4], baz: 'baz'}};
      const next = action => action;

      const dispatch = warnMutationsMiddleware(getState)(next);

      dispatch({type: 'SOME_ACTION'});
      dispatch({type: 'SOME_OTHER_ACTION'});
      expect(warnSpy.calls.length).toBe(0);
    });
  });
});
