# Implementing Undo History

To add undo functionality (or any other functionality) to your existing
reducers, you need to create a higher-order reducer, which is a function
(reducer) that returns a reducer. This returned reducer is enhanced with undo
functionality (or any other functionality). It could look like this:

```js
export default function undoable(reducer) {
  return (state, action) => {
    switch (action.type) {
    case 'UNDO_ACTION':
      return undo(state); // undo here and return the past state
    case 'REDO_ACTION':
      return redo(state); // redo here and return the future state
    default:
      let res = reducer(state, action);
      return {
        present: res,
        history: updateHistory(res, state.history) // store `res` in history
      }
    }
  }
}
```

Fortunately, you won't have to implement all that, because there's already a
library that does this.


## Introducing redux-undo

[redux-undo](https://github.com/omnidan/redux-undo) is a library that provides simple undo/redo functionality for any part of your redux tree.

In this recipe, you will learn how to make the [Todo List example](http://rackt.github.io/redux/docs/basics/ExampleTodoList.html) undoable - all it takes are [two lines of code](https://twitter.com/dan_abramov/status/647040825826918400) and a few terminal commands!

You can find the full source of this recipe in [the redux examples folder](https://github.com/rackt/redux/tree/master/examples/todos-with-undo).


## Installing redux-undo

First of all, you need to run `npm install --save redux-undo`


## Making your reducer undoable

In the `combineReducers` function, you have to wrap the reducer (in this case, `todos`) with the `undoable` function, like this:

```js
// in reducers.js
import undoable, { distinctState } from 'redux-undo';

// ...

const todoApp = combineReducers({
  visibilityFilter,
  todos: undoable(todos, { filter: distinctState() })
});
```

The `distinctState()` filter makes sure not to store changes if the state didn't change. There are [many other options](https://github.com/omnidan/redux-undo#configuration) to configure your undoable reducer, like setting the action type for undo/redo actions.


## Updating your select function

Now the `todos` part of the state looks like this:

```js
{
  present: [...todos here...],
  history: {
    past: [],
    present: [...todos here...],
    future: []
  }
}
```

Which means you need to access your state with `state.todos.present` instead of just `state.todos` now:

```js
// in containers/App.js

function select(state) {
  return {
    visibleTodos: selectTodos(state.todos.present, state.visibilityFilter),
    visibilityFilter: state.visibilityFilter
  };
}
```

In order to disable the undo/redo buttons when they are not needed, you need to check if the `past`/`future` are empty:

```js
// in containers/App.js

function select(state) {
  return {
    visibleTodos: selectTodos(state.todos.present, state.visibilityFilter),
    visibilityFilter: state.visibilityFilter,
    undoDisabled: state.todos.history.past.length === 0,
    redoDisabled: state.todos.history.future.length === 0
  };
}
```


## Adding the buttons

Now all you need to do is add the buttons so the user can use the undo/redo functionality.

First of all, you create functions that dispatch the undo/redo actions and pass them to the `Footer` component:

```js
// in containers/App.js
import { ActionCreators } from 'redux-undo';

// ...

class App extends Component {
  render() {
    const { dispatch, visibleTodos, visibilityFilter } = this.props;
    return (
      <div>
        {/* ... */}
        <Footer
          filter={visibilityFilter}
          onFilterChange={nextFilter => dispatch(setVisibilityFilter(nextFilter))}
          onUndo={() => dispatch(ActionCreators.undo())}
          onRedo={() => dispatch(ActionCreators.redo())}
          undoDisabled={this.props.undoDisabled}
          redoDisabled={this.props.redoDisabled} />
      </div>
    );
  }
}
```

Now you can render the buttons in the component:

```js
// in components/Footer.js

export default class Footer extends Component {

  // ...

  renderUndo() {
    return (
      <p>
        <button onClick={this.props.onUndo} disabled={this.props.undoDisabled}>Undo</button>
        <button onClick={this.props.onRedo} disabled={this.props.redoDisabled}>Redo</button>
      </p>
    );
  }

  render() {
    return (
      <div>
        {this.renderFilters()}
        {this.renderUndo()}
      </div>
    );
  }
}
```

That's it! Run `npm start` and try it out!

[![demo of todos-with-undo](http://i.imgur.com/lvDFHkH.gif)](https://twitter.com/dan_abramov/status/647038407286390784)
