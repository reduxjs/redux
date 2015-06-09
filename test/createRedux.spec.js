import expect from 'expect';
import { createRedux } from '../src';

const fakeState = { foo: 'bar' };

function fakeStore() {
  return fakeState;
}

describe('createRedux', () => {

  it('should expose Redux public API', () => {
    const redux = createRedux({ fakeStore });
    const methods = Object.keys(redux);

    expect(methods.length).toBe(5);
    expect(methods).toContain('subscribe');
    expect(methods).toContain('dispatch');
    expect(methods).toContain('getState');
    expect(methods).toContain('getDispatcher');
    expect(methods).toContain('replaceDispatcher');
  });
});
