import React, { Component } from 'react';
import { Provider } from 'react-redux';
import CounterApp from './CounterApp';
import createAsyncExampleStore from '../store/createAsyncExampleStore';

// TODO
import { DebugPanel, DevTools, LogMonitor } from 'redux-devtools/lib/react';

const store = createAsyncExampleStore();

export default class App extends Component {
  render() {
    return (
      <div>
        <Provider store={store}>
          {() => <CounterApp />}
        </Provider>
        <DebugPanel top right bottom>
          <DevTools store={store}
                    monitor={LogMonitor} />
        </DebugPanel>
      </div>
    );
  }
}
