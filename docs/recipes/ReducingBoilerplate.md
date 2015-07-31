# Reducing Boilerplate

Redux is in part [inspired by Flux](../introduction/PriorArt.md), and the most common complaint about Flux is how it makes you write a lot of boilerplate. In this recipe, we will consider how Redux lets us choose how verbose we’d like our code to be, depending on personal style, team preferences, longer term maintainability, and so on.

## Actions

Actions are plain objects describing what happened in the app, and serve as the sole way to describe an intention to mutate the data. It’s important that **action being objects you have to dispatch is not boilerplate, but one of the [fundamental design choices](../introduction/ThreePrinciples.md) of Redux**.

There are frameworks claiming to be similar to Flux, but without a concept of action objects. In terms of being predictable, this is a step backwards from Flux or Redux. If there are no serializable plain object actions, it is impossible to record and replay user sessions, or to implement [hot reloading with time travel](https://www.youtube.com/watch?v=xsSnOQynTHs). If you’d rather modify data directly, you don’t need Redux.

Actions look like this:

```js
{ type: 'ADD_TODO', text: 'Use Redux' }
{ type: 'REMOVE_TODO', id: 42 }
{ type: 'LOAD_ARTICLE', response: { ... } }
```

It is a common convention that actions have a constant type that helps reducers (or Stores in Flux) identify them. We recommend that you use strings and not [Symbols](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol) for action types, because strings are serializable, and by using Symbols you make recording and replaying harder than it needs to be.

In Flux, it is traditionally thought that you would define every action type as a string constant:

```js
const ADD_TODO = 'ADD_TODO';
const REMOVE_TODO = 'REMOVE_TODO';
const LOAD_ARTICLE = 'LOAD_ARTICLE';
```

Why is this beneficial? **It is often claimed that constants are unnecessary, and for small projects, this might be correct.** For larger projects, there are some benefits to defining action types as constants:

* It helps maintain the naming consistent because all action types are gathered in a single place.
* Sometimes you want to see all existing actions before working on a new feature. It happens that the action you needed was already added by somebody on the team, but you didn’t know.
* The list of action types that were added, removed, and changed in a Pull Request, helps everyone on the team keep track of scope and implementation of new features.
* If you make a typo when importing an action constant, you will get `undefined`. This is much easier to notice than a typo when you wonder why nothing happens when the action is dispatched.

It is up to you to choose the conventions for your project. You may start by using inline strings, and later transition to constants, and maybe later group them into a single file. Redux does not have any opinion here, so use your best judgement.

## Action Creators

It is another common convention that, instead of creating action objects inline in the places where you dispatch the actions, you would create functions generating them.

For example, instead of calling `dispatch` with an object literal:

```js
// somewhere in an event handler
dispatch({
  type: 'ADD_TODO',
  text: 'Use Redux'
});
```

you might write an action creator in a separate file, and import it from your component:

#### `ActionCreators.js`

```js
export function addTodo(text) {
  return {
    type: 'ADD_TODO',
    text
  };
}
```

#### `AddTodo.js`

```js
import { addTodo } from './ActionCreators';

// somewhere in an event handler
dispatch(addTodo('Use Redux'))
```

Action creators have often been criticized as boilerplate. Well, you don’t have to write them! **You can use object literals if you feel this better suits your project.** There are, however, some benefits for writing action creators you should know about.

Let’s say a designer comes back to us after reviewing our prototype, and tells that we need to allow three todos maximum. We can enforce this by rewriting our action creator to a callback form with [redux-thunk](https://github.com/gaearon/redux-thunk) middleware an adding an early exit:

```js
function addTodoWithoutCheck(text) {
  return {
    type: 'ADD_TODO',
    text
  };
}

export function addTodo(text) {
  return function (dispatch, getState) {
    if (getState().todos.length === 3) {
      // Exit early
      return;
    }

    dispatch(addTodoWithoutCheck(text));
  }
}
```

We just modified how `addTodo` action creator behaves, completely invisible to the calling code. **We don’t have to worry about looking at each place where todos are being added, to make sure they have this check.** Action creators let you decouple additional logic around dispatching an action, from the actual components emitting those actions, and it’s very handy when the application is under heavy development, and the requirements change often.

### Generating Action Creators

...

## Reducers

...

### Generating Reducers

...
