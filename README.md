react-redux
=========================

Higher-order React components for [Redux](https://github.com/gaearon/redux).

- [Quick Start](#quick-start)
- [Components](#components)
  - [`Provider`](#provider)
  - [`Connector`](#connector)
- [Decorators](#decorators)

## Quick Start

Hooking up the Counter example into React looks like this:

```js
import { bindActionCreators } from 'redux';
import { Provider, Connector } from 'react-redux';

// store setup left out... see the Redux documentation for initializing action creators, reducers and the store.

function select(state) {
  return { counter: state.counter };
}
class CounterApp {
  render() {
    return (
      <Connector select={select}>
        {({ counter, dispatch }) =>
          /* Yes this is child as a function. See the Connector section for why this is. */
          <Counter counter={counter}
                   {...bindActionCreators(CounterActions, dispatch)} />
        }
      </Connector>
    );
  }
}

const containerElement = document.getElementByID('container');
React.run((
  <Provider store={store}>
    {() => <CounterApp />}
  </Provider>
), containerElement);
```

## Components

### `Provider`

The `Provider` component takes a `store` prop and a [function as a child](#child-must-be-a-function) with your root
component. The `store` is then passed to the child via React's `context`. This is the entry point for Redux and must be
present in order to use the `Connector` component.

### `Connector`

Components in React can be divided into two categories: Dumb Components, which have no knowledge of your application's
state and focus on a specific piece of functionality; and Smart Components which take in your application's state
and stich together Dumb Components. This library has a Higher-Order Component called `Connector` for providing specific
pieces of state to a Smart Component automatically and handling store changes gracefully.

Similar to `Provider`, the `Connector` expects a single [function as a child](#child-must-be-a-function) and a function
as the `select` prop. The selector function takes a single argument of the entire root store and returns an object to be
passed as properties to the child. In addition to the properties returned by the selector, a `dispatch` function is
passed to the child for dispatching actions.

It is the responsibility of a Smart Component to bind action creators to the given `dispatch` function and pass those
bound creators to Dumb Components. Redux provides a `bindActionCreators` to streamline the process of binding action
creators to the dispatch function.

#### Child must be a function

React's context feature is technically not feature complete and has a bug in the current (0.13) release. The work around
for this bug is to pass a function as the child which will then return the Component desired.

## Decorators

ECMA Script 6 introduces a new syntactic feature called Decorators. `react-redux` comes with two decorators to simply
creating smart components and providing the store at the top level. Here is the same example at the top of this document
using decorators:

```js
import { bindActionCreators } from 'redux';
import { connect, provide } from `react-redux';

// store setup left out... see the Redux documentation for initializing action creators, reducers and the store.

// Note: you do *not* have to `@provide` every component you `@connect`, but this abritrarily simple example only has
one Smart Component at the top level. A more complete example may have a root level component that is only decorated
with `@provide` and many smart components decorated with `@connect`.
@provide(store)
@connect((state) => ({ counter: state.counter }))
class CounterApp {
  render() {
    return <Counter counter={counter} {...bindActionCreators(CounterActions, dispatch)} />;
  }
}

const containerElement = document.getElementByID('container');
React.run(<CounterApp />, containerElement);
```
