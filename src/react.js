import React from 'react';
import createAll from './components/createAll';

const { Provider, Connector, provide, connect } = createAll(React);

export { Provider, Connector, provide, connect };
