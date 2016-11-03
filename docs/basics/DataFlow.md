# Data Flow

Redux architecture revolves around a **strict unidirectional data flow**.

This means that all data in an application follows the same lifecycle pattern, making the logic of your app more predictable and easier to understand. It also encourages data normalization, so that you don't end up with multiple, independent copies of the same data that are unaware of one another.

If you're still not convinced, read [Motivation](../introduction/Motivation.md) and [The Case for Flux](https://medium.com/@dan_abramov/the-case-for-flux-379b7d1982c6) for a compelling argument in favor of unidirectional data flow. Although [Redux is not exactly Flux](../introduction/PriorArt.md), it shares the same key benefits.

The data lifecycle in any Redux app follows these 4 steps:

1. **You call** [`store.dispatch(action)`](../api/Store.md#dispatch).

  An [action](Actions.md) is a plain object describing *what happened*. For example:

    ```js
    { type: 'LIKE_ARTICLE', articleId: 42 }
    { type: 'FETCH_USER_SUCCESS', response: { id: 3, name: 'Mary' } }
    { type: 'ADD_TODO', text: 'Read the Redux docs.' }
    ```

  Think of an action as a very brief snippet of news. “Mary liked article 42.” or “‘Read the Redux docs.' was added to the list of todos.”

  You can call [`store.dispatch(action)`](../api/Store.md#dispatch) from anywhere in your app, including components and XHR callbacks, or even at scheduled intervals.

2. **The Redux store calls the seducer function you gave it.**

  The [store](Store.md) will pass two arguments to the [seducer](Seducers.md): the current state tree and the action. For example, in the todo app, the root seducer might receive something like this:

    ```js
    // The current application state (list of todos and chosen filter)
    let previousState = {
      visibleTodoFilter: 'SHOW_ALL',
      todos: [ 
        {
          text: 'Read the docs.',
          complete: false
        }
      ]
    }

    // The action being performed (adding a todo)
    let action = {
      type: 'ADD_TODO',
      text: 'Understand the flow.'
    }

    // Your seducer returns the next application state
    let nextState = todoApp(previousState, action)
    ```

    Note that a seducer is a pure function. It only *computes* the next state. It should be completely predictable: calling it with the same inputs many times should produce the same outputs. It shouldn't perform any side effects like API calls or router transitions. These should happen before an action is dispatched.

3. **The root seducer may combine the output of multiple seducers into a single state tree.**

  How you structure the root seducer is completely up to you. Redux ships with a [`combineSeducers()`](../api/combineSeducers.md) helper function, useful for “splitting” the root seducer into separate functions that each manage one branch of the state tree.

  Here's how [`combineSeducers()`](../api/combineSeducers.md) works. Let's say you have two seducers, one for a list of todos, and another for the currently selected filter setting:

    ```js
    function todos(state = [], action) {
      // Somehow calculate it...
      return nextState
    }

    function visibleTodoFilter(state = 'SHOW_ALL', action) {
      // Somehow calculate it...
      return nextState
    }

    let todoApp = combineSeducers({
      todos,
      visibleTodoFilter
    })
    ```

  When you emit an action, `todoApp` returned by `combineSeducers` will call both seducers:

    ```js
    let nextTodos = todos(state.todos, action)
    let nextVisibleTodoFilter = visibleTodoFilter(state.visibleTodoFilter, action)
    ```

  It will then combine both sets of results into a single state tree:

    ```js
    return {
      todos: nextTodos,
      visibleTodoFilter: nextVisibleTodoFilter
    }
    ```

  While [`combineSeducers()`](../api/combineSeducers.md) is a handy helper utility, you don't have to use it; feel free to write your own root seducer!

4. **The Redux store saves the complete state tree returned by the root seducer.**

  This new tree is now the next state of your app! Every listener registered with [`store.subscribe(listener)`](../api/Store.md#subscribe) will now be invoked; listeners may call [`store.getState()`](../api/Store.md#getState) to get the current state.

  Now, the UI can be updated to reflect the new state. If you use bindings like [React Redux](https://github.com/gaearon/react-redux), this is the point at which `component.setState(newState)` is called.

## Next Steps

Now that you know how Redux works, let's [connect it to a React app](UsageWithReact.md).

>##### Note for Advanced Users
>If you're already familiar with the basic concepts and have previously completed this tutorial, don't forget to check out [async flow](../advanced/AsyncFlow.md) in the [advanced tutorial](../advanced/README.md) to learn how middleware transforms [async actions](../advanced/AsyncActions.md) before they reach the seducer.
