import createProvider from './createProvider';
import createProvideDecorator from './createProvideDecorator';

import createConnectDecorator from './createConnectDecorator';

export default function createAll(React) {
  // Wrapper components
  const Provider = createProvider(React);

  // Higher-order components (decorators)
  const provide = createProvideDecorator(React, Provider);
  const connect = createConnectDecorator(React);

  return { Provider, provide, connect };
}
