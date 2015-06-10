import expect from 'expect';
import * as redux from '../src';

describe('Redux', () => {

  it('should export necessary components', () => {
    const imports = Object.keys(redux);
    expect(imports.length).toBe(9);

    expect(imports).toContain('createRedux');
    expect(imports).toContain('createDispatcher');

    expect(imports).toContain('Provider');
    expect(imports).toContain('Connector');

    expect(imports).toContain('provide');
    expect(imports).toContain('connect');

    expect(imports).toContain('compose');
    expect(imports).toContain('composeStores');
    expect(imports).toContain('bindActionCreators');
  });

});
