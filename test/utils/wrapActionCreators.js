import expect from 'expect';
import wrapActionCreators from '../../src/utils/wrapActionCreators';

describe('Utils', () => {
  describe('wrapActionCreators', () => {
    it('should return a function that wraps argument in a call to bindActionCreators', () => {

      function dispatch(action) {
        return {
          dispatched: action
        };
      }

      const actionResult = {an: 'action'};

      const actionCreators = {
        action: () => actionResult
      };

      const wrapped = wrapActionCreators(actionCreators);
      expect(wrapped).toBeA(Function);
      expect(() => wrapped(dispatch)).toNotThrow();
      expect(() => wrapped().action()).toThrow();

      const bound = wrapped(dispatch);
      expect(bound.action).toNotThrow();
      expect(bound.action().dispatched).toBe(actionResult);

    });
  });
});
