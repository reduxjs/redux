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

Note that we are exporting these interfaces to reuse them later in reducers and action creators.

## Type Checking Actions & Action Creators

We will be using TypeScript's enums to declare our action constants. [Enums](https://www.typescriptlang.org/docs/handbook/enums.html) allow us to define a set of named constants.

Chat Action Constants & Shape:

```ts
// src/store/chat/types.ts

export enum ChatActions {
  SendMessage = 'SEND_MESSAGE'
}

interface SendMessageAction {
  type: ChatActions.SendMessage
  payload: Message
}

export type ChatActionTypes = SendMessageAction
```

Note that you can use TypeScript's Union Type to express multiple actions like so:

```ts
export type ChatActionTypes = SendMessageAction | DeleteMessageAction
```

With these types declared we can now also type check chat's action creators. In this case we are taking advantage of TypeScript's inference to avoid verbosity:

```ts
// src/store/chat/actions.ts

import { Message, ChatActions } from './types'

export function sendMessage(newMessage: Message) {
  return {
    type: ChatActions.SendMessage,
    payload: newMessage
  }
}
```

System Action Constants & Shape:

```ts
// src/store/system/types.ts

export enum SystemActions {
  UpdateSession = 'UPDATE_SESSION'
}

interface UpdateSessionAction {
  type: SystemActions.UpdateSession
  payload: SystemState
}

export type SystemActionTypes = UpdateSessionAction
```

With these types we can now also type check system's action creators:

```ts
// src/store/system/actions.ts

import { SystemActions, SystemState } from './types'

export function updateSession(newSession: SystemState) {
  return {
    type: SystemActions.UpdateSession,
    payload: newSession
  }
}
```

## Type Checking Reducers

Reducers are just pure functions that take the previous state, an action and then return the next state.

Type checked chat reducer:

```ts
// src/store/chat/reducers.ts

import { ChatState, ChatActions, ChatActionTypes } from './types'

const initialState: ChatState = {
  messages: []
}

export function chatReducer(state = initialState, action: ChatActionTypes) {
  switch (action.type) {
    case ChatActions.SendMessage:
      return {
        messages: [...state.messages, action.payload]
      }
    default:
      return state
  }
}
```

Type checked system reducer:

```ts
// src/store/system/reducers.ts

import { SystemActions, SystemState, SystemActionTypes } from './types'

const initialState: SystemState = {
  loggedIn: false,
  session: '',
  userName: ''
}

export function systemReducer(state = initialState, action: SystemActionTypes) {
  switch (action.type) {
    case SystemActions.UpdateSession: {
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

Putting it all together in combine reducers, note that we do not have to explicitly declare a new interface for AppState. We can use `ReturnType` to infer state shape from the `rootReducer`.

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

## Notes & Considerations

- This documentation covers primarily the redux side of type checking. For demonstration purposes, the codesandbox example also uses react with react-redux to demonstrate an integration.
- There are multiple approaches to type checking redux, this is just one of many approaches.
- This example only serves the purpose of showing this approach, meaning other advanced concepts have been stripped out to keep things simple. If you are code splitting your redux take a look at [this post](https://medium.com/@matthewgerstman/redux-with-code-splitting-and-type-checking-205195aded46).
- Understand that TypeScript does have its trade-offs. It is a good idea to understand when these trade-offs are worth it in your application.
