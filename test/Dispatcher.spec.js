import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import Dispatcher from '../src/Dispatcher';
import { composeStores } from '../src';

chai.use(sinonChai);

const fakeState = { foo: 'bar' };

function fakeStore() {
  return fakeState;
}

describe('Dispatcher', () => {

  let dispatcher;

  beforeEach(() => {
    dispatcher = new Dispatcher(composeStores({ fakeStore }));
  });

  it('should correctly initialize', () => {
    expect(dispatcher).to.have.a.property('atom')
      .that.has.a.property('fakeStore')
      .that.deep.equal(fakeState);
  });

  it('should subscribe to changes', done => {
    dispatcher.subscribe(atom => {
      expect(atom).to.have.a.property('fakeStore')
        .that.deep.equal(fakeState);
      done();
    });
  });

  it('should unsubscribe a listener', () => {
    const changeListenerStub = sinon.stub();
    const unsubscribe = dispatcher.subscribe(changeListenerStub);
    expect(changeListenerStub).to.have.callCount(1);
    expect(changeListenerStub)
      .to.have.been.calledWith({ fakeStore: fakeState });
    unsubscribe();
    expect(changeListenerStub).to.have.callCount(1);
  });
});
