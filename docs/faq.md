## FAQ

### How does hot reloading work?

* http://webpack.github.io/docs/hot-module-replacement.html
* http://gaearon.github.io/react-hot-loader/
* Literally that's it. Redux is fully driven by component props, so it works on top of React Hot Loader.

### Can I use this in production?

Yep. People already do that although I warned them! The API surface is minimal so migrating to 1.0 API when it comes out won't be difficult. Let us know about any issues.

### How do I do async?

There's already a built-in way of doing async action creators:

```js
// Can also be async if you return a function
export function incrementAsync() {
  return dispatch => {
    setTimeout(() => {
      // Yay! Can invoke sync or async actions with `dispatch`
      dispatch(increment());
    }, 1000);
  };
}
```

It's also easy to implement support for returning Promises or Observables with a custom middleware. [See an example of a custom Promise middleware.](https://github.com/gaearon/redux/issues/99#issuecomment-112212639)

### But there are switch statements!

`(state, action) => state` is as simple as a Store can get. You are free to implement your own `createStore`:

```js
export default function createStore(initialState, handlers) {
  return (state = initialState, action) =>
    handlers[action.type] ?
      handlers[action.type](state, action) :
      state;
}
```

and use it for your Stores:

```js
export default createStore(0, {
  [INCREMENT_COUNTER]: x => x + 1,
  [DECREMENT_COUNTER]: x => x - 1
});
```

It's all just functions.
Fancy stuff like generating stores from handler maps, or generating action creator constants, should be in userland.
Redux has no opinion on how you do this in your project.

See also [this gist](https://gist.github.com/skevy/8a4ffc3cfdaf5fd68739) for an example implementation of action constant generation.

### What about `waitFor`?

I wrote a lot of vanilla Flux code and my only use case for it was to avoid emitting a change before a related Store consumes the action. This doesn't matter in Redux because the change is only emitted after *all* Stores have consumed the action.

If several of your Stores want to read data from each other and depend on each other, it's a sign that they should've been a single Store instead. [See this discussion on how `waitFor` can be replaced by the composition of stateless Stores.](https://gist.github.com/gaearon/d77ca812015c0356654f)

### My views aren't updating!

Redux makes a hard assumption that you never mutate the state passed to you. It's easy! For example, instead of

```js
function (state, action) {
  state.isAuthenticated = true;
  state.email = action.email;
  return state;
}
```

you should write

```js
function (state, action) {
  return {
    ...state,
    isAuthenticated: true,
    email: action.email
  };
}
```

[Read more](https://github.com/sebmarkbage/ecmascript-rest-spread) about the spread properties ES7 proposal.

### How do Stores, Actions and Components interact?

Action creators are just pure functions so they don't interact with anything. Components need to call `dispatch(action)` (or use `bindActionCreators` that wraps it) to dispatch an action *returned* by the action creator.

Stores are just pure functions too so they don't need to be “registered” in the traditional sense, and you can't subscribe to them directly. They're just descriptions of how data transforms. So in that sense they don't “interact” with anything either, they just exist, and are used by the dispatcher for computation of the next state.

Now, the dispatcher is more interesting. You pass all the Stores to it, and it composes them into a single Store function that it uses for computation. The dispatcher is also a pure function, and it is passed as configuration to `createRedux`, the only stateful thing in Redux. By default, the default dispatcher is used, so if you call `createRedux(stores)`, it is created implicitly.

To sum it up: there is a Redux instance at the root of your app. It binds everything together. It accepts a dispatcher (which itself accepts Stores), it holds the state, and it knows how to turn actions into state updates. Everything else (components, for example) subscribes to the Redux instance. If something wants to dispatch an action, they need to do it on the Redux instance. `Connector` is a handy shortcut for subscribing to a slice of the Redux instance's state and injecting `dispatch` into your components, but you don't have to use it.

There is no other “interaction” in Redux.
