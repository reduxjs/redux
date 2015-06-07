import { expect } from 'chai';
import { createDispatcher } from '../src';

const fakeState = { foo: 'bar' };

function fakeStore() {
  return fakeState;
}

describe('createDispatcher', () => {

  it('should expose Dispatcher public API', () => {
    const dispatcher = createDispatcher(fakeStore);

    expect(Object.keys(dispatcher)).to.have.length(6);
    expect(dispatcher).to.have.a.property('subscribe');
    expect(dispatcher).to.have.a.property('perform');
    expect(dispatcher).to.have.a.property('getAtom');
    expect(dispatcher).to.have.a.property('setAtom');
    expect(dispatcher).to.have.a.property('initialize');
    expect(dispatcher).to.have.a.property('dispose');
  });
});
