import createProvider from './createProvider';

import createConnector from './createConnector';
import createConnectDecorator from './createConnectDecorator';

export default function createAll(React) {
  const Provider = createProvider(React);
  const connect = createConnectDecorator(React, createConnector(React));

  // provider and Connector are deprecated and removed from public API
  return { Provider, connect };
}
