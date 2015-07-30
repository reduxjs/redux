import React from 'react-native';
import createAll from './components/createAll';

export const { Provider, Connector, provide, connectDecorate, connect } = createAll(React);
