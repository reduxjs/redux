# Implementing Undo History

First of all, we need to think about how to store the history. We can inspire
ourselves by the Elm Architecture and look at the [elm-undo-redo implementation](http://package.elm-lang.org/packages/TheSeamau5/elm-undo-redo/2.0.0).

That doesn't seem too hard to do in Redux, we can just set our state to:

```js
{
  past: [...past states...],
  present: present_state,
  future: [...future states...]
}
```

Then, we can simply define actions like `UNDO_ACTION` and `REDO_ACTIONS`. Now we
need to make reducers that handle these actions:

 * `undo` reducer logic
  * remove the *last* element from `past`
  * set `present` to the element we removed in the previous step
  * insert the old `present` state at the *beginning* of the `future` array

 * `redo` reducer logic (like `undo`, but the other way around)
  * remove the *first* element from `future`
  * set `present` to the element we removed in the previous step
  * insert the old `present` state at the *end* of the `past` array

Of course we also need a way to insert new state. We will handle the other
actions as usual and then call an `insert` function:

 * `insert` logic
  * insert the new state at the end of `past`
  * set `present` to the new state
  * clear the `future`

That's all we need for adding undo/redo functionality to our app, but it's
still a lot of work to do this for each part of the state. We can create a
function that creates and returns a reducer, like this:

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

Such a function is called a *higher-order/enhanced reducer*, because it takes an
existing reducer, *enhances* it with undo/redo functionality and then returns a
new reducer. This doesn't just work for undo/redo, you could enhance your
reducers with anything.

Fortunately, you won't have to implement all that, because there's already a
library that does exactly this.


## Introducing redux-undo

[redux-undo](https://github.com/omnidan/redux-undo) is a library that provides
simple undo/redo functionality for any part of your redux tree.

In this recipe, you will learn how to make the [Todo List example](http://rackt.github.io/redux/docs/basics/ExampleTodoList.html)
undoable - all it takes are [two lines of code](https://twitter.com/dan_abramov/status/647040825826918400)
and a few terminal commands!

You can find the full source of this recipe in [the redux examples folder](https://github.com/rackt/redux/tree/master/examples/todos-with-undo).


## Installing redux-undo

First of all, you need to run `npm install --save redux-undo`


## Making your reducer undoable

In the `combineReducers` function, you have to wrap the reducer (in this case,
`todos`) with the `undoable` function, like this:

```js
// in reducers.js
import undoable, { distinctState } from 'redux-undo';

// ...

const todoApp = combineReducers({
  visibilityFilter,
  todos: undoable(todos, { filter: distinctState() })
});
```

The `distinctState()` filter makes sure not to store changes if the state didn't
change. There are [many other options](https://github.com/omnidan/redux-undo#configuration)
to configure your undoable reducer, like setting the action type for undo/redo
actions.


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

Which means you need to access your state with `state.todos.present` instead of
just `state.todos` now:

```js
// in containers/App.js

function select(state) {
  return {
    visibleTodos: selectTodos(state.todos.present, state.visibilityFilter),
    visibilityFilter: state.visibilityFilter
  };
}
```

In order to disable the undo/redo buttons when they are not needed, you need to
check if the `past`/`future` are empty:

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

Now all you need to do is add the buttons so the user can use the undo/redo
functionality.

First of all, you create functions that dispatch the undo/redo actions and pass
them to the `Footer` component:

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
