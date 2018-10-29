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
