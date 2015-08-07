import React from 'react';
import createAll from './components/createAll';

// provide and Connector are deprecated and removed from public API
export const { Provider, connect } = createAll(React);
