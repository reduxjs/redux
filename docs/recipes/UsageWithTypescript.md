---
id: usage-with-typescript
title: Usage With TypeScript
sidebar_label: Usage With TypeScript
hide_title: true
---

# Usage with TypeScript

**TypeScript** is a typed superset of JavaScript. It has become popular recently in applications due to the benefits it can bring. If you are new to TypeScript it is highly recommended to become familiar with it first before proceeding. You can check out its documentation [here.](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

TypeScript has the potential to bring the following benefits to a Redux application:

1. Type safety for reducers, state and action creators
2. Easy refactoring of typed code
3. A superior developer experience in a team environment

## A Practical Example

We will be going through a simplistic chat application to demonstrate a possible approach to include static typing. This chat application will have two reducers. The _chat reducer_ will focus on storing the chat history and the _system reducer_ will focus on storing session information.

The full source code is available on [codesandbox here](https://codesandbox.io/s/w02m7jm3q7). Note that by going through this example yourself you will experience some of the benefits of using TypeScript.

## Type Checking State

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

## Type Checking Actions & Action Creators

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

## Type Checking Reducers

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

import {
  SystemActions,
  SystemState,
  SystemActionTypes,
  UPDATE_SESSION
} from './types'

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

We now need to generate the root reducer function, which is normally done using `combineReducers`. Note that we do not have to explicitly declare a new interface for AppState. We can use `ReturnType` to infer state shape from the `rootReducer`.

```ts
// src/store/index.ts

import { systemReducer } from './system/reducers'
import { chatReducer } from './chat/reducers'

const rootReducer = combineReducers({
  system: systemReducer,
  chat: chatReducer
})

export type AppState = ReturnType<typeof rootReducer>
```

## Usage with React Redux

While React Redux is a separate library from redux itself, it is commonly used with react. For this reason, we will go through how React Redux works with TypeScript using the same example used previously in this section.

Note: React Redux does not have type checking by itself, you will have to install `@types/react-redux` by running `npm i @types/react-redux -D`.

We will now add type checking to the parameter that `mapStateToProps` receives. Luckily, we have already declared what the store should look like from defining a type that infers from the `rootReducer`:

```ts
// src/App.tsx

import { AppState } from './store'

const mapStateToProps = (state: AppState) => ({
  system: state.system,
  chat: state.chat
})
```

In this example we declared two different properties in `mapStateToProps`. To type check these properties, we will create an interface with the appropriate slices of state:

```ts
// src/App.tsx

import { SystemState } from './store/system/types'

import { ChatState } from './store/chat/types'

interface AppProps {
  chat: ChatState
  system: SystemState
}
```

We can now use this interface to specify what props the appropriate component will receive like so:

```ts
// src/App.tsx

class App extends React.Component<AppProps> {
```

In this component we are also mapping action creators to be available in the component's props. In the same `AppProps` interface we will use the powerful `typeof` feature to let TypeScript know what our action creators expect like so:

```ts
// src/App.tsx

import { SystemState } from './store/system/types'
import { updateSession } from './store/system/actions'

import { ChatState } from './store/chat/types'
import { sendMessage } from './store/chat/actions'

interface AppProps {
  sendMessage: typeof sendMessage
  updateSession: typeof updateSession
  chat: ChatState
  system: SystemState
}
```

With these additions made props that come from redux's side are now being type checked. Feel free to extend the interface as necessary to account for additional props being passed down from parent components.

## Usage with Redux Thunk

Redux Thunk is a commonly used middleware for asynchronous orchestration. Feel free to check out its documentation [here](https://github.com/reduxjs/redux-thunk). A thunk is a function that returns another function that takes parameters `dispatch` and `getState`. Redux Thunk has a built in type `ThunkAction` which we can utilize like so:

```ts
// src/thunks.ts

import { Action } from 'redux'
import { sendMessage } from './store/chat/actions'
import { AppState } from './store'
import { ThunkAction } from 'redux-thunk'

export const thunkSendMessage = (
  message: string
): ThunkAction<void, AppState, null, Action<string>> => async dispatch => {
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

It is highly recommended to use action creators in your dispatch since we can reuse the work that has already been done to type check these functions.

## Notes & Considerations

- This documentation covers primarily the redux side of type checking. For demonstration purposes, the codesandbox example also uses react with React Redux to demonstrate an integration.
- There are multiple approaches to type checking redux, this is just one of many approaches.
- This example only serves the purpose of showing this approach, meaning other advanced concepts have been stripped out to keep things simple. If you are code splitting your redux take a look at [this post](https://medium.com/@matthewgerstman/redux-with-code-splitting-and-type-checking-205195aded46).
- Understand that TypeScript does have its trade-offs. It is a good idea to understand when these trade-offs are worth it in your application.
