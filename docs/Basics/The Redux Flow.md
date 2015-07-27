The Redux Flow
--------------------------

Redux implements an architecture with unidirectional data flow. What does this mean? It means that **every change to the data follows the same lifecycle and goes into a single direction in a centralized fashion.** If you’re used to “fat models” or “active records” like Backbone, this may sound weird, but unidirectional data flow makes your apps much more predictable. It also encourages data normalization, so you don’t end up with independent copies of the same state that are unaware of each other. If this sounds unconvincing, read [The Case for Flux](https://medium.com/@dan_abramov/the-case-for-flux-379b7d1982c6) for a compelling argument for unidirectional data flow. Although [Redux is not exactly Flux](./Relation to Other Libraries.md), it shares the same key benefits.

Here is how any change in a Redux app happens:

1. You call `store.dispatch(action)`. An `action` is just a plain object describing “what happened”. For example,`{ type: 'ADD_TODO', text: 'Use Redux' }`. **Actions are like newspapers, reporting anything that may result in changing the state of your app.** You can call `store.dispatch(action)` from your components, XHR callbacks, scheduled intervals, or anywhere else.

2. The Redux store will call the [reducer function](../Reference/Glossary.md#reducer) you gave it. It will **pass the current state tree as the first argument, and the action as the second one.** For example, your root reducer may receive `{ todos: ['Read docs'] }` as `state` and `{ type: 'ADD_TODO', text: 'Understand the flow' }` as `action`. With our example, we would expect it to return `{ todos: ['Read docs', 'Understand the flow'] }`.

3. How you structure your root reducer function is completely up to you. However, Redux ships with `combineReducers` helper which is useful for **“splitting” the root reducer into several separate reducer functions that each manage a slice of the state tree.** This lets you write a `todos` reducer that gets `['Read docs']` as the current state, and returns `['Read docs', 'Understand the flow']` as the next state. While `combineReducers` is a handy helper, you don’t have to use it, and you can write your own root reducer just fine.

4. **The Redux store saves the next state tree returned by the reducer.** This is now the next state of your app! It will invoke every listener registered with `store.subscribe(listener)`. The listeners may call `store.getState()` to read the current state. This is where you can update your UI using the new state. If you use bindings like [React Redux](https://github.com/gaearon/react-redux), that’s exactly where they schedule a `component.setState()` call.

This is all there is to it.

One important addition is that, **if you use any middleware on the store, it wraps the store’s `dispatch` function** and may add support for dispatching promises, [thunks](https://github.com/gaearon/redux-thunk) or other potentially asynchronous [intermediate actions](../Reference/Glossary.md#intermediate-action). In the end, after being processed with middleware, they all become “raw” plain objects, which your reducer function will receive.

--------------------------
Next: [Userland and Core](Userland and Core.md)   
