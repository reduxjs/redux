---
id: bindactioncreators
title: bindActionCreators
hide_title: true
description: 'API > bindActionCreators: wrapping action creators for dispatching'
---

&nbsp;

# `bindActionCreators(actionCreators, dispatch)`

## Overview

Turns an object whose values are [action creators](../understanding/thinking-in-redux/Glossary.md#action-creator), into an object with the same keys, but with every action creator wrapped into a [`dispatch`](Store.md#dispatchaction) call so they may be invoked directly.

:::info

Normally you should just call [`dispatch`](Store.md#dispatchaction) directly. If you use Redux with React, [React-Redux's `useDispatch` hook](https://react-redux.js.org/api/hooks#usedispatch) gives you the `dispatch` function inside components.

The only use case for `bindActionCreators` is when you want to pass some action creators down to a component that isn't aware of Redux, and you don't want to pass `dispatch` or the Redux store to it. It was originally intended for use with the legacy React-Redux `connect` method, and is rarely needed today.

:::

For convenience, you can also pass an action creator as the first argument, and get a dispatch wrapped function in return.

## Parameters

1. `actionCreators` (_Function_ or _Object_): An [action creator](../understanding/thinking-in-redux/Glossary.md#action-creator), or an object whose values are action creators.

2. `dispatch` (_Function_): A [`dispatch`](Store.md#dispatchaction) function available on the [`Store`](Store.md) instance.

### Returns

(_Function_ or _Object_): An object mimicking the original object, but with each function immediately dispatching the action returned by the corresponding action creator. If you passed a function as `actionCreators`, the return value will also be a single function.

## Example

#### `TodoActionCreators.js`

```js
export function addTodo(text) {
  return {
    type: 'ADD_TODO',
    text
  }
}

export function removeTodo(id) {
  return {
    type: 'REMOVE_TODO',
    id
  }
}
```

#### `SomeComponent.js`

```js
import { useEffect, useMemo } from 'react'
import { bindActionCreators } from 'redux'
import { useDispatch, useSelector } from 'react-redux'

import * as TodoActionCreators from './TodoActionCreators'
console.log(TodoActionCreators)
// {
//   addTodo: Function,
//   removeTodo: Function
// }

export function TodoListContainer() {
  const dispatch = useDispatch()
  const todos = useSelector(state => state.todos)

  // Here's a good use case for bindActionCreators:
  // You want a child component to be completely unaware of Redux.
  // We create bound versions of these functions now so we can
  // pass them down to our child later.

  const boundActionCreators = useMemo(
    () => bindActionCreators(TodoActionCreators, dispatch),
    [dispatch]
  )
  console.log(boundActionCreators)
  // {
  //   addTodo: Function,
  //   removeTodo: Function
  // }

  useEffect(() => {
    // Note: this won't work:
    // TodoActionCreators.addTodo('Use Redux')

    // You're just calling a function that creates an action.
    // You must dispatch the action, too!

    // This will work:
    let action = TodoActionCreators.addTodo('Use Redux')
    dispatch(action)
  }, [dispatch])

  return <TodoList todos={todos} {...boundActionCreators} />

  // An alternative to bindActionCreators is to pass
  // just the dispatch function down, but then your child component
  // needs to import action creators and know about them.

  // return <TodoList todos={todos} dispatch={dispatch} />
}
```
