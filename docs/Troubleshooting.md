# Troubleshooting

This is a place to share common problems and solutions to them.  
The examples use React, but you should still find them useful if you use something else.

### Nothing happens when I dispatch an action

Sometimes, you are trying to dispatch an action, but your view does not update. Why does this happen? There may be several reasons for this.

#### Never mutate reducer arguments

It’s tempting to modify the `state` (or objects nested within it) or `action` passed to you by Redux. Don’t do this!

For example, a reducer like this is wrong because it mutates the state:

```js
function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      // Wrong! This mutates state
      state.push({
        text: action.text,
        completed: false
      })
      return state
    case 'COMPLETE_TODO':
      // Wrong! This mutates state[action.index].
      state[action.index].completed = true
      return state
    default:
      return state
  }
}
```

Redux depends on you never mutating the objects it passes to your reducer, or objects nested within them. **Every single time you change state, you must return a new state object.** Even if you don’t use a library like [Immutable](https://facebook.github.io/immutable-js/), you need to completely avoid mutation.

Immutability is what lets [react-redux](https://github.com/gaearon/react-redux) efficiently subscribe to fine-grained updates of your state. It also enables great developer experience features such as time travel with [redux-devtools](http://github.com/gaearon/redux-devtools).

To avoid mutating arrays you can use things like `.slice()`, `.concat()`, and spread (`...state`) to extract the elements you want to retain and combine them with any new elements you may want to add, while omitting elements you don’t want.

To avoid mutating objects you’ll generally want to use a utility like `extend()` from Underscore, `assign()` from Lodash, or [`Object.assign()`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) or a polyfill for it.

`Object.assign()` mutates its first argument, so make sure that you use it correctly. For example, instead of returning something like `Object.assign(state, { completed: true })` from your reducers, return `Object.assign({}, state, { completed: true })`. This way you don’t mutate the previous `state`.

If you’re using Babel 6 you can alternatively use the [proposed object spread syntax](https://github.com/sebmarkbage/ecmascript-rest-spread) by enabling [`babel-plugin-transform-object-rest-spread`](http://babeljs.io/docs/plugins/transform-object-rest-spread/) or a preset that includes it. (At the time of this writing the proposal is stage 2 and therefore the plugin is included directly in [`babel-preset-stage-2`](http://babeljs.io/docs/plugins/preset-stage-2/) and indirectly in lower numbered stage presets.) Example:

```js
// Before:
state[action.index] = Object.assign({}, state[action.index], {
  completed: true
})

// After:
state[action.index] = { ...state[action.index], completed: true }
```

Note that non-standard language features are subject to change, and it’s unwise to rely on them in large codebases.

The earlier example needs to be rewritten to not mutate state. Here’s a corrected version using the techniques we’ve discussed:

```js
function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      // Return a new array
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    case 'COMPLETE_TODO':
      // Copy elements to a new array
      state = [...state]
      // Copy the object before mutating
      state[action.index] = Object.assign({}, state[action.index], {
        completed: true
      })
      return state
    default:
      return state
  }
}
```

It’s more code, but it’s exactly what makes Redux predictable and efficient. If you want to have less code, you can use a helper like [`React.addons.update`](https://facebook.github.io/react/docs/update.html) to write immutable transformations with a terse syntax:

```js
// Before:
// Copy elements to a new array
state = [...state]
// Copy the object before mutating
state[action.index] = Object.assign({}, state[action.index], {
  completed: true
})
return state

// After:
return update(state, {
  [action.index]: {
    completed: {
      $set: true
    }
  }
})
```

#### Don’t forget to call [`dispatch(action)`](api/Store.md#dispatch)

If you define an action creator, calling it will *not* automatically dispatch the action. For example, this code will do nothing:


#### `TodoActions.js`

```js
export function addTodo(text) {
  return { type: 'ADD_TODO', text }
}
```

#### `AddTodo.js`

```js
import React, { Component } from 'react'
import { addTodo } from './TodoActions'

class AddTodo extends Component {
  handleClick() {
    // Won't work!
    addTodo('Fix the issue')
  }

  render() {
    return (
      <button onClick={() => this.handleClick()}>
        Add
      </button>
    )
  }
}
```

It doesn’t work because your action creator is just a function that *returns* an action. It is up to you to actually dispatch it. We can’t bind your action creators to a particular Store instance during the definition because apps that render on the server need a separate Redux store for every request.

The fix is to call [`dispatch()`](api/Store.md#dispatch) method on the [store](api/Store.md) instance:

```js
handleClick() {
  // Works! (but you need to grab store somehow)
  store.dispatch(addTodo('Fix the issue'))
}
```

If you’re somewhere deep in the component hierarchy, it is cumbersome to pass the store down manually. This is why [react-redux](https://github.com/gaearon/react-redux) lets you use a `connect` [higher-order component](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750) that will, apart from subscribing you to a Redux store, inject `dispatch` into your component’s props.

The fixed code looks like this:
#### `AddTodo.js`
```js
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { addTodo } from './TodoActions'

class AddTodo extends Component {
  handleClick() {
    // Works!
    this.props.dispatch(addTodo('Fix the issue'))
  }

  render() {
    return (
      <button onClick={() => this.handleClick()}>
        Add
      </button>
    )
  }
}

// In addition to the state, `connect` puts `dispatch` in our props.
export default connect()(AddTodo)
```

You can then pass `dispatch` down to other components manually, if you want to.

## Something else doesn’t work

Ask around on the **#redux** [Reactiflux](http://reactiflux.com/) Discord channel, or [create an issue](https://github.com/rackt/redux/issues).  
If you figure it out, [edit this document](https://github.com/rackt/redux/edit/master/docs/Troubleshooting.md) as a courtesy to the next person having the same problem.
