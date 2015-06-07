import { expect } from 'chai';
import * as redux from '../src';

describe('Redux', () => {

  it('should export necessary components', () => {
    expect(Object.keys(redux)).to.have.length(7);

    expect(redux).to.have.a.property('createDispatcher');

    expect(redux).to.have.a.property('Provider');
    expect(redux).to.have.a.property('Connector');

    expect(redux).to.have.a.property('provide');
    expect(redux).to.have.a.property('connect');

    expect(redux).to.have.a.property('composeStores');
    expect(redux).to.have.a.property('bindActions');
  });

});
