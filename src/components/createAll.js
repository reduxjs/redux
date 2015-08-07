import createProvider from './createProvider';
import createConnect from './createConnect';

export default function createAll(React) {
  const Provider = createProvider(React);
  const connect = createConnect(React);

  return { Provider, connect };
}
