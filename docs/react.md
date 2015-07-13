React bindings reside in the [react-redux](https://github.com/gaearon/react-redux) repository.

### Components

#### Dumb Components

```js
// The dumb component receives everything using props:
import React, { PropTypes } from 'react';

export default class Counter {
  static propTypes = {
    increment: PropTypes.func.isRequired,
    decrement: PropTypes.func.isRequired,
    counter: PropTypes.number.isRequired
  };

  render() {
    const { increment, decrement, counter } = this.props;
    return (
      <p>
        Clicked: {counter} times
        {' '}
        <button onClick={increment}>+</button>
        {' '}
        <button onClick={decrement}>-</button>
      </p>
    );
  }
}
```

#### Smart Components

```js
// The smart component may observe stores using `<Connector />`,
// and bind actions to the dispatcher with `bindActionCreators`.

import React from 'react';
import { bindActionCreators } from 'redux';
import { Connector } from 'react-redux';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';

// You can optionally specify `select` for finer-grained subscriptions
// and retrieval. Only when the return value is shallowly different,
// will the child component be updated.
function select(state) {
  return { counter: state.counter };
}

export default class CounterApp {
  render() {
    return (
      <Connector select={select}>
        {({ counter, dispatch }) =>
          /* Yes this is child as a function. */
          <Counter counter={counter}
                   {...bindActionCreators(CounterActions, dispatch)} />
        }
      </Connector>
    );
  }
}
```

#### Decorators

The `@connect` decorator lets you create smart components less verbosely:

```js
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';

@connect(state => ({
  counter: state.counter
}))
export default class CounterApp {
  render() {
    const { counter, dispatch } = this.props;
    // Instead of `bindActionCreators`, you may also pass `dispatch` as a prop
    // to your component and call `dispatch(CounterActions.increment())`
    return (
      <Counter counter={counter}
               {...bindActionCreators(CounterActions, dispatch)} />
    );
  }
}
```

### React Native

To use Redux with React Native, just replace imports from `react-redux` with `react-redux/native`:

```js
import { bindActionCreators } from 'redux';
import { Provider, Connector } from 'react-redux/native';
```
