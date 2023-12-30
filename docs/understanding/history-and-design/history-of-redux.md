---
id: history-of-redux
title: The History of Redux
description: 'Understanding > The History of Redux'
---

# A (Brief) History of Redux

## 2011: JS MVC Frameworks

Early JavaScript MVC frameworks like AngularJS, Ember, and Backbone had issues. AngularJS tried to enforce separation of "controllers" from templates, but nothing prevented you from writing `<div onClick="$ctrl.some.deeply.nested.field = 123">` in a template. Meanwhile, Backbone was based on event emitters - Models, Collections, and Views were all each capable of emitting events. Models might emit a `"change:firstName"` event, and Views would subscribe to those. But, _any_ code could subscribe to those events and run more logic, which could trigger _more_ events

That made these frameworks very hard to debug and maintain. It was possible that updating one field in one model could trigger dozens of events and logic running around the app, or that any template could make changes to state at any time, which made it impossible to understand what would happen when you did a state update.

## 2014: Flux

Back around 2012-2013, when React was first publicly released, Facebook had been using it internally for a couple years. One of the problems they ran into was that they had multiple independent pieces of their UI that needed access to the same data, like "how many unread notifications are there", but they found it hard to keep that logic straight when using Backbone-style code.

Facebook ultimately came up with a pattern called "Flux": create multiple singleton Stores, like a `PostsStore` and `CommentsStore`. Each of those Store instances would register with a `Dispatcher`, and the _only_ way to trigger an update in a store was to call `Dispatcher.dispatch({type: "somethingHappened"})`. That plain object was called an "action". The idea was that all the state update logic would be semi-centralized - you couldn't just have any random part of the app mutate state, and all the state updates would be predictable.

Facebook announced this "Flux Architecture" concept around 2014, but didn't provide a full library that implemented that pattern. That led the React community to build _dozens_ of Flux-inspired libraries with variations on the pattern.

## 2015: The Birth of Redux

In mid-2015, Dan Abramov began building yet another Flux-inspired library, called Redux. The idea was to demonstrate "time-travel debugging" for a [conference talk](https://youtu.be/xsSnOQynTHs?t=601). The library was designed to use the Flux pattern, but with some functional programming principles applied. Rather than Store _instances_, you could use predictable reducer functions that did immutable updates. This would allow jumping back and forth in time to see how the state looked at various points. It would also make the code more straightforward, testable, and understandable.

Redux came out in 2015, and quickly killed off all the other Flux-inspired libraries. It got early adoption from advanced developers in the React ecosystem, and by 2016, many people began to say that "if you're using React, you _must_ be using Redux too". (Frankly, this led to a lot of people using Redux in places they didn't _need_ to be using it!)

It's also worth noting that at the time, React only had its _legacy_ Context API, which had was basically broken: it couldn't properly pass _updated_ values down. So, it was possible to put event emitters into Context and subscribe to them, but you couldn't really use it for plain data. That meant that a lot of people began adopting Redux because it _was_ a way to consistently pass updated values around the entire application.

Dan said early on that "Redux is not meant to be the _shortest_ way to write code - it's meant to make it predictable and understandable". Part of that is about having a consistent pattern (state updates are done by reducers, so you always look at the reducer logic to see what the state values _can_ be, what the possible actions are, and what updates they cause). It's also about moving logic _out_ of the component tree, so that the UI mostly just says "this thing happened", and your components are simpler. Along with that, code that is written as "pure functions", like reducers and selectors, are more straightforward to understand: arguments in, result out, nothing else to look at. Finally, Redux's design enabled the Redux DevTools, which show you a readable list of all the actions that were dispatched, what the actions/state contained, and changes occurred for each action.

The early Redux patterns were especially boilerplate-heavy. It was common to have `actions/todos.js`, `reducers/todos.js`, and `constants/todos.js`, just to define a single action type ( `const ADD_TODO = "ADD_TODO"`), action creator function, and reducer case. You also had to hand-write immutable updates with spread operators, which were easy to mess up. People did fetch and cache server state in Redux, but it took a lot of manually-written code to write thunks to do the fetching, dispatch the actions with the fetched data, and manage the cache status in the reducers.

Redux became popular in _spite_ of that boilerplate, but it was always the biggest point of concern.

## 2017: Ecosystem Competition

By 2017-18, things had changed. A lot of the community was now focusing more on "data fetching and caching" rather than "client-side state management", and that's when we saw the rise of libraries like Apollo, React Query, SWR, and Urql for data fetching. At the same time, we also had the _new_ React Context API came out, which does properly pass updated values down the component tree.

That meant that Redux wasn't nearly as "required" as it used to be - there were now other tools that solved many of the same problems, with varying amounts of overlap (and often with less code). The frequent complaints about "boilerplate" also caused a lot of concern from folks using Redux.

## 2019: Redux Toolkit

So, in 2019, we built and shipped Redux Toolkit as a simpler way to write the same Redux logic with less code. RTK is still "Redux" (single store, dispatching actions to trigger state updates done in reducers via immutable update logic), but with a simpler API and better built-in default behaviors. That also includes RTK Query, our built-in data fetching and caching library that was inspired by React Query and Apollo.

Today, [RTK is the standard way to write Redux logic](../../introduction/why-rtk-is-redux-today.md). Like all tools, it has tradeoffs. RTK is probably going to be a bit more code to use than Zustand, but it also provides useful patterns for separating app logic from the UI. Redux isn't the right tool for every app, but it is still the most widely used state management lib with React apps, has excellent documentation, and provides a lot of features to help you build apps with a consistent and predictable structure.

## Further Information

- [The Tao of Redux, Part 1: Implementation and Intent](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)
- [Why React Context is Not a "State Management" Tool (and Why It Doesn't Replace Redux)](https://blog.isquaredsoftware.com/2021/01/context-redux-differences/)
- [Idiomatic Redux: Redux Toolkit 1.0](https://blog.isquaredsoftware.com/2019/10/redux-toolkit-1.0/)
- [Changelog #187: Dan Abramov talks about Redux](https://changelog.com/podcast/187)
- [Redux Archeology and Design Notes](https://gist.github.com/markerikson/2971210292a9c65138eeb33ae7d560b0) (with links to early design discussions and descriptions of project design goals)
