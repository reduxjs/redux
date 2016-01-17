# Usage with React

From the very beginning, we need to stress that Redux has no relation to React. You can write Redux apps with React, Angular, Ember, jQuery, or vanilla JavaScript.

That said, Redux works especially well with frameworks like [React](http://facebook.github.io/react/) and [Deku](https://github.com/dekujs/deku) because they let you describe UI as a function of state, and Redux emits state updates in response to actions.

We will use React to build our simple todo app.

## Installing React Redux

[React bindings](https://github.com/gaearon/react-redux) are not included in Redux by default. You need to install them explicitly:

```
npm install --save react-redux
```

## Container and Presentational Components

React bindings for Redux embrace the idea of [separating container and presentational components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0).

This table describes the characteristics of container and presentational components.

<table>
    <thead>
        <tr>
            <th></th>
            <th scope="col" style="text-align:left">Container Components</th>
            <th scope="col" style="text-align:left">Presentational Components</th>
        </tr>
    </thead>
    <tbody>
        <tr>
          <th scope="row" style="text-align:right">Location</th>
          <td>Top level, route handlers</td>
          <td>Middle and leaf components</td>
        </tr>
        <tr>
          <th scope="row" style="text-align:right">Aware of Redux</th>
          <td>Yes</th>
          <td>No</th>
        </tr>
        <tr>
          <th scope="row" style="text-align:right">To read data</th>
          <td>Subscribe to Redux state</td>
          <td>Read data from props</td>
        </tr>
        <tr>
          <th scope="row" style="text-align:right">To change data</th>
          <td>Dispatch Redux actions</td>
          <td>Invoke callbacks from props</td>
        </tr>
    </tbody>
</table>

We suggest that you do not nest container components beyond necessity. Start by having a few top-level container components pass the props down to the presentational component tree. When you notice that components in the middle of that tree pass too many props down without actually using them, it is a good time to introduce some containers.

## Designing Component Hierarchy

Remember how we [designed the shape of the root state object](Reducers.md)? It’s time we design the UI hierarchy to match it. This is not a Redux-specific task. [Thinking in React](https://facebook.github.io/react/docs/thinking-in-react.html) is a great tutorial that explains the process.

Our design brief is simple. We want to show a list of todo items. On click, a todo item is crossed out as completed. We want to show a field where the user may add a new todo. In the footer, we want to show a toggle to show all / only completed / only active todos.

I see the following components and their props emerge from this brief:

* **`TodoList`** is a list showing visible todos.
  - `todos: Array` is an array of todo items with `{ text, completed }` shape.
  - `onTodoClick(index: number)` is a callback to invoke when a todo is clicked.
* **`Todo`** is a single todo item.
  - `text: string` is the text to show.
  - `completed: boolean` is whether todo should appear crossed out.
  - `onClick()` is a callback to invoke when a todo is clicked.
* **`Footer`** is a component where we let user change visible todo filter.
  - `filter: string` is the current filter: `'SHOW_ALL'`, `'SHOW_COMPLETED'` or `'SHOW_ACTIVE'`.
  - `onFilterChange(nextFilter: string)`: Callback to invoke when user chooses a different filter.
* **`Link`** is a link with a callback.
  - `onClick()` is a callback to invoke when link is clicked.

These are all presentational components. They don’t know *where* the data comes from, or *how* to change it. They only render what’s given to them.

If you migrate from Redux to something else, you’ll be able to keep all these components exactly the same. They have no dependency on Redux.

We also have some container components that connect to Redux. Container components calculate the props to pass to the presentational components they wrap based on the current state of the Redux store.

* **`AddTodo`** is an input field with a button.
  - `onAddClick(text: string)` is a callback to invoke when a button is pressed.

* **`FilterLink`** gets the current visibility filter and passes it as a prop to `Link` component.

* **`VisibleTodoList`** gets todos from Redux, filters the todos and passes them as props to the presentational component, TodoList.

Let’s write the components! We begin with the presentational components, so we don’t need to think about binding to Redux yet.

### Presentational Components

These are all normal React components, so we'll not stop and examine them in detail. We write functional stateless components unless we need to use either React state or the React life-cycle functions.

#### `components/Todo.js`

```js
import React from "react";

const Todo = ({ onClick, completed, text }) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? "line-through" : "none"
    }}
  >
    {text}
  </li>
);

export default Todo
```

#### `components/TodoList.js`

```js
import React from "react";
import Todo from "./Todo";

const TodoList = ({ todos, onTodoClick }) => (
  <ul>
    {todos.map(todo =>
      <Todo
        key={todo.id}
        {...todo}
        onClick={() => onTodoClick(todo.id)}
      />
    )}
  </ul>
);

export default TodoList
```

#### `components/Footer.js`

```js
import React from "react";
import FilterLink from "./FilterLink";

const Footer = () => (
  <p>
    Show:
    {" "}
    <FilterLink filter="SHOW_ALL">
      All
    </FilterLink>
    {", "}
    <FilterLink filter="SHOW_ACTIVE">
      Active
    </FilterLink>
    {", "}
    <FilterLink filter="SHOW_COMPLETED">
      Completed
    </FilterLink>
  </p>
);

export default Footer
```

#### `components/Link.js`
```js
import React from "react";

const Link = ({ active, children, onClick }) => {
  if (active) {
    return <span>{children}</span>;
  }

  return (
    <a href="#"
       onClick={e => {
         e.preventDefault();
         onClick();
       }}
    >
      {children}
    </a>
  );
};

export default Link
```

### Container Components

We will now write the container components. Container components use connect() to retrieve data from Redux state.

#### `containers/AddTodo.js`

```js
import React from "react";
import { connect } from "react-redux";
import { addTodo } from "../actions";

let AddTodo = ({ dispatch }) => {
  let input;

  return (
    <div>
      <input ref={node => {
        input = node;
      }} />
      <button onClick={() => {
        dispatch(addTodo(input.value));
        input.value = "";
      }}>
        Add Todo
      </button>
    </div>
  );
};
AddTodo = connect()(AddTodo);

export default AddTodo
```

#### `containers/FilterLink.js`

```js
import React from "react";
import { connect } from "react-redux";
import { setVisibilityFilter } from "../actions";
import Link from "../components/Link";

const mapStateToProps = (state, ownProps) => {
  return { active: ownProps.filter === state.visibilityFilter };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return { onClick: () => { dispatch(setVisibilityFilter(ownProps.filter)); }};
}

const FilterLink = connect(mapStateToProps, mapDispatchToProps)(Link);

export default FilterLink
```

#### `containers/VisibleTodoList.js`

```js
import React from "react";
import { connect } from "react-redux";
import { toggleTodo } from "../actions";
import TodoList from "../components/TodoList";

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case "SHOW_ALL":
      return todos;
    case "SHOW_COMPLETED":
      return todos.filter(
        t => t.completed
      );
    case "SHOW_ACTIVE":
      return todos.filter(
        t => !t.completed
      );
  }
}

const mapStateToProps = (
  state
) => {
  return {
    todos: getVisibleTodos(
      state.todos,
      state.visibilityFilter
    )
  };
};

const mapDispatchToProps = (dispatch) => {
  return { onTodoClick: (id) => { dispatch(toggleTodo(id)); }};
};

const VisibleTodoList = connect(mapStateToProps, mapDispatchToProps)(TodoList);

export default VisibleTodoList
```

Then we’ll write the `TodoApp` component that renders these components together.

#### `components/TodoApp.js`

```js
import React from "react";
import AddTodo from "../containers/AddTodo";
import Footer from "./Footer";
import VisibleTodoList from "../containers/VisibleTodoList";

const TodoApp = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
);

export default TodoApp
```

This is what I see when I render `<TodoApp />`:

<img src='http://i.imgur.com/lj4QTfD.png' width='40%'>

By itself, it’s not very interesting. Let’s connect it to Redux!

## Connecting to Redux

We need to make two changes to connect our `TodoApp` component to Redux and make it dispatch actions and read state from the Redux store.

First, we need to import `Provider` from [`react-redux`](http://github.com/gaearon/react-redux), which we installed earlier, and **wrap the root component in `<Provider>`** before rendering.

#### `index.js`

```js
import "babel-core/polyfill";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { todoStore } from "./store";
import TodoApp from "./components/TodoApp";

render(
  <Provider store={todoStore}>
    <TodoApp />
  </Provider>,
  document.getElementById("app")
);
```

This makes our store instance available to the components below. (Internally, this is done via React’s [“context” feature](http://facebook.github.io/react/docs/context.html).)

Then, we **wrap the components we want to connect to Redux with the `connect()` function from [`react-redux`](http://github.com/gaearon/react-redux)**. Try to only do this for a top-level component, or route handlers. While technically you can `connect()` any component in your app to Redux store, avoid doing this too deeply, because it will make the data flow harder to trace.

**Any component wrapped with `connect()` call will receive a [`dispatch`](../api/Store.md#dispatch) function as a prop, and any state it needs from the global state.** In most cases you will only pass the first argument to `connect()`, which is a function we call a **selector**. This function takes the global Redux store’s state, and returns the props you need for the component. In the simplest case, you can just return the `state` given to you (i.e. pass identity function), but you may also wish to transform it first.

To make performant memorized transformations with composing selectors, check out [reselect](https://github.com/faassen/reselect). In this example, we won’t use it, but it works great for larger apps.

## Next Steps

Read the [complete source code for this tutorial](ExampleTodoList.md) to better internalize the knowledge you have gained. Then, head straight to the [advanced tutorial](../advanced/README.md) to learn how to handle network requests and routing!
