# API Reference

The Redux API surface is tiny. Redux defines a set of contracts for you to implement \(such as [reducers](../glossary.md#reducer)\) and provides a few helper functions to tie these contracts together.

This section documents the complete Redux API. Keep in mind that Redux is only concerned with managing the state. In a real app, you'll also want to use UI bindings like [react-redux](https://github.com/gaearon/react-redux).

## Top-Level Exports

* [createStore\(reducer, \[preloadedState\], \[enhancer\]\)](createstore.md)
* [combineReducers\(reducers\)](combinereducers.md)
* [applyMiddleware\(...middlewares\)](applymiddleware.md)
* [bindActionCreators\(actionCreators, dispatch\)](bindactioncreators.md)
* [compose\(...functions\)](compose.md)

## Store API

* [Store](store.md)
  * [getState\(\)](store.md#getState)
  * [dispatch\(action\)](store.md#dispatch)
  * [subscribe\(listener\)](store.md#subscribe)
  * [replaceReducer\(nextReducer\)](store.md#replaceReducer)

## Importing

Every function described above is a top-level export. You can import any of them like this:

### ES6

```javascript
import { createStore } from 'redux'
```

### ES5 \(CommonJS\)

```javascript
var createStore = require('redux').createStore
```

### ES5 \(UMD build\)

```javascript
var createStore = Redux.createStore
```

