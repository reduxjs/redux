import createProvider from './createProvider';
import createProvideDecorator from './createProvideDecorator';

import createConnector from './createConnector';
import createConnectDecoratorDeprecated from './createConnectDecoratorDeprecated';
import createConnectDecorator from './createConnectDecorator';

export default function createAll(React) {
  // Wrapper components
  const Provider = createProvider(React);
  const Connector = createConnector(React);

  // Higher-order components (decorators)
  const provide = createProvideDecorator(React, Provider);
  const connectDeprecated = createConnectDecoratorDeprecated(React, Connector);
  const connect = createConnectDecorator(React);

  return { Provider, Connector, provide, connect, connectDeprecated };
}
