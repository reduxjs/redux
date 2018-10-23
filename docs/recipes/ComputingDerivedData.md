# Computing Derived Data

[Reselect](https://github.com/reduxjs/reselect) is a simple library for creating memoized, composable **selector** functions. Reselect selectors can be used to efficiently compute derived data from the Redux store.

### Motivation for Memoized Selectors

Let's revisit the [Todos List example](../basics/UsageWithReact.md):

#### `containers/VisibleTodoList.js`

```js
import { connect } from 'react-redux'
import { toggleTodo } from '../actions'
import TodoList from '../components/TodoList'

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed)
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed)
  }
}

const mapStateToProps = state => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onTodoClick: id => {
      dispatch(toggleTodo(id))
    }
  }
}

const VisibleTodoList = connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)

export default VisibleTodoList
```

In the above example, `mapStateToProps` calls `getVisibleTodos` to calculate `todos`. This works great, but there is a drawback: `todos` is calculated every time the component is updated. If the state tree is large, or the calculation expensive, repeating the calculation on every update may cause performance problems. Reselect can help to avoid these unnecessary recalculations.

### Creating a Memoized Selector

We would like to replace `getVisibleTodos` with a memoized selector that recalculates `todos` when the value of `state.todos` or `state.visibilityFilter` changes, but not when changes occur in other (unrelated) parts of the state tree.

Reselect provides a function `createSelector` for creating memoized selectors. `createSelector` takes an array of input-selectors and a transform function as its arguments. If the Redux state tree is changed in a way that causes the value of an input-selector to change, the selector will call its transform function with the values of the input-selectors as arguments and return the result. If the values of the input-selectors are the same as the previous call to the selector, it will return the previously computed value instead of calling the transform function.

Let's define a memoized selector named `getVisibleTodos` to replace the non-memoized version above:

#### `selectors/index.js`

```js
import { createSelector } from 'reselect'

const getVisibilityFilter = state => state.visibilityFilter
const getTodos = state => state.todos

export const getVisibleTodos = createSelector(
  [getVisibilityFilter, getTodos],
  (visibilityFilter, todos) => {
    switch (visibilityFilter) {
      case 'SHOW_ALL':
        return todos
      case 'SHOW_COMPLETED':
        return todos.filter(t => t.completed)
      case 'SHOW_ACTIVE':
        return todos.filter(t => !t.completed)
    }
  }
)
```

In the example above, `getVisibilityFilter` and `getTodos` are input-selectors. They are created as ordinary non-memoized selector functions because they do not transform the data they select. `getVisibleTodos` on the other hand is a memoized selector. It takes `getVisibilityFilter` and `getTodos` as input-selectors, and a transform function that calculates the filtered todos list.

### Composing Selectors

A memoized selector can itself be an input-selector to another memoized selector. Here is `getVisibleTodos` being used as an input-selector to a selector that further filters the todos by keyword:

```js
const getKeyword = state => state.keyword

const getVisibleTodosFilteredByKeyword = createSelector(
  [getVisibleTodos, getKeyword],
  (visibleTodos, keyword) =>
    visibleTodos.filter(todo => todo.text.indexOf(keyword) > -1)
)
```

### Connecting a Selector to the Redux Store

If you are using [React Redux](https://github.com/reduxjs/react-redux), you can call selectors as regular functions inside `mapStateToProps()`:

#### `containers/VisibleTodoList.js`

```js
import { connect } from 'react-redux'
import { toggleTodo } from '../actions'
import TodoList from '../components/TodoList'
import { getVisibleTodos } from '../selectors'

const mapStateToProps = state => {
  return {
    todos: getVisibleTodos(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onTodoClick: id => {
      dispatch(toggleTodo(id))
    }
  }
}

const VisibleTodoList = connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)

export default VisibleTodoList
```

### Accessing React Props in Selectors

So far we have only seen selectors receive the Redux store state as an argument, but a selector can receive props too.

For this example, we're going to extend our app to handle multiple Todo lists. Our state needs to be refactored so that it holds multiple todo lists, which each have their own `todos` and `visibilityFilter` state.

We also need to refactor our reducers. Now that `todos` and `visibilityFilter` live within every list's state, we only need one `todoLists` reducer to manage our state.

#### `reducers/index.js`

```js
import { combineReducers } from 'redux'
import todoLists from './todoLists'

export default combineReducers({
  todoLists
})
```

#### `reducers/todoLists.js`

```js
// Note that we're hard coding three lists here just as an example.
// In the real world, we'd have a feature to add/remove lists,
// and this would be empty initially.
const initialState = {
  1: {
    todos: [],
    visibilityFilter: 'SHOW_ALL'
  },
  2: {
    todos: [],
    visibilityFilter: 'SHOW_ALL'
  },
  3: {
    todos: [],
    visibilityFilter: 'SHOW_ALL'
  }
}

const addTodo = (state, action) => {
  const todoList = state[action.listId]
  const { todos } = todoList

  return {
    ...state,
    [action.listId]: {
      ...todoList,
      todos: [
        ...todos,
        {
          id: action.id,
          text: action.text,
          completed: false
        }
      ]
    }
  }
}

const toggleTodo = (state, action) => {
  const todoList = state[action.listId]
  const { todos } = todoList

  return {
    ...state,
    [action.listId]: {
      ...todoList,
      todos: todos.map(todo =>
        (todo.id === action.id)
          ? {...todo, completed: !todo.completed}
          : todo
      )
    }
  }
}

const setVisibilityFilter = (state, action) => {
  const todoList = state[action.listId]
  return {
    ...state,
    [action.listId]: {
      ...todoList,
      visibilityFilter: action.filter
    }
  }
}

export default const todoLists = (state = initialState, action) => {
  // make sure a list with the given id exists
  if (!state[action.listId]) {
    return state;
  }

  switch (action.type) {
    case 'ADD_TODO':
      return addTodo(state, action)

    case 'TOGGLE_TODO':
      return toggleTodo(state, action)

    case 'SET_VISIBILITY_FILTER':
      return setVisibilityFilter(state, action)

    default:
      return state
  }
}
```

The `todoLists` reducer now handles all three actions. The action creators will now need to be passed a `listId`:

#### `actions/index.js`

```js
let nextTodoId = 0
export const addTodo = (text, listId) => ({
  type: 'ADD_TODO',
  id: nextTodoId++,
  text,
  listId
})
export const setVisibilityFilter = (filter, listId) => ({
  type: 'SET_VISIBILITY_FILTER',
  filter,
  listId
})
export const toggleTodo = (id, listId) => ({
  type: 'TOGGLE_TODO',
  id,
  listId
})
export const VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
}
```

#### `components/TodoList.js`

```js
import React from 'react'
import PropTypes from 'prop-types'
import Todo from './Todo'
const TodoList = ({ todos, toggleTodo, listId }) => (
  <ul>
    {todos.map(todo => (
      <Todo
        key={todo.id}
        {...todo}
        onClick={() => toggleTodo(todo.id, listId)}
      />
    ))}
  </ul>
)

export default TodoList
```

Here is an `App` component that renders three `VisibleTodoList` components, each of which has a `listId` prop:

#### `components/App.js`

```js
import React from 'react'
import VisibleTodoList from '../containers/VisibleTodoList'

const App = () => (
  <div>
    <VisibleTodoList listId="1" />
    <VisibleTodoList listId="2" />
    <VisibleTodoList listId="3" />
  </div>
)
```

Each `VisibleTodoList` container should select a different slice of the state depending on the value of the `listId` prop, so we'll modify `getVisibilityFilter` and `getTodos` to accept a props argument.

#### `selectors/todoSelectors.js`

```js
import { createSelector } from 'reselect'

const getVisibilityFilter = (state, props) =>
  state.todoLists[props.listId].visibilityFilter

const getTodos = (state, props) => state.todoLists[props.listId].todos

const getVisibleTodos = createSelector(
  [getVisibilityFilter, getTodos],
  (visibilityFilter, todos) => {
    switch (visibilityFilter) {
      case 'SHOW_COMPLETED':
        return todos.filter(todo => todo.completed)
      case 'SHOW_ACTIVE':
        return todos.filter(todo => !todo.completed)
      default:
        return todos
    }
  }
)

export default getVisibleTodos
```

`props` can be passed to `getVisibleTodos` from `mapStateToProps`:

```js
const mapStateToProps = (state, props) => {
  return {
    todos: getVisibleTodos(state, props)
  }
}
```

So now `getVisibleTodos` has access to `props`, and everything seems to be working fine.

**But there is a problem!**

Using the `getVisibleTodos` selector with multiple instances of the `visibleTodoList` container will not correctly memoize:

#### `containers/VisibleTodoList.js`

```js
import { connect } from 'react-redux'
import { toggleTodo } from '../actions'
import TodoList from '../components/TodoList'
import { getVisibleTodos } from '../selectors'

const mapStateToProps = (state, props) => {
  return {
    // WARNING: THE FOLLOWING SELECTOR DOES NOT CORRECTLY MEMOIZE
    todos: getVisibleTodos(state, props)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onTodoClick: id => {
      dispatch(toggleTodo(id))
    }
  }
}

const VisibleTodoList = connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)

export default VisibleTodoList
```

A selector created with `createSelector` only returns the cached value when its set of arguments is the same as its previous set of arguments. If we alternate between rendering `<VisibleTodoList listId="1" />` and `<VisibleTodoList listId="2" />`, the shared selector will alternate between receiving `{listId: 1}` and `{listId: 2}` as its `props` argument. This will cause the arguments to be different on each call, so the selector will always recompute instead of returning the cached value. We'll see how to overcome this limitation in the next section.

### Sharing Selectors Across Multiple Components

> The examples in this section require React Redux v4.3.0 or greater

In order to share a selector across multiple `VisibleTodoList` components **and** retain memoization, each instance of the component needs its own private copy of the selector.

Let's create a function named `makeGetVisibleTodos` that returns a new copy of the `getVisibleTodos` selector each time it is called:

#### `selectors/todoSelectors.js`

```js
import { createSelector } from 'reselect'

const getVisibilityFilter = (state, props) =>
  state.todoLists[props.listId].visibilityFilter

const getTodos = (state, props) => state.todoLists[props.listId].todos

const makeGetVisibleTodos = () => {
  return createSelector(
    [getVisibilityFilter, getTodos],
    (visibilityFilter, todos) => {
      switch (visibilityFilter) {
        case 'SHOW_COMPLETED':
          return todos.filter(todo => todo.completed)
        case 'SHOW_ACTIVE':
          return todos.filter(todo => !todo.completed)
        default:
          return todos
      }
    }
  )
}

export default makeGetVisibleTodos
```

We also need a way to give each instance of a container access to its own private selector. The `mapStateToProps` argument of `connect` can help with this.

**If the `mapStateToProps` argument supplied to `connect` returns a function instead of an object, it will be used to create an individual `mapStateToProps` function for each instance of the container.**

In the example below `makeMapStateToProps` creates a new `getVisibleTodos` selector, and returns a `mapStateToProps` function that has exclusive access to the new selector:

```js
const makeMapStateToProps = () => {
  const getVisibleTodos = makeGetVisibleTodos()
  const mapStateToProps = (state, props) => {
    return {
      todos: getVisibleTodos(state, props)
    }
  }
  return mapStateToProps
}
```

If we pass `makeMapStateToProps` to `connect`, each instance of the `VisibleTodosList` container will get its own `mapStateToProps` function with a private `getVisibleTodos` selector. Memoization will now work correctly regardless of the render order of the `VisibleTodoList` containers.

#### `containers/VisibleTodoList.js`

```js
import { connect } from 'react-redux'
import { toggleTodo } from '../actions'
import TodoList from '../components/TodoList'
import { makeGetVisibleTodos } from '../selectors'

const makeMapStateToProps = () => {
  const getVisibleTodos = makeGetVisibleTodos()
  const mapStateToProps = (state, props) => {
    return {
      todos: getVisibleTodos(state, props)
    }
  }
  return mapStateToProps
}

const mapDispatchToProps = dispatch => {
  return {
    onTodoClick: id => {
      dispatch(toggleTodo(id))
    }
  }
}

const VisibleTodoList = connect(
  makeMapStateToProps,
  mapDispatchToProps
)(TodoList)

export default VisibleTodoList
```

## Next Steps

Check out the [official documentation](https://github.com/reduxjs/reselect) of Reselect as well as its [FAQ](https://github.com/reduxjs/reselect#faq). Most Redux projects start using Reselect when they have performance problems because of too many derived computations and wasted re-renders, so make sure you are familiar with it before you build something big. It can also be useful to study [its source code](https://github.com/reduxjs/reselect/blob/master/src/index.js) so you don't think it's magic.
