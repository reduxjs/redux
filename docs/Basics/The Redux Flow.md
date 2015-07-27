The Redux Flow
--------------

Redux architecture revolves around a **strict unidirectional data flow**.

This means that all data in an application follows the same lifecycle pattern, making the logic of your app more predictable and easier to understand. It also encourages data normalization, so that you don't end up with multiple, independent copies of the same data that are unaware of one another.

If you're still not convinced, read [The Case for Flux](https://medium.com/@dan_abramov/the-case-for-flux-379b7d1982c6) for a compelling argument in favor of unidirectional data flow. Although [Redux is not exactly Flux](./Relation to Other Libraries.md), it shares the same key benefits.

The data lifecycle in any Redux app follows these 4 steps:

1. **You call** `store.dispatch(action)`.

  An `action` is a plain object describing *what happened*. For example:

    ```js
    actionA = { type: 'LIKED_ARTICLE', articleId: 42 };
    actionB = { type: 'USER_FETCHED', response: {...} };
    actionC = { type: 'TODO_ADDED', text: 'Read the Redux docs.'};
    ```

  Think of an action as a very brief snippet of news. "Mary liked article 42." or "'Read the Redux docs.' was added to the list of todos."

  You can call `store.dispatch(action)` from anywhere in your app, including components and XHR callbacks, or even at scheduled intervals.

2. **The Redux store calls the [root reducer function](../Reference/Glossary.md#reducer) you gave it.**

  The store will pass two arguments to the reducer, the current state tree and the action. For example, in the TODOMVC app, the root reducer might receive something like this:

    ```js
    rootReducer({
        todos: ['Read the docs.']         // The current state (list of todos)
    }, {
        type: 'ADD_TODO',
        text: 'Understand the flow.'      // The action performed, in this case adding a todo
    });
    ```

3. **The root reducer combines the output of multiple reducers into a single state tree.**

  How you structure the root reducer is completely up to you. Redux ships with a `combineReducers` helper function, useful for "splitting" the root reducer into separate functions that each manage one branch of the state tree.

  Here's how `combineReducers` works. Let's say you had a list of Todos, and a basic authenticated User to keep track of with two separate reducers:

    `{ todos: todosReducer, user: authenticationReducer }`

  When you emit an action, `combineReducers` will call both reducers:

    `todosReducer(state.todos, action); authenticationReducer(state.user, action);`

  It will then combine both sets of results into a single state tree:

    `{ todos: updatedTodosList, user: updatedUserInfo }`

  `combineReducers` is a handy helper utility, but you don't have to use it; feel free to write your own root reducer!

4. **The Redux store saves the complete state tree returned by the root reducer.** This new tree is now the next state of your app! Every listener registered with `store.subscribe(listener)` will now be invoked; listeners may call `store.getState()` to get the current state. Now, the UI can be updated to reflect the new state. If you use bindings like [React Redux](https://github.com/gaearon/react-redux), this is the point at which `component.setState(newState)` is called.

That's it!

**Note**: It is important to remember that if you use any middleware on the store, the middleware will wrap the store's `dispatch` function and may add support for different types of actions **including asynchronous actions.**

Action Creators can be asynchronous as well, it's up to you to decide where it makes sense.

After being processed by the middleware, whether asynchronous or not, your data will be received by the reducer function as a plain object.

--------------------------

Next: [Userland and Core](Userland and Core.md)   
