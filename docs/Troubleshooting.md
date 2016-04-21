# Troubleshooting

This is a place to share common problems and solutions to them.  
The examples use React, but you should still find them useful if you use something else.

### Nothing happens when I dispatch an action

Sometimes, you are trying to dispatch an action, but your view does not update. Why does this happen? There may be several reasons for this.

#### Never mutate reducer arguments

It is tempting to modify the `state` or `action` passed to you by Redux. Don’t do this!

Redux assumes that you never mutate the objects it gives to you in the reducer. **Every single time, you must return the new state object.** Even if you don’t use a library like [Immutable](https://facebook.github.io/immutable-js/), you need to completely avoid mutation.

Immutability is what lets [react-redux](https://github.com/gaearon/react-redux) efficiently subscribe to fine-grained updates of your state. It also enables great developer experience features such as time travel with [redux-devtools](http://github.com/gaearon/redux-devtools).

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

It needs to be rewritten like this:

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
      // Return a new array
      return state.map((todo, index) => {
        if (index === action.index) {
          // Copy the object before mutating
          return Object.assign({}, todo, {
            completed: true
          })
        }
        return todo
      })
    default:
      return state
  }
}
```

It’s more code, but it’s exactly what makes Redux predictable and efficient. If you want to have less code, you can use a helper like [`React.addons.update`](https://facebook.github.io/react/docs/update.html) to write immutable transformations with a terse syntax:

```js
// Before:
return state.map((todo, index) => {
  if (index === action.index) {
    return Object.assign({}, todo, {
      completed: true
    })
  }
  return todo
})

// After
return update(state, {
  [action.index]: {
    completed: {
      $set: true
    }
  }
})
```

Finally, to update objects, you’ll need something like `_.extend` from Underscore, or better, an [`Object.assign`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) polyfill.

Make sure that you use `Object.assign` correctly. For example, instead of returning something like `Object.assign(state, newData)` from your reducers, return `Object.assign({}, state, newData)`. This way you don’t override the previous `state`.

You can also enable the [object spread operator proposal](recipes/UsingObjectSpreadOperator.md) for a more succinct syntax:

```js
// Before:
return state.map((todo, index) => {
  if (index === action.index) {
    return Object.assign({}, todo, {
      completed: true
    })
  }
  return todo
})

// After:
return state.map((todo, index) => {
  if (index === action.index) {
    return { ...todo, completed: true }
  }
  return todo
})
```

Note that experimental language features are subject to change.

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

#### Make sure mapStateToProps is correct

It's possible you're correctly dispatching an action and applying your reducer but the corresponding state is not being correctly translated into props.

## Something else doesn’t work

Ask around on the **#redux** [Reactiflux](http://reactiflux.com/) Discord channel, or [create an issue](https://github.com/reactjs/redux/issues).  
If you figure it out, [edit this document](https://github.com/reactjs/redux/edit/master/docs/Troubleshooting.md) as a courtesy to the next person having the same problem.
