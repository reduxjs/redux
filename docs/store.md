### Initializing Redux

The simplest way to initialize a Redux instance is to give it an object whose values are your Store functions, and whose keys are their names. You may `import *` from the file with all your Store definitions to obtain such an object:

```js
import { createRedux } from 'redux';
import { Provider } from 'redux/react';
import * as stores from '../stores/index';

const redux = createRedux(stores);
```

Then pass `redux` as a prop to `<Provider>` component in the root component of your app, and you're all set:

```js
export default class App {
  render() {
    return (
      <Provider redux={redux}>
        {() =>
          <CounterApp />
        }
      </Provider>
    );
  }
}
```
