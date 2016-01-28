# Computing Derived Data

[Reselect](https://github.com/faassen/reselect.git) is a simple library for creating memoized, composable **selector** functions. Reselect selectors can be used to efficiently compute derived data from the Redux store. 

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

const mapStateToProps = (state) => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onTodoClick: (id) => {
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

Reselect provides a function `createSelector` for creating memoized selectors. `createSelector` takes an array of input-selectors and a transform function as its arguments. If the Redux state tree is mutated in a way that causes the value of an input-selector to change, the selector will call its transform function with the values of the input-selectors as arguments and return the result. If the values of the input-selectors are the same as the previous call to the selector, it will return the previously computed value instead of calling the transform function.

Let's define a memoized selector named `visibleTodosSelector` to replace `getVisibleTodos`:

#### `selectors/todoSelectors.js`

```js
import { createSelector } from 'reselect'

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

const visibilityFilterSelector = (state) => state.visibilityFilter
const todosSelector = (state) => state.todos

export const visibleTodosSelector = createSelector(
  [ visibilityFilterSelector, todosSelector ],
  (visibilityFilter, todos) => {
    return {
      visibleTodos: getVisibleTodos(todos, visibilityFilter),
      visibilityFilter
    }
  }
)
```

In the example above, `visibilityFilterSelector` and `todosSelector` are input-selectors. They are created as ordinary non-memoized selector functions because they do not transform the data they select. `visibleTodosSelector` on the other hand is a memoized selector. It takes `visibilityFilterSelector` and `todosSelector` as input-selectors, and a transform function that calculates the filtered todos list.

### Composing Selectors

A memoized selector can itself be an input-selector to another memoized selector. Here is `visibleTodosSelector` being used as an input-selector to a selector that further filters the todos by keyword:

```js
const keywordSelector = (state) => state.keyword

const keywordFilterSelector = createSelector(
  [ visibleTodosSelector, keywordSelector ],
  (visibleTodos, keyword) => visibleTodos.filter(
    todo => todo.indexOf(keyword) > -1
  )
)
```

### Connecting a Selector to the Redux Store

If you are using react-redux, you connect a memoized selector to the Redux store using `connect`:

#### `containers/VisibleTodoList.js`

```js
import { connect } from 'react-redux'
import { toggleTodo } from '../actions'
import TodoList from '../components/TodoList'
import { visibleTodosSelector } from '../selectors/todoSelectors'

const mapStateToProps = (state) => {
  return {
    todos: visibleTodosSelector.visibleTodos
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onTodoClick: (id) => {
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

