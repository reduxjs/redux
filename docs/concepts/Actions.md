# Actions

**Actions** are payloads of information that send data from your application to your store. They are the _only_ source of information for the store. You can send them to the store using [`store.dispatch()`](../api/Store.md#dispatch) however react-redux will abstract this into `mapDispatchToProps`.

Here's an example action which represents adding a new todo item:

```js
const ADD_TODO = 'ADD_TODO'
```

```js
{
  type: ADD_TODO,
  text: 'Build my first Redux app'
}
```

Actions are plain JavaScript objects. Actions must have a `type` property that indicates the type of action being performed. Types should typically be defined as string constants. Once your app is large enough, you may want to move them into a separate module.

```js
import { ADD_TODO, REMOVE_TODO } from '../actionTypes'
```

Other than `type`, the structure of an action object is really up to you. If you're interested, check out [Flux Standard Action](https://github.com/acdlite/flux-standard-action) for recommendations on how actions could be constructed.

```js
{
  type: TOGGLE_TODO,
  index: 5
}
```

It's a good idea to pass as little data in each action as possible. For example, it's better to pass `index` than the whole todo object.

## Action Creators

**Action creators** are exactly that—functions that create actions. It's easy to conflate the terms “action” and “action creator”, so do your best to use the proper term.

In Redux, action creators simply return an action:

```js
function addTodo(text) {
  return {
    type: ADD_TODO,
    text
  }
}
```

This makes them portable and easy to test.

The `dispatch()` function can be accessed directly from the store as [`store.dispatch()`](../api/Store.md#dispatch), but more likely you'll access it using a helper like [react-redux](http://github.com/gaearon/react-redux)'s `connect()`. You can use [`bindActionCreators()`](../api/bindActionCreators.md) to automatically bind many action creators to a `dispatch()` function.

Action creators can also be asynchronous and have side-effects. You can read about [async actions](../advanced/AsyncActions.md) in the [advanced tutorial](../advanced/README.md) to learn how to handle AJAX responses and compose action creators into async control flow. Don't skip ahead to async actions until you've completed the basics tutorial, as it covers other important concepts that are prerequisite for the advanced tutorial and async actions.

## Source Code

### `actions.js`

```js
/*
 * action types
 */

export const ADD_TODO = 'ADD_TODO'
export const TOGGLE_TODO = 'TOGGLE_TODO'

/*
 * action creators
 */

export function addTodo(text) {
  return { type: ADD_TODO, text }
}

export function toggleTodo(index) {
  return { type: TOGGLE_TODO, index }
}
```

## Next Steps

Now let's [define some reducers](Reducers.md) to specify how the state updates when you dispatch these actions!
