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

Type checking each slice of state is simple when you understand that each slice of state is just an object.

Describing the state shape of the chat reducer's slice of state:

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

Describing the state shape of the system reducer's slice of state:

```ts
// src/store/system/types.ts

export interface SystemState {
  loggedIn: boolean
  session: string
  userName: string
}
```

Note that we are exporting these interfaces to reuse them later in application state and action creators.

We can now create an interface which describes the global store:

```ts
// src/store/index.ts

export interface AppState {
  system: SystemState
  chat: ChatState
}
```

## Type Checking Actions & Action Creators

We will be using TypeScript's enums to declare our action constants. [Enums](https://www.typescriptlang.org/docs/handbook/enums.html) allow us to define a set of named constants.

Chat Action Constants and Actions:

```ts
// src/store/chat/types.ts

export enum ChatActions {
  SendMessage = 'SEND_MESSAGE'
}

export interface SendMessageAction {
  type: ChatActions.SendMessage
  payload: Message
}
```

With these types we can now also type check chat's action creators:

```ts
// src/store/chat/actions.ts

import { Message, SendMessageAction, ChatActions } from './types'

export type sendMessageType = (newMessage: Message) => SendMessageAction

export const sendMessage: sendMessageType = newMessage => ({
  type: ChatActions.SendMessage,
  payload: newMessage
})
```

System Action Constants and Actions:

```ts
// src/store/system/types.ts

export enum SystemActions {
  UpdateSession = 'UPDATE_SESSION'
}

export interface UpdateSessionAction {
  type: SystemActions.UpdateSession
  payload: SystemState
}
```

With these types we can now also type check system's action creators:

```ts
// src/store/system/actions.ts

import { SystemActions, UpdateSessionAction, SystemState } from './types'

export type updateSessionType = (
  newSession: SystemState
) => UpdateSessionAction

export const updateSession: updateSessionType = newSession => ({
  type: SystemActions.UpdateSession,
  payload: newSession
})
```

## Type Checking Reducers

Reducers are just pure functions that take the previous state, an action and then return the next state. Redux provides a `Reducer` type which can be imported to assist with type checking.

Type checked chat reducer:

```ts
// src/store/chat/reducers.ts

import { Reducer } from 'redux'
import { ChatState, ChatActions } from './types'

const initialState: ChatState = {
  messages: []
}

export const chatReducer: Reducer<ChatState> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case ChatActions.SendMessage: {
      return {
        messages: [...state.messages, action.payload]
      }
    }
    default:
      return state
  }
}
```

Type checked system reducer:

```ts
// src/store/system/reducers.ts

import { Reducer } from 'redux'
import { SystemActions, SystemState } from './types'

const initialState: SystemState = {
  loggedIn: false,
  session: '',
  userName: ''
}

export const systemReducer: Reducer<SystemState> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case SystemActions.UpdateSession: {
      return {
        ...state,
        ...action.payload
      }
    }
    default: {
      return state
    }
  }
}
```

Putting it all together in combine reducers:

```ts
// src/store/index.ts

import { systemReducer } from './system/reducers'
import { SystemState } from './system/types'

import { chatReducer } from './chat/reducers'
import { ChatState } from './chat/types'

export interface AppState {
  system: SystemState
  chat: ChatState
}

const rootReducer: Reducer<AppState> = combineReducers({
  system: systemReducer,
  chat: chatReducer
})
```

## Notes & Considerations

- This documentation covers primarily the redux side of type checking. For demonstration purposes, the codesandbox example also uses react with react-redux to demonstrate an integration.
- There are multiple approaches to type checking redux, this is just one of many approaches.
- This example only serves the purpose of showing this approach, meaning other advanced concepts have been stripped out to keep things simple. If you are code splitting your redux take a look at [this post](https://medium.com/@matthewgerstman/redux-with-code-splitting-and-type-checking-205195aded46).
- Understand that TypeScript does have its trade-offs. It is a good idea to understand when these trade-offs are worth it in your application.
