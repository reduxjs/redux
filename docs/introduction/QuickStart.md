---
id: quick-start
title: Quick Start
sidebar_label: Quick Start
hide_title: true
---

# Quick Start

To bootstrap your next Redux project, here are some minimal examples to get you started (_copy -> paste -> tweak_).

## Installation

All of our examples will be using the official Redux package and the **[Redux Toolkit](https://redux-toolkit.js.org/)** addon package, so let's go ahead and install those.

```bash
# NPM
npm install --save redux @reduxjs/toolkit

# Yarn
yarn add redux @reduxjs/toolkit
```

## The Redux Code

Let's say we're building a _simple_ calculator. The calculator will be able to add or subtract numbers based on the user's input.

First off, let's start by creating the actions necessary for this calculator to work. We'll need to be able to add and substract a value.

### The Actions

```js
const add = createAction('ADD')
const substract = createAction('SUBSTRACT')
```

Here we're using Redux Toolkit's `createAction` to create the necessary actions we'll be using for the app.

Cool, now let's move onto the reducer.

### The Reducer

```js
const calculator = createReducer(0, {
  [add]: (state, action) => state + action.payload,
  [subtract]: (state, action) => state - action.payload
})
```

At first glance this may be a little strange to look at, but let's unpack it:

- The first argument passed into `createReducer` is the initial state, which we'll start at `0`.
- The second argument defines a "lookup table" object, where the key is the action type and the value is the reducer function associated with the action.
- In case you aren't familiar with the weird `[add]` syntax, it is known as the [ES6 object "computed property" syntax](https://javascript.info/object#computed-properties). This allows us to create keys from actions made with `createAction` with ease (since the computed properties ultimately calls `toString()` on those variables, which `createAction` objects overrides with the value of its type property).

The reducers' implementations should be fairly straightforward, simply adding or subtracting the action payload.

### The Slice

Now this may leave you wondering "gee, why do I need to define action creators outside of the reducer? What if there was a way to bake action creators into the reducer itself?"

Well, that's where `createSlice` from Redux Toolkit comes in :)

```js
// before
const add = createAction('ADD')
const substract = createAction('SUBSTRACT')

const calculator = createReducer(0, {
  [add]: (state, action) => state + action.payload,
  [subtract]: (state, action) => state - action.payload
})

// after
const calculatorSlice = createSlice({
  name: 'calculator',
  initialState: 0,
  reducers: {
    add: (state, action) => state + action.payload,
    subtract: (state, action) => state - action.payload
  }
})
```

Now the `add` and `subtract` actions will be available via `calculatorSlice.actions` and the reducer function will be available via `calculatorSlice.reducer`. This keeps our "slice" of the store all in one place, so that we'll know where all of the logic for this part of the store resides.

Awesome, let's move onto setting up the store.

### The Store

```js
const store = configureStore({
  reducer: calculatorSlice.reducer
})
```

Using Redux Toolkit's `configureStore`, we can setup the store with helpful default middleware out of the box. Unfortunately, this example won't be able to highlight this middleware, but be sure to check out the [included default middleware](https://redux-starter-kit.js.org/api/getDefaultMiddleware#included-default-middleware) to learn more about them.

To Recap, here's the full code that we've written so far:

```js
const calculatorSlice = createSlice({
  name: 'calculator',
  initialState: 0,
  reducers: {
    add: (state, action) => state + action.payload,
    subtract: (state, action) => state - action.payload
  }
})

const store = configureStore({
  reducer: calculatorSlice.reducer
})
```

Not too bad :)

## Vanilla Example

Great! Now that we have the redux portion of the code done, let's move onto creating an application that can utilize it.

```js
const valueEl = document.getElementById('value')

const render = function() {
  valueEl.innerHTML = store.getState().toString()
}

// we'll need to render it once to populate the value element with some data
render()

// Setup the subscription to the value element
store.subscribe(render)

// let's destructure the actions from the calculator slice
const { add, subtract } = calculatorSlice.actions

// Setup event listeners for the buttons
document.getElementById('add').addEventListener('click', function() {
  const value = document.getElementById('input').value
  store.dispatch(add(value))
})

document.getElementById('subtract').addEventListener('click', function() {
  const value = document.getElementById('input').value
  store.dispatch(subtract(value))
})
```

alright, now we have a simple app setup that utilizes our Redux code to have a functioning calculator app. it will now dispatch actions to update the value in the store,
depending on which button was clicked.

## React Example

Now let's take a look at the same code, but built in React. We'll need to use the `react-redux` package for the official React bindings of the Redux store.

We'll also be using the new React Redux hooks API, so be sure to check that out if you haven't already.

```jsx
const Value = function() {
  const value = useSelector(state => state)

  return <span>{value}</span>
}

const Button = function(props) {
  const { action, children } = props
  const dispatch = useDispatch()

  return <button onClick={() => dispatch(action)}>{children}</button>
}

const App = function() {
  const [input, setInput] = useState(0)

  const handleChange = function(e) {
    const { value } = e.target
    setInput(Number(value))
  }

  return (
    <Provider store={store}>
      The value is <Value />
      <input onChange={handleChange} />
      <Button action={add(input)}>Add Amount</Button>
      <Button action={subtract(input)}>Subtract Amount</Button>
    </Provider>
  )
}

render(<App />, document.getElementById('app'))
```

Okay so there's quite a lot to unpack here:

- First off, for the `Value` component we use the `useSelector` hook to get the piece of state from the store to display it.
- For the `Button` component, we use the `useDispatch` hook in order to dispatch the passed in actions.
- For the `App` component, we define the input element and its state here so that we can pass down the `value` of the input element to the `Button` components for dispatch. This allows the user to enter in a specified value to either add or subtract.

Great! Now we have a fully-functioning simple React calculator app :)
