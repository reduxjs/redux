import createProvider from './createProvider';
import createProvideDecorator from './createProvideDecorator';

import createConnector from './createConnector';
import createConnectDecorator from './createConnectDecorator';
import createConnectWrapper from './createConnectWrapper';

export default function createAll(React) {
  // Wrapper components
  const Provider = createProvider(React);
  const Connector = createConnector(React);

  // Higher-order components (decorators)
  const provide = createProvideDecorator(React, Provider);
  const connectDecorate = createConnectDecorator(React, Connector);
  const connect = createConnectWrapper(React);

  

  return { Provider, Connector, provide, connectDecorate, connect };
}
