react-redux
=========================

Higher-order React components for [Redux](https://github.com/gaearon/redux).

- [Quick Start](#quick-start)
- [Recommended API](#recommended-api)
  - [`connect`](#connect)
  - [`Provider`](#provider)
- [Deprecated API](#deprecated-api)
  - [`Connector`](#connector)
  - [`provide`](#provide)

## Quick Start

React bindings for Redux embrace the idea of [dividing “smart” and “dumb” components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0).

It is advisable that only top-level components of your app (such as route handlers, for example) are aware of Redux. Components below them should be “dumb” and receive all data via props.

<center>
<table>
    <thead>
        <tr>
            <th></th>
            <th>Location</th>
            <th>Use React-Redux</th>
            <th>To read data, they</th>
            <th>To change data, they</th>
        </tr>
    </thead>
    <tbody>
        <tr>
          <td>“Smart” Components</td>
          <td>Top level, route handlers</td>
          <td>Yes</th>
          <td>Subscribe to Redux state</td>
          <td>Dispatch Redux actions</td>
        </tr>
        <tr>
          <td>“Dumb” Components</td>
          <td>Middle and leaf components</td>
          <td>No</th>
          <td>Read data from props</td>
          <td>Invoke callbacks from props</td>
        </tr>
    </tbody>
</table>
</center>

### “Dumb” component is unaware of Redux

Let’s say we have a `<Counter />` “dumb” component with a number `counter` prop, and an `increment` function prop that it will call when user presses an “Increment” button:

```js
import { Component } from 'react';

export default class Counter extends Component {
  render() {
    return (
      <button onClick={this.props.increment}>
        {this.props.counter}
      </button>
    );
  }
}
```

### “Smart” component is `connect()`-ed to Redux

Here’s how we hook it up to the Redux Store.

We will use `connect()` function provided by `react-redux` to turn a “dumb” `Counter` into a smart component. With the current API, we’ll need to add an intermediate `CounterContainer` component, but we will soon make `connect` API more powerful so this won’t be required. The `connect()` function lets you specify *which exactly* state from the Redux store your component wants to track. This lets you subscribe on any level of granularity.

Our `CounterContainer` that’s necessary to hook `Counter` up to a Redux store looks like this:  
(This will be much less verbose in the next versions.)

```js
import { Component } from 'react';
import { connect } from 'react-redux';

// Assuming this is our “dumb” counter
import Counter from '../components/Counter';

// Assuming these are Redux action creators
import { increment } from './actionCreators';

function select(state) {
  // Which part of the Redux global state does our component want to receive as props?
  return {
    counter: state.counter
  };
}

class CounterContainer extends Component {
  render() {
    // connect() call below will inject `dispatch` and
    // every key returned by `select` as props into our container:
    const { dispatch, counter } = this.props;
    
    // render our “dumb” component, hooking up state to data props
    // and using “dispatch action produced by this action creator” as callbacks.
    // this is a “bridge” between a Redux-aware world above and Redux-unaware world below.

    return (
      <Counter counter={counter}
               increment={() => dispatch(increment())} />
    );
  }
}

// Don't forget to actually use connect!
export default connect(select)(CounterContainer);

// You might have noticed that we used parens twice.
// This is called partial applications, and it lets people
// use ES7 decorator proposal syntax:
//
// @connect(select)
// export default class CounterContainer { ... }
//
// Don’t forget decorators are experimental! And they
// desugar to function calls anyway as example above demonstrates.
```

As you can see, action creators in Redux just return actions, but we need to manually “bind” them to the `dispatch` function for our Redux store. Why don’t we bind action creators to a store right away? This is because of the so-called “universal” apps that need to render on the server. They would have a different store instance for every request, so we don’t know the store instance during the definition!

### Binding many action creators

Binding can get cumbersome, so Redux provides a `bindActionCreators` helper to turn many action creator methods into an object with methods called the same, but bound to a particular `dispatch` function:

```js

import { Component } from 'react';
import { connect } from 'react-redux';

// A helper provided by Redux!
import { bindActionCreators } from 'redux';
// Import many action creators as a single object (like `require('./actionCreators')` in CommonJS)
import * as CounterActionCreators from './actionCreators';
import Counter from '../components/Counter';

function select(state) {
  return {
    counter: state.counter
  };
}

class CounterContainer extends Component {
  render() {
    const { dispatch, counter } = this.props;
    
    // This time, we use `bindActionCreators` to bind many action creators
    // to a particular dispatch function from our Redux store.

    return (
      <Counter counter={counter}
               {...bindActionCreators(CounterActionCreators, dispatch)} />
    );
  }
}

// Don't forget to actually use connect!
export default connect(select)(CounterContainer);
```

You can have many `connect()`-ed components in your app at any depth, and you can even nest them. It is however preferable that you try to only `connect()` top-level components such as route handlers, so the data flow in your application stays predictable.

### Injecting Redux store

Finally, how do we actually hook it up to a Redux store? We need to create the store somewhere at the root of our component hierarchy. For client apps, the root component is a good place. For server rendering, you can do this in the request handler.

The trick is to wrap the whole view hierarchy into `<Provider>{() => ... }</Provider>` where `Provider` is imported from `react-redux`. One gotcha is that **the child of `Provider` must be a function**. This is to work around an issue with how context (undocumented feature we have to rely on to pass Redux data to components below) works in React 0.13. In React 0.14, you will be able to put your view hierarchy in `<Provider>` without wrapping it into a function.

```js
import { Component } from 'react';
import { Provider } from 'react-redux';

class App extends Component {
  render() {
    // ...
  }
}

const targetEl = document.getElementById('root');

React.render((
  <Provider store={store}>
    {() => <App />}
  </Provider>
), targetEl);

// or, if you use React Router 0.13,

// Router.run(routes, Router.HistoryLocation, (Handler) => {
//   React.render(
//     <Provider store={store}>
//       {() => <Handler />}
//     </Provider>,
//     targetEl
//   );
// });

// or, if you use React Router 1.0,
// React.render(
//   <Provider store={store}>
//     {() => <Router history={history}>...</Router>}
//   </Provider>,
//   targetEl
// );
```

## Recommended API

### `connect`

```js
export default connect(select)(MyComponent);
```

Returns a component class that injects the Redux Store’s `dispatch` as a prop into `Component` so it can dispatch Redux actions.

The returned component also subscribes to the updates of Redux store. Any time the state changes, it calls the `select` function passed to it. The selector function takes a single argument of the entire Redux store’s state and returns an object to be passed as props. Use [reselect](https://github.com/faassen/reselect) to efficiently compose selectors and memoize derived data.

Both `dispatch` and every property returned by `select` will be provided to your `Component` as `props`.

It is the responsibility of a Smart Component to bind action creators to the given `dispatch` function and pass those
bound creators to Dumb Components. Redux provides a `bindActionCreators` to streamline the process of binding action
creators to the dispatch function.

**To use `connect()`, the root component of your app must be wrapped into `<Provider>{() => ... }</Provider>` before being rendered.**

See the usage example in the quick start above.

### `Provider`

```js
<Provider store={store}>
  {() => <MyRootComponent>}
</Provider>
```

The `Provider` component takes a `store` prop and a [function as a child](#child-must-be-a-function) with your root
component. The `store` is then passed to the child via React's `context`. This is the entry point for Redux and must be
present in order to use the `Connector` component.

## Deprecated API

### `Connector`

>**Note**  
>Deprecated. Use `connect()` instead.

```js
<Connector select={fn}>
  {props => <MyComponent {...props}  />}
</Connector>
```

Similar to `Provider`, the `Connector` expects a single [function as a child](#child-must-be-a-function) and a function
as the `select` prop. The selector function takes a single argument of the entire root store and returns an object to be
passed as properties to the child. In addition to the properties returned by the selector, a `dispatch` function is
passed to the child for dispatching actions.

It is the responsibility of a Smart Component to bind action creators to the given `dispatch` function and pass those
bound creators to Dumb Components. Redux provides a `bindActionCreators` to streamline the process of binding action
creators to the dispatch function.

We don’t recommend its use anymore because it’s not as flexible as `connect()` and has some performance implications for more complex scenarios.

### `provide`

>**Note**  
>Deprecated. Use `<Provider>` instead.

```js
export default provide(store)(MyRootComponent);
```

This higher-order component provides the same functionality as `<Provider>`. We don’t recommend it anymore because it’s less flexible than `<Provider>` and doesn’t work with [redux-devtools](http://github.com/gaearon/redux-devtools) or server rendering.

## License

MIT
