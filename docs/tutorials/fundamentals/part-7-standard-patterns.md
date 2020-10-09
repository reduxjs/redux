---
id: part-7-standard-patterns
title: 'Redux Fundamentals, Part 7: Standard Redux Patterns'
sidebar_label: 'Standard Redux Patterns'
hide_title: true
description: 'The official Fundamentals tutorial for Redux: learn the fundamentals of using Redux'
---

# Redux Fundamentals, Part 7: Standard Redux Patterns

**FIXME** Write this

#### Action Creators

An **action creator** is a function that creates and returns an action object. We typically use these so we don't have to write the action object by hand every time:

```js
const addTodo = text => {
  return {
    type: 'todos/todoAdded',
    payload: text
  }
}
```

We typically call action creators to dispatch the right action:

```js
const incremented = () => {
  return {
    type: 'counter/incremented'
  }
}

store.dispatch(incremented())

console.log(store.getState())
// {value: 2}
```
