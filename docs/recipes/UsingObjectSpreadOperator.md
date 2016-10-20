# Using Object Spread Operator

Since one of the core tenets of Redux is to never mutate state, you'll often find yourself using [`Object.assign()`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) to create
copies of objects with new or updated values. For example, in the `todoApp` below `Object.assign()` is used to return a new
`state` object with an updated `visibilityFilter` property:

```js
function todoApp(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return Object.assign({}, state, {
        visibilityFilter: action.filter
      })
    default:
      return state
  }
}
```

While effective, using `Object.assign()` can quickly make simple reducers difficult to read given its rather verbose syntax.

An alternative approach is to use the [object spread syntax](https://github.com/sebmarkbage/ecmascript-rest-spread) proposed for the next versions of JavaScript which lets you use the spread (`...`) operator to copy enumerable properties from one object to another in a more succinct way. The object spread operator is conceptually similar to the ES6 [array spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator). We
can simplify the `todoApp` example above by using the object spread syntax:

```js
function todoApp(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return { ...state, visibilityFilter: action.filter }
    default:
      return state
  }
}
```

The advantage of using the object spread syntax becomes more apparent when you're composing complex objects. Below `getAddedIds` maps an array of `id` values to an array of objects with values returned from `getProduct` and `getQuantity`.

```js
return getAddedIds(state.cart).map(id => Object.assign(
  {},
  getProduct(state.products, id),
  {
    quantity: getQuantity(state.cart, id)
  }
))
```

Object spread lets us simplify the above `map` call to:

```js
return getAddedIds(state.cart).map(id => ({
  ...getProduct(state.products, id),
  quantity: getQuantity(state.cart, id)
}))
```

Since the object spread syntax is still a Stage 3 proposal for ECMAScript you'll need to use a transpiler such as [Babel](http://babeljs.io/) to use it in production. You can use your existing `es2015` preset, install [`babel-plugin-transform-object-rest-spread`](http://babeljs.io/docs/plugins/transform-object-rest-spread/) and add it individually to the `plugins` array in your `.babelrc`.

```js
{
  "presets": ["es2015"],
  "plugins": ["transform-object-rest-spread"]
}
```

Note that this is still an experimental language feature proposal so it may change in the future. Nevertheless some large projects such as [React Native](https://github.com/facebook/react-native) already use it extensively so it is safe to say that there will be a good automated migration path if it changes.
