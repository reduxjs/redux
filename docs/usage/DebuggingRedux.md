---
id: debugging
title: Debugging Redux
description: 'Usage > Debugging: how to think about debugging, and how to apply that to a Redux app'
---

# Debugging Redux

Debugging is the process of figuring out why a program is not doing what it should, and fixing it. Developers spend a large fraction of their time doing this, and yet it is rarely taught directly. Most of us learn it the hard way, one bug at a time.

This page covers two things: a general approach to debugging that applies to any software, and the specific tools and techniques for applying that approach to a Redux app. The [Troubleshooting](./Troubleshooting.md) page lists specific error messages and their fixes; this page is about how to find the problem when there isn't a helpful error message.

## Debugging Principles

Every problem has a cause. It is not always easy to find, especially with non-deterministic behavior, a hard-to-reproduce sequence of steps, or an environment you can't inspect directly, but it is there. A few principles make finding it much more likely.

**Know what the system is supposed to do.** A bug is "the system not working as expected". You cannot tell what is wrong without a clear idea of what is right. For a Redux app, that means knowing what state should be in the store after a given user action, and what the UI should show for that state.

**Reproduce the problem.** A reliable reproduction confirms _where_ the problem happens, lets you inspect the actual behavior instead of guessing at it, and lets you verify that a fix actually fixed it. Try to narrow the reproduction down to the smallest set of steps that still triggers the bug.

**Debug with a plan.** Treat it as an experiment: form a hypothesis about the cause, make a change that would test that hypothesis, and check the result. Change one thing at a time. If you change three things and the bug goes away, you don't know which one mattered, and you may have introduced a new problem.

**Read the code, including code you didn't write.** Understanding a bug often requires looking beneath the abstraction you're using, and that includes third-party libraries. Library code is just JavaScript on disk in `node_modules`. You can read it, set breakpoints in it, and even add temporary `console.log` calls to it (undo them afterwards).

**Use the right tool.** Print logging and a step debugger answer different questions. Logging is easy to add and shows how values change over time. A debugger lets you pause at one point and inspect everything in scope. Most real debugging sessions use both.

**Find the real error.** Stack traces and error messages often point at a symptom several steps removed from the cause. Keep asking "why did _that_ happen?" until you reach a step where the input was already wrong.

**Know when to stop.** Building up a mental model of what's happening takes time and focus. It also wears you out. If you're stuck, take a break; the answer often shows up when you come back.

### Typical Debugging Steps

1. Understand the problem description. What did the user do, what did they expect, what actually happened?
2. Reproduce the issue, and narrow the reproduction as far as you can.
3. Determine why it's happening: form a hypothesis, test it, narrow down the possibilities.
4. Trace back to the root cause rather than the first place the symptom appears.
5. Decide on the fix. Fix the root cause if you can, and understand the constraints (how severe it is, what else depends on this code).
6. Make the change, and add a test or a check so the same class of problem can't come back.
7. Write down what you found. The next person to hit this (which may be you) will thank you.

## Applying This to Redux

Redux's data flow makes the general approach easier to apply, because it removes most of the places a bug can hide:

- All state updates happen by dispatching an action
- The store runs the root reducer with `(state, action)` and saves the result
- The UI reads the latest state and re-renders if the values it selected changed

So when something is wrong on screen, there are only three questions to ask, in order:

1. **Was the action dispatched?** If not, the bug is in the code that should have dispatched it: an event handler that never ran, a thunk that bailed out early, an action creator that was called but not passed to `dispatch`.
2. **What did the reducer do with it?** If the action was dispatched but the state didn't change the way it should have, the bug is in the reducer: the wrong case matched (or none did), the update logic is wrong, or the state was mutated in place so the store never saw a new value.
3. **What did the component select?** If the state is right but the UI is wrong, the bug is in the selector or the rendering: the selector reads the wrong path, returns a new reference on every call so the component re-renders constantly, or the component's render logic is incorrect.

Because every state change is an action, and actions are logged, the list of dispatched actions is a complete history of what the app did. This is what "predictable" means in practice: you can always trace a wrong value in the state back to the specific action that produced it, and from there to the code that dispatched it.

The Redux Toolkit dev-mode checks catch several of these problems before you have to look for them. `configureStore` adds middleware in development that throws if a reducer mutates its state or if an action or state value isn't serializable, and React-Redux warns when a selector returns unstable references. Those errors and their fixes are listed on the [Troubleshooting](./Troubleshooting.md) page. If you're not using Redux Toolkit yet, switching to it removes a whole class of bugs by construction.

## Redux DevTools

The [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools/tree/main/extension) answers the three questions above directly. Install it for [Chrome](https://chromewebstore.google.com/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/), or [Edge](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdiaponcejilbhhikei). `configureStore` connects to it in development automatically, so there is nothing to set up: open the browser's developer tools and switch to the "Redux" panel.

### Reading the Action History

The left side of the panel lists every dispatched action in order, by type (`todos/todoAdded`). Selecting an action shows several tabs on the right:

- **Action**: the full contents of the action object. Check this when a reducer received the right type but did the wrong thing; a `payload` that isn't what you assumed is a common cause.
- **State**: the complete state tree after this action. Use this to confirm the actual state shape when a selector returns `undefined`, or when you're not sure a reducer was added to the store at all.
- **Diff**: exactly which values changed as a result of this action. An empty diff for an action that should have changed something usually means the reducer returned the existing state, either because no case matched or because it mutated the state instead of returning a new value.
- **Trace**: the stack trace of the code that dispatched this action, if tracing is enabled (see below). This is the fastest way to answer "who dispatched this?" when an action shows up that you didn't expect.

The way to use the list is to read it top to bottom and find the first action after which the state is wrong. The bug is in that action's reducer, or in whatever dispatched it with the wrong contents. Everything after that point is downstream of the same mistake.

If an action you expected is _not_ in the list, it was never dispatched. Stop looking at the reducers and look at the code that should have called `dispatch`.

### Time Travel

Because reducers are pure functions, the DevTools can recompute the state for any point in the history. Clicking **Jump** on an earlier action sets the store back to the state after that action, so you can see what the UI looked like at that point. **Skip** removes an action from the history and recomputes everything after it without that action, which is a quick way to test the hypothesis "this action is the one that broke things". The **Reset**, **Revert**, and **Commit** controls at the bottom let you clear the history or set a new starting point.

Time travel only works correctly if your reducers are pure. If your app looks different after jumping back to an action than it did the first time, that is itself a bug worth chasing: some state is living outside the store, or a reducer has a side effect.

### Dispatching Actions Manually

The **Dispatcher** at the bottom of the panel lets you type an action object and dispatch it into the running app. This is useful for testing a reducer case without going through the UI, or for putting the app into a specific state to reproduce a problem.

### Enabling Traces and Other Options

Trace capture is off by default because generating a stack trace for every dispatch is slow. Turn it on with the `devTools` option:

```ts
import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './reducer'

export const store = configureStore({
  reducer: rootReducer,
  devTools: {
    trace: true,
    traceLimit: 25
  }
})
```

Other options worth knowing:

- `maxAge`: how many actions to keep in the history (default 50). Raise it if the action you need has scrolled off; lower it if a busy app makes the DevTools sluggish.
- `actionSanitizer` and `stateSanitizer`: functions that transform actions and state before sending them to the extension. Use these to strip out large payloads (image data, huge arrays) that make the panel slow, without changing the real state.
- `actionsDenylist` / `actionsAllowlist`: filter which action types are recorded, by type name or regex.

The full list is in the [extension's Arguments documentation](https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Arguments.md). Pass `devTools: false` to disable the connection entirely.

### RTK Query

If you use RTK Query, the DevTools panel has an "RTK Query" tab that lists every query and mutation in the cache with its arguments, status, cached data, provided tags, and subscriber count. When a component shows stale data or a request fires more often than you expect, this tab shows what the cache actually contains and which components are subscribed to each entry.

### Without a Browser Extension

For React Native, Node, or any environment without the browser extension, the [`@redux-devtools/remote`](https://github.com/reduxjs/redux-devtools/tree/main/packages/redux-devtools-remote) package connects a store to a DevTools instance running elsewhere. Expo projects can use the [Redux DevTools Expo dev plugin](https://github.com/matt-oakes/redux-devtools-expo-dev-plugin) instead.

## Logging

The DevTools cover most cases, but sometimes a plain log in the console is the fastest option, especially when you want to see actions interleaved with other output from your app. A minimal logging middleware:

```ts
import type { Middleware } from '@reduxjs/toolkit'
import { isAction } from '@reduxjs/toolkit'

export const loggerMiddleware: Middleware = store => next => action => {
  const type = isAction(action) ? action.type : 'unknown action'
  console.group(type)
  console.log('dispatching', action)
  const result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}
```

Add it in development only, using the `middleware` callback in `configureStore`:

```ts
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => {
    const middleware = getDefaultMiddleware()
    if (import.meta.env.DEV) {
      return middleware.concat(loggerMiddleware)
    }
    return middleware
  }
})
```

[`redux-logger`](https://github.com/LogRocket/redux-logger) does the same thing with more formatting options and collapsible groups.

Two things to remember when reading logged objects in the browser console:

- The console shows an expandable object's contents as they are _when you expand it_, not as they were when the log statement ran. If the state has been mutated since, the log lies. `console.log(JSON.stringify(value))` or `structuredClone(value)` freezes a snapshot.
- Inside a `createSlice` or `createReducer` case reducer, `state` is an Immer draft (a `Proxy`). Logging it shows the proxy internals rather than the data. Use the `current` function that Redux Toolkit re-exports from Immer to get a plain snapshot:

```ts
import { createSlice, current } from '@reduxjs/toolkit'

const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {
    todoToggled(state, action: PayloadAction<string>) {
      console.log('before', current(state))
      const todo = state.find(todo => todo.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
      console.log('after', current(state))
    }
  }
})
```

## Using a Debugger

A step debugger lets you pause execution at a chosen line, inspect every variable in scope, and walk the call stack to see how you got there. The browser DevTools "Sources" panel and VS Code's JavaScript debugger both work with Redux apps; the concepts are the same in each:

- **Breakpoints** pause execution when a line is reached. Set one by clicking a line number, or by putting a `debugger` statement in the code.
- **Conditional breakpoints** only pause when an expression is true. Right-click a breakpoint to add a condition like `action.type === 'todos/todoAdded'`, which is much faster than pausing on every dispatch.
- **Logpoints** log a value when the line is reached without pausing. These are a way to add `console.log` calls without editing and reloading.
- **Step over / step into / step out** move through the code one line at a time. The **call stack** panel shows the chain of functions that led to the current line; clicking a frame shows the variables that were in scope there.

For Redux specifically, the useful places to pause are:

- Inside a case reducer, to see the incoming state and action and step through the update logic
- Inside a thunk, to see whether it reached the `dispatch` call and what it dispatched
- Inside a `useSelector` callback, to see what state the component actually received

When paused in a case reducer, remember that `state` is an Immer draft. The debugger's variable panel shows the proxy; evaluate `current(state)` in the console to see the data (you'll need to have imported `current` somewhere in that module, or expose it on `window` temporarily).

## Debugging React Rendering

Redux gets the state right; React has to render it. When the store contains the correct value but the UI is wrong or updates too often, the problem is on the React side, and the [React DevTools](https://react.dev/learn/react-developer-tools) are the tool for it:

- The **Components** tab shows the component tree, and for a selected component, its props, hooks (including the values returned by `useSelector`), and the component that rendered it. Select a DOM element in the browser's Elements panel and switch to Components to jump straight to the component that produced it.
- The **Profiler** tab records renders and shows which components re-rendered and why, including "Hooks changed", which for a `useSelector` component means the selected value changed.

A `useSelector` callback that returns a new reference each time (a `filter` result, a fresh object literal) makes its component re-render after every dispatched action. React-Redux warns about this in development; the fix is to memoize the derivation with `createSelector`, as described in the [React Redux FAQ](../faq/ReactRedux.md#why-is-my-component-re-rendering-too-often). For the broader rules about when React components re-render, see [A (Mostly) Complete Guide to React Rendering Behavior](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/).

## Recording a Session with Replay

Some bugs only appear after a long, specific sequence of interactions, or on someone else's machine, and reproducing them by hand is the hardest part. [Replay](https://www.replay.io/) addresses that by recording the browser session once and letting you inspect the recording afterwards. A recording captures everything the JavaScript engine took as input, so it can be replayed exactly and paused at any point: you can add console logs to code that already ran, inspect variables at any moment, and step through reducer and selector calls without needing to reproduce the bug again. Recordings can be examined by hand in Replay's DevTools, or handed to a coding agent through [Replay MCP](https://docs.replay.io/basics/replay-mcp/overview), which gives the agent time-travel debugging tools over the recording. See [how to record your app](https://docs.replay.io/basics/getting-started/record-your-app) and the [debugging overview](https://docs.replay.io/basics/debugging/overview) to get started.

## Further Information

**Debugging in general**

- Mark Erikson: [Debugging JavaScript: Tools and Techniques](https://blog.isquaredsoftware.com/presentations/2023-06-debugging-js/) (slides; this page is based on that talk)
- Mark Erikson: [Debugging Tips and Stories](https://blog.isquaredsoftware.com/2019/01/blogged-answers-debugging-tips/)
- Julia Evans: [Reasons why bugs might feel "impossible"](https://jvns.ca/blog/2021/06/08/reasons-why-bugs-might-feel-impossible/)
- [20 Steps to Debug Anything](https://debug.guide/)
- [Chrome DevTools: Debug JavaScript](https://developer.chrome.com/docs/devtools/javascript)

**Redux and React tooling**

- [Redux DevTools Extension documentation](https://github.com/reduxjs/redux-devtools/tree/main/extension/docs)
- [Redux DevTools: Trace actions](https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/Features/Trace.md)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Immer: `current`](https://immerjs.github.io/immer/current/)
