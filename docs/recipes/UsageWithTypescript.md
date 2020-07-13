---
id: usage-with-typescript
title: Usage With TypeScript
hide_title: true
---

# Usage with TypeScript

## Overview

**TypeScript** is a typed superset of JavaScript. It has become popular recently in applications due to the benefits it can bring. If you are new to TypeScript it is highly recommended to become familiar with it first before proceeding. You can check out its documentation [here.](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

TypeScript has the potential to bring the following benefits to a Redux application:

1. Type safety for reducers, state and action creators, and UI components
2. Easy refactoring of typed code
3. A superior developer experience in a team environment

## Notes & Considerations

- While we do [officially recommend use of static typing with Redux](../style-guide/style-guide.md#use-static-typing), use of TypeScript does have tradeoffs in terms of setup, amount of code written, and readability. TypeScript will likely provide a net benefit in larger apps or codebases need to be maintained over time by many people, but may feel like too much overhead in smaller projects. Take time to evaluate the tradeoffs and decide whether it's worth using TS in your own application.
- This page primarily covers adding type checking for the Redux core, and only gives shorter examples of using TS with other Redux libraries. See their respective documentation for further details.
- There are multiple possible approaches to type checking Redux code. This page demonstrates some of the common and recommended approaches to keep things simple, and is not an exhaustive guide

## A Practical Example

We will be going through a simplistic chat application to demonstrate a possible approach to include static typing. This chat application will have two reducers. The _chat reducer_ will focus on storing the chat history and the _system reducer_ will focus on storing session information.

The full source code is available on [codesandbox here](https://codesandbox.io/s/w02m7jm3q7). Note that by going through this example yourself you will experience some of the benefits of using TypeScript.

### Type Checking State

Adding types to each slice of state is a good place to start since it does not rely on other types. In this example we start by describing the chat reducer's slice of state:

```ts
// src/store/chat/types.ts

export interface Message {
  user: string
  message: string
  timestamp: number
}

export interface ChatState {
  messages: Message[]
}
```

And then do the same for the system reducer's slice of state:

```ts
// src/store/system/types.ts

export interface SystemState {
  loggedIn: boolean
  session: string
  userName: string
}
```

Note that we are exporting these interfaces to reuse them later in reducers and action creators.

### Type Checking Actions & Action Creators

We will be using string literals and using `typeof` to declare our action constants and infer types. Note that we are making a tradeoff here when we declare our types in a separate file. In exchange for separating our types into a separate file, we get to keep our other files more focused on their purpose. While this tradeoff can improve the maintainability of the codebase, it is perfectly fine to organize your project however you see fit.

Chat Action Constants & Shape:

```ts
// src/store/chat/types.ts
export const SEND_MESSAGE = 'SEND_MESSAGE'
export const DELETE_MESSAGE = 'DELETE_MESSAGE'

interface SendMessageAction {
  type: typeof SEND_MESSAGE
  payload: Message
}

interface DeleteMessageAction {
  type: typeof DELETE_MESSAGE
  meta: {
    timestamp: number
  }
}

export type ChatActionTypes = SendMessageAction | DeleteMessageAction
```

Note that we are using TypeScript's Union Type here to express all possible actions.

With these types declared we can now also type check chat's action creators. In this case we are taking advantage of TypeScript's inference:

```ts
// src/store/chat/actions.ts

import { Message, SEND_MESSAGE, DELETE_MESSAGE, ChatActionTypes } from './types'

// TypeScript infers that this function is returning SendMessageAction
export function sendMessage(newMessage: Message): ChatActionTypes {
  return {
    type: SEND_MESSAGE,
    payload: newMessage
  }
}

// TypeScript infers that this function is returning DeleteMessageAction
export function deleteMessage(timestamp: number): ChatActionTypes {
  return {
    type: DELETE_MESSAGE,
    meta: {
      timestamp
    }
  }
}
```

System Action Constants & Shape:

```ts
// src/store/system/types.ts
export const UPDATE_SESSION = 'UPDATE_SESSION'

interface UpdateSessionAction {
  type: typeof UPDATE_SESSION
  payload: SystemState
}

export type SystemActionTypes = UpdateSessionAction
```

With these types we can now also type check system's action creators:

```ts
// src/store/system/actions.ts

import { SystemState, UPDATE_SESSION, SystemActionTypes } from './types'

export function updateSession(newSession: SystemState): SystemActionTypes {
  return {
    type: UPDATE_SESSION,
    payload: newSession
  }
}
```

### Type Checking Reducers

Reducers are just pure functions that take the previous state, an action and then return the next state. In this example, we explicitly declare the type of actions this reducer will receive along with what it should return (the appropriate slice of state). With these additions TypeScript will give rich intellisense on the properties of our actions and state. In addition, we will also get errors when a certain case does not return the `ChatState`.

Type checked chat reducer:

```ts
// src/store/chat/reducers.ts

import {
  ChatState,
  ChatActionTypes,
  SEND_MESSAGE,
  DELETE_MESSAGE
} from './types'

const initialState: ChatState = {
  messages: []
}

export function chatReducer(
  state = initialState,
  action: ChatActionTypes
): ChatState {
  switch (action.type) {
    case SEND_MESSAGE:
      return {
        messages: [...state.messages, action.payload]
      }
    case DELETE_MESSAGE:
      return {
        messages: state.messages.filter(
          message => message.timestamp !== action.meta.timestamp
        )
      }
    default:
      return state
  }
}
```

Type checked system reducer:

```ts
// src/store/system/reducers.ts

import { SystemState, SystemActionTypes, UPDATE_SESSION } from './types'

const initialState: SystemState = {
  loggedIn: false,
  session: '',
  userName: ''
}

export function systemReducer(
  state = initialState,
  action: SystemActionTypes
): SystemState {
  switch (action.type) {
    case UPDATE_SESSION: {
      return {
        ...state,
        ...action.payload
      }
    }
    default:
      return state
  }
}
```

We now need to generate the root reducer function, which is normally done using `combineReducers`. Note that we do not have to explicitly declare a new interface for RootState. We can use `ReturnType` to infer state shape from the `rootReducer`.

```ts
// src/store/index.ts

import { systemReducer } from './system/reducers'
import { chatReducer } from './chat/reducers'

const rootReducer = combineReducers({
  system: systemReducer,
  chat: chatReducer
})

export type RootState = ReturnType<typeof rootReducer>
```

## Usage with React Redux

While React Redux is a separate library from Redux itself, it is commonly used with React.

For a complete guide on how to correctly use React-Redux with TypeScript, see **[the "Static Typing" page in the React-Redux docs](https://react-redux.js.org/using-react-redux/static-typing)**. This section will highlight the standard patterns.

React-Redux doesn't ship with its own type definitions. If you are using Typescript you should install the [`@types/react-redux` type definitions](https://npm.im/@types/react-redux) from npm. In addition to typing the library functions, the types also export some helpers to make it easier to write typesafe interfaces between your Redux store and your React components.

### Typing the useSelector hook

Declare the type of the `state` parameter in the selector function, and the return type of `useSelector` will be inferred to match the return type of the selector:

```ts
interface RootState {
  isOn: boolean
}

// TS infers type: (state: RootState) => boolean
const selectIsOn = (state: RootState) => state.isOn

// TS infers `isOn` is boolean
const isOn = useSelector(selectIsOn)
```

### Typing the `useDispatch` hook

By default, the return value of `useDispatch` is the standard `Dispatch` type defined by the Redux core types, so no declarations are needed:

```ts
const dispatch = useDispatch()
```

### Typing the `connect` higher order component

Use the `ConnectedProps<T>` type exported by `@types/react-redux^7.1.2` to infer the types of the props from `connect` automatically. This requires splitting the `connect(mapState, mapDispatch)(MyComponent)` call into two parts:

```tsx
import { connect, ConnectedProps } from 'react-redux'

interface RootState {
  isOn: boolean
}

const mapState = (state: RootState) => ({
  isOn: state.isOn
})

const mapDispatch = {
  toggleOn: () => ({ type: 'TOGGLE_IS_ON' })
}

const connector = connect(mapState, mapDispatch)

// The inferred type will look like:
// {isOn: boolean, toggleOn: () => void}
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & {
  backgroundColor: string
}

const MyComponent = (props: Props) => (
  <div style={{ backgroundColor: props.backgroundColor }}>
    <button onClick={props.toggleOn}>
      Toggle is {props.isOn ? 'ON' : 'OFF'}
    </button>
  </div>
)

export default connector(MyComponent)
```

## Usage with Redux Thunk

Redux Thunk is a commonly used middleware for writing sync and async logic that interacts with the Redux store. Feel free to check out its documentation [here](https://github.com/reduxjs/redux-thunk). A thunk is a function that returns another function that takes parameters `dispatch` and `getState`. Redux Thunk has a built in type `ThunkAction` which we can use to define types for those arguments:

```ts
// src/thunks.ts

import { Action } from 'redux'
import { sendMessage } from './store/chat/actions'
import { RootState } from './store'
import { ThunkAction } from 'redux-thunk'

export const thunkSendMessage = (
  message: string
): ThunkAction<void, RootState, unknown, Action<string>> => async dispatch => {
  const asyncResp = await exampleAPI()
  dispatch(
    sendMessage({
      message,
      user: asyncResp,
      timestamp: new Date().getTime()
    })
  )
}

function exampleAPI() {
  return Promise.resolve('Async Chat Bot')
}
```

To reduce repetition, you might want to define a reusable `AppThunk` type once, in your store file, and then use that type whenever you write a thunk:

```ts
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
```

It is highly recommended to use action creators in your dispatch since we can reuse the work that has already been done to type check these functions.

## Usage with Redux Toolkit

The official [Redux Toolkit](https://redux-toolkit.js.org) package is written in TypeScript, and provides APIs that are designed to work well in TypeScript applications.

### Typing `configureStore`

`configureStore` infers the type of the state value from the provided root reducer function, so no specific type declarations should be needed. However, you may want to export the type of `store.dispatch`, which should already have the Thunk middleware types included:

```ts
const store = configureStore({
  reducer: rootReducer
})

export type AppDispatch = typeof store.dispatch
```

### Typing `createAction`

`createAction` requires that the type of the payload be explicitly defined, unless there is no payload required:

```ts
const add = createAction<number>(1)
```

### Typing `createReducer`

`createReducer` will infer the type of its state value from the `initialState` argument. Action types should be declared explicitly:

```ts
const initialState: number = 0
const counterReducer = createReducer(initialState, {
  increment: (state, action: PayloadAction<number>) => state + action.payload
})
```

### Typing `createSlice`

Similar to `createReducer`, `createSlice` will infer the type of its state value from the `initialState` argument. Action types should be declared explicitly, and will be reused for the generated action creators:

```ts
const counterSlice = createSlice({
  name: 'counter',
  initialState: 0 as number,
  reducers: {
    increment(state, action: PayloadAction<number>) {
      return state + action.payload
    }
  }
})
```

## Resources

For further information, see these additional resources:

- Redux library documentation:
  - [React-Redux docs: Static Typing](https://react-redux.js.org/using-react-redux/static-typing): Examples of how to use the React-Redux APIs with TypeScript
  - [Redux Toolkit docs: Advanced Tutorial](https://redux-toolkit.js.org/tutorials/advanced-tutorial): shows how to use RTK and the React-Redux hooks API with TypeScript
- React + Redux + TypeScript guides:
  - [React+TypeScript Cheatsheet](https://github.com/typescript-cheatsheets/react-typescript-cheatsheet): a comprehensive guide to using React with TypeScript
  - [React + Redux in TypeScript Guide](https://github.com/piotrwitek/react-redux-typescript-guide): extensive information on patterns for using React and Redux with TypeScript
- Other articles:
  - [Redux with Code-Splitting and Type Checking](https://www.matthewgerstman.com/tech/redux-code-split-typecheck/)
