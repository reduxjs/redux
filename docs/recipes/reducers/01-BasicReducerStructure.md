# Basic Reducer Structure and State Shape

## Basic Reducer Structure
First and foremost, it's important to understand that your entire application really only has **one single reducer function**: the function that you've passed into `createStore` as the first argument.  That one single reducer function ultimately needs to do several things:

- The first time the reducer is called, the `state` value will be `undefined`.  The reducer needs to handle this case by supplying a default state value before handling the incoming action.
- It needs to look at the previous state and the dispatched action, and determine what kind of work needs to be done
- Assuming actual changes need to occur, it needs to create new objects and arrays with the updated data and return those
- If no changes are needed, it should return the existing state as-is. 

The simplest possible approach to writing reducer logic is to put everything into a single function declaration, like this:

```js
function counter(state, action) {
  if (typeof state === 'undefined') {
    state = 0; // If state is undefined, initialize it with a default value
  }

  if (action.type === 'INCREMENT') {
    return state + 1;
  } 
  else if (action.type === 'DECREMENT') {
    return state - 1;
  } 
  else {
    return state; // In case an action is passed in we don't understand
  }
}
```

Notice that this simple function fulfills all the basic requirements.  It returns a default value if none exists, initializing the store; it determines what sort of update needs to be done based on the type of the action, and returns new values; and it returns the previous state if no work needs to be done.  

There are some simple tweaks that can be made to this reducer.  First, repeated `if`/`else` statements quickly grow tiresome, so it's very common to use `switch` statements instead.  Second, we can use ES6's default parameter values to handle the initial "no existing data" case.  With those changes, the reducer would look like:

```js
function counter(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
}
```

This is the basic structure that a typical Redux reducer function uses.

## Basic State Shape

Redux encourages you to think about your application in terms of the data you need to manage.  The data at any given point in time is the "*state*" of your application, and the structure and organization of that state is typically referred to as its "*shape*".  The shape of your state plays a major role in how you structure your reducer logic.

A Redux state usually has a plain Javascript object as the top of the state tree. (It is certainly possible to have another type of data instead, such as a single number, an array, or a specialized data structure, but most libraries assume that the top-level value is a plain object.)  The most common way to organize data within that top-level object is to further divide data into sub-trees, where each top-level key represents some "domain" or "slice" of related data.  For example, a basic Todo app's state might look like: 

```js
{
  visibilityFilter: 'SHOW_ALL',
  todos: [
    {
      text: 'Consider using Redux',
      completed: true,
    },
    {
      text: 'Keep all state in a single tree',
      completed: false
    }
  ]
}
```

In this example, `todos` and `visibilityFilter` are both top-level keys in the state, and each represents a "slice" of data for some particular concept.

Most applications deal with multiple types of data, which can be broadly divided into three categories:

- _Domain data_: data that the application needs to show, use, or modify (such as "all of the Todos retrieved from the server")
- _App state_: data that is specific to the application's behavior (such as "Todo #5 is currently selected", or "there is a request in progress to fetch Todos")
- _UI state_: data that represents how the UI is currently displayed (such as "The EditTodo modal dialog is currently open")


Because the store represents the core of your application, you should **define your state shape in terms of your domain data and app state, not your UI component tree**.  As an example, a shape of `state.leftPane.todoList.todos` would be a bad idea, because the idea of "todos" is central to the whole application, not just a single part of the UI.  The `todos` slice should be at the top of the state tree instead.

There will *rarely* be a 1-to-1 correspondence between your UI tree and your state shape.  The exception to that might be if you are explicitly tracking various aspects of UI data in your Redux store as well, but even then the shape of the UI data and the shape of the domain data would likely be different.

A typical app's state shape might look roughly like:

```js
{
    domainData1 : {},
    domainData2 : {},
    appState1 : {},
    appState2 : {},
    ui : {
        uiState1 : {},
        uiState2 : {},
    }
}
```