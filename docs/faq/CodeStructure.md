---
id: code-structure
title: Code Structure
sidebar_label: Code Structure
hide_title: true
---

# Redux FAQ: Code Structure

## Table of Contents

- [What should my file structure look like? How should I group my action creators and reducers in my project? Where should my selectors go?](#what-should-my-file-structure-look-like-how-should-i-group-my-action-creators-and-reducers-in-my-project-where-should-my-selectors-go)
- [How should I split my logic between reducers and action creators? Where should my “business logic” go?](#how-should-i-split-my-logic-between-reducers-and-action-creators-where-should-my-business-logic-go)
- [Why should I use action creators?](#why-should-i-use-action-creators)
- [Where should websockets and other persistent connections live?](#where-should-websockets-and-other-persistent-connections-live)

## Code Structure

### What should my file structure look like? How should I group my action creators and reducers in my project? Where should my selectors go?

Since Redux is just a data store library, it has no direct opinion on how your project should be structured. However, there are a few common patterns that most Redux developers tend to use:

- Rails-style: separate folders for “actions”, “constants”, “reducers”, “containers”, and “components”
- Domain-style: separate folders per feature or domain, possibly with sub-folders per file type
- “Ducks”: similar to domain style, but explicitly tying together actions and reducers, often by defining them in the same file

It's generally suggested that selectors are defined alongside reducers and exported, and then reused elsewhere (such as in `mapStateToProps` functions, in async action creators, or sagas) to colocate all the code that knows about the actual shape of the state tree in the reducer files.

While it ultimately doesn't matter how you lay out your code on disk, it's important to remember that actions and reducers shouldn't be considered in isolation. It's entirely possible (and encouraged) for a reducer defined in one folder to respond to an action defined in another folder.

#### Further information

**Documentation**

- [FAQ: Actions - "1:1 mapping between reducers and actions?"](./Actions.md#actions-reducer-mappings)

**Articles**

- [How to Scale React Applications](https://www.smashingmagazine.com/2016/09/how-to-scale-react-applications/) (accompanying talk: [Scaling React Applications](https://vimeo.com/168648012))
- [Redux Best Practices](https://medium.com/lexical-labs-engineering/redux-best-practices-64d59775802e)
- [Rules For Structuring (Redux) Applications ](http://jaysoo.ca/2016/02/28/organizing-redux-application/)
- [A Better File Structure for React/Redux Applications](http://marmelab.com/blog/2015/12/17/react-directory-structure.html)
- [Organizing Large React Applications](http://engineering.kapost.com/2016/01/organizing-large-react-applications/)
- [Four Strategies for Organizing Code](https://medium.com/@msandin/strategies-for-organizing-code-2c9d690b6f33)
- [Encapsulating the Redux State Tree](http://randycoulman.com/blog/2016/09/13/encapsulating-the-redux-state-tree/)
- [Redux Reducer/Selector Asymmetry](http://randycoulman.com/blog/2016/09/20/redux-reducer-selector-asymmetry/)
- [Modular Reducers and Selectors](http://randycoulman.com/blog/2016/09/27/modular-reducers-and-selectors/)
- [My journey towards a maintainable project structure for React/Redux](https://medium.com/@mmazzarolo/my-journey-toward-a-maintainable-project-structure-for-react-redux-b05dfd999b5)
- [React/Redux Links: Architecture - Project File Structure](https://github.com/markerikson/react-redux-links/blob/master/react-redux-architecture.md#project-file-structure)

**Discussions**

- [#839: Emphasize defining selectors alongside reducers](https://github.com/reduxjs/redux/issues/839)
- [#943: Reducer querying](https://github.com/reduxjs/redux/issues/943)
- [React Boilerplate #27: Application Structure](https://github.com/mxstbr/react-boilerplate/issues/27)
- [Stack Overflow: How to structure Redux components/containers](http://stackoverflow.com/questions/32634320/how-to-structure-redux-components-containers/32921576)
- [Twitter: There is no ultimate file structure for Redux](https://twitter.com/dan_abramov/status/783428282666614784)

### How should I split my logic between reducers and action creators? Where should my “business logic” go?

There's no single clear answer to exactly what pieces of logic should go in a reducer or an action creator. Some developers prefer to have “fat” action creators, with “thin” reducers that simply take the data in an action and blindly merge it into the corresponding state. Others try to emphasize keeping actions as small as possible, and minimize the usage of `getState()` in an action creator. (For purposes of this question, other async approaches such as sagas and observables fall in the "action creator" category.)

There are some potential benefits from putting more logic into your reducers. It's likely that the action types would be more semantic and more meaningful (such as `"USER_UPDATED"` instead of `"SET_STATE"`). In addition, having more logic in reducers means that more functionality will be affected by time travel debugging.

This comment sums up the dichotomy nicely:

> Now, the problem is what to put in the action creator and what in the reducer, the choice between fat and thin action objects. If you put all the logic in the action creator, you end up with fat action objects that basically declare the updates to the state. Reducers become pure, dumb, add-this, remove that, update these functions. They will be easy to compose. But not much of your business logic will be there.
> If you put more logic in the reducer, you end up with nice, thin action objects, most of your data logic in one place, but your reducers are harder to compose since you might need info from other branches. You end up with large reducers or reducers that take additional arguments from higher up in the state.

Find the balance between these two extremes, and you will master Redux.

#### Further information

**Articles**

- [Where do I put my business logic in a React/Redux application?](https://medium.com/@jeffbski/where-do-i-put-my-business-logic-in-a-react-redux-application-9253ef91ce1)
- [How to Scale React Applications](https://www.smashingmagazine.com/2016/09/how-to-scale-react-applications/)
- [The Tao of Redux, Part 2 - Practice and Philosophy. Thick and thin reducers.](http://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/#thick-and-thin-reducers)

**Discussions**

- [How putting too much logic in action creators could affect debugging](https://github.com/reduxjs/redux/issues/384#issuecomment-127393209)
- [#384: The more that's in a reducer, the more you can replay via time travel](https://github.com/reduxjs/redux/issues/384#issuecomment-127393209)
- [#1165: Where to put business logic / validation?](https://github.com/reduxjs/redux/issues/1165)
- [#1171: Recommendations for best practices regarding action-creators, reducers, and selectors](https://github.com/reduxjs/redux/issues/1171)
- [Stack Overflow: Accessing Redux state in an action creator?](http://stackoverflow.com/questions/35667249/accessing-redux-state-in-an-action-creator/35674575)
- [#2796: Gaining clarity on "business logic"](https://github.com/reduxjs/redux/issues/2796#issue-289298280)
- [Twitter: Moving away from unclear terminology...](https://twitter.com/FwardPhoenix/status/952971237004926977)

### Why should I use action creators?

Redux does not require action creators. You are free to create actions in any way that is best for you, including simply passing an object literal to `dispatch`. Action creators emerged from the [Flux architecture](https://facebook.github.io/react/blog/2014/07/30/flux-actions-and-the-dispatcher.html#actions-and-actioncreators) and have been adopted by the Redux community because they offer several benefits.

Action creators are more maintainable. Updates to an action can be made in one place and applied everywhere. All instances of an action are guaranteed to have the same shape and the same default values.

Action creators are testable. The correctness of an inline action must be verified manually. Like any function, tests for an action creator can be written once and run automatically.

Action creators are easier to document. The action creator's parameters enumerate the action's dependencies. And centralization of the action definition provides a convenient place for documentation comments. When actions are written inline, this information is harder to capture and communicate.

Action creators are a more powerful abstraction. Creating an action often involves transforming data or making AJAX requests. Action creators provide a uniform interface to this varied logic. This abstraction frees a component to dispatch an action without being complicated by the details of that action's creation.

#### Further information

**Articles**

- [Idiomatic Redux: Why use action creators?](http://blog.isquaredsoftware.com/2016/10/idiomatic-redux-why-use-action-creators/)

**Discussions**

- [Reddit: Redbox - Redux action creation made simple](https://www.reddit.com/r/reactjs/comments/54k8js/redbox_redux_action_creation_made_simple/d8493z1/?context=4)

### Where should websockets and other persistent connections live?

Middleware are the right place for persistent connections like websockets in a Redux app, for several reasons:

- Middleware exist for the lifetime of the application
- Like with the store itself, you probably only need a single instance of a given connection that the whole app can use
- Middleware can see all dispatched actions and dispatch actions themselves. This means a middleware can take dispatched actions and turn those into messages sent over the websocket, and dispatch new actions when a message is received over the websocket.
- A websocket connection instance isn't serializable, so [it doesn't belong in the store state itself](/faq/organizing-state#organizing-state-non-serializable)

See [this example that shows how a socket middleware might dispatch and respond to Redux actions](https://gist.github.com/markerikson/3df1cf5abbac57820a20059287b4be58).

There's many existing middleware for websockets and other similar connections - see the link below.

**Libraries**

- [Middleware: Socket and Adapters](https://github.com/markerikson/redux-ecosystem-links/blob/master/middleware-sockets-adapters.md)
