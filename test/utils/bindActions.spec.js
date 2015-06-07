import { expect } from 'chai';
import { bindActions, createDispatcher, composeStores } from '../../src';

const fakeState = { foo: 'bar' };

function fakeStore(state = 0, action) {
  if (action.type) {
    return fakeState;
  }
  return state;
}

const fakeActionCreators = {
  foo() {
    return { type: 'FOO' };
  },
  fooAsync() {
    return perform => {
      setTimeout(() => {
        perform({ type: 'FOO_ASYNC' });
      }, 1000);
    };
  }
};

describe('Utils', () => {
  describe('bindActions', () => {

    let dispatcher;

    beforeEach(() => {
      dispatcher = createDispatcher(composeStores({ fakeStore }));
    });

    it('should bind given actions to the dispatcher', done => {
      let expectedCallCount = 3;
      // Let us subscribe to monitor the dispatched actions
      dispatcher.subscribe(atom => {
        expectedCallCount--;
        if (expectedCallCount === 2) {
          // This is called right after we subscribe
          // so that we get the initial state
          expect(atom).to.have.a.property('fakeStore', 0);
          return;
        }

        expect(atom).to.have.a.property('fakeStore')
          .that.deep.equal(fakeState);
        if (expectedCallCount === 0) { done(); }
      });
      const actions = bindActions(fakeActionCreators, dispatcher);
      expect(Object.keys(actions))
        .to.deep.equal(Object.keys(fakeActionCreators));

      actions.foo();
      actions.fooAsync();
    });
  });
});
