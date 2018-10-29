# Usage with TypeScript

**TypeScript** is a typed superset of JavaScript. It has become popular recently in applications due to the benefits it can bring. If you are new to TypeScript it is highly recommended to become familiar with it first before proceeding. You can check out its documentation [here.](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

TypeScript has the potential to bring the following benefits to a Redux application:

1. Type safety for reducers, state and action creators
2. Easy refactoring of typed code
3. A superior developer experience in a team environment

## A Practical Example

We will be going through a simplistic chat application to demonstrate a possible approach to include static typing. This chat application will have two reducers. The _chat reducer_ will focus on storing the chat history and the _system reducer_ will focus on storing session information.

The full source code is available on [codesandbox here](https://codesandbox.io/s/w02m7jm3q7).

## Type Checking State

Type checking each slice of state is simple when you understand that each slice of state is just an object.

Describing the state shape of the chat reducer's slice of state:

```ts
// src/store/chat/types.ts

export interface IMessage {
  user: string
  message: string
  timestamp: number
}

export interface IChatState {
  messages: IMessage[]
}
```

Describing the state shape of the system reducer's slice of state:

```ts
// src/store/system/types.ts

export interface ISystemState {
  loggedIn: boolean
  session: string
  userName: string
}
```

Note that we are exporting these interfaces to reuse them later in application state and action creators.

We can now create an interface which describes the global store:

```ts
// src/store/index.ts

export interface IAppState {
  system: ISystemState
  chat: IChatState
}
```

## Type Checking Actions & Action Creators

We will be using TypeScript's enums to declare our action constants. [Enums](https://www.typescriptlang.org/docs/handbook/enums.html) allow us to define a set of named constants.

Chat Action Constants and Actions:

```ts
// src/store/chat/types.ts

export enum ChatActions {
  SendMessage = '@CHAT:SEND/MESSAGE'
}

export interface ISendMessageAction {
  type: ChatActions.SendMessage
  payload: IMessage
}
```

With these types we can now also type check chat's action creators:

```ts
// src/store/chat/actions.ts

import { IMessage, ISendMessageAction, ChatActions } from './types'

export type sendMessageType = (newMessage: IMessage) => ISendMessageAction

export const sendMessage: sendMessageType = newMessage => ({
  type: ChatActions.SendMessage,
  payload: newMessage
})
```

System Action Constants and Actions:

```ts
// src/store/system/types.ts

export enum SystemActions {
  UpdateSession = '@SYSTEM:UPDATE/SESSION'
}

export interface IUpdateSessionAction {
  type: SystemActions.UpdateSession
  payload: ISystemState
}
```

With these types we can now also type check system's action creators:

```ts
// src/store/system/actions.ts

import { SystemActions, IUpdateSessionAction, ISystemState } from './types'

export type updateSessionType = (
  newSession: ISystemState
) => IUpdateSessionAction

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
import { IChatState, ChatActions } from './types'

const initialState: IChatState = {
  messages: []
}

export const chatReducer: Reducer<IChatState> = (
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
import { SystemActions, ISystemState } from './types'

const initialState: ISystemState = {
  loggedIn: false,
  session: '',
  userName: ''
}

export const systemReducer: Reducer<ISystemState> = (
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
import { ISystemState } from './system/types'

import { chatReducer } from './chat/reducers'
import { IChatState } from './chat/types'

export interface IAppState {
  system: ISystemState
  chat: IChatState
}

const rootReducer: Reducer<IAppState> = combineReducers({
  system: systemReducer,
  chat: chatReducer
})
```
