---
id: learning-resources
title: Learning Resources
description: 'Introduction > Learning Resources: Additional articles and resources for learning Redux'
---

# Learning Resources

The Redux docs are intended to teach the basic concepts of Redux, as well as explain key concepts for use in real-world applications. However, the docs can't cover everything. Happily, there are many other great resources available for learning Redux. We encourage you to check them out. Many of them cover topics that are beyond the scope of the docs, or describe the same topics in other ways that may work better for your learning style.

This page includes our recommendations for some of the best external resources available to learn Redux. For an additional extensive list of tutorials, articles, and other resources on React, Redux, Javascript, and related topics, see the [React/Redux Links list](https://github.com/markerikson/react-redux-links).

:::tip Start with the tutorials

If you're new to Redux, start with our own tutorials first. [The Redux Essentials tutorial](../tutorials/essentials/part-1-overview-concepts.md) teaches how to build real apps with Redux Toolkit and React-Redux, and [the Redux Fundamentals tutorial](../tutorials/fundamentals/part-1-overview.md) explains how Redux works from the ground up. We also have a page of [recommended videos](../tutorials/videos.md).

Several of the articles below were written before Redux Toolkit existed. Where that's the case, we've noted it. The concepts still apply, but the code samples use older patterns.

:::

## Basic Introductions

_Tutorials that teach the basic concepts of Redux and how to use it_

- **Modern Redux with Redux Toolkit** <br />
  https://blog.isquaredsoftware.com/2022/06/presentations-modern-redux-rtk/ <br />
  Redux maintainer Mark Erikson's presentation on how Redux Toolkit simplifies Redux usage, why we recommend it as the standard way to write Redux logic, and how it compares to the older hand-written patterns.

- **Intro to React, Redux, and TypeScript** <br />
  https://blog.isquaredsoftware.com/2020/12/presentations-react-redux-ts-intro/ <br />
  Mark Erikson's slideset that covers the basics of React, Redux, and TypeScript. Redux topics include stores, reducers, middleware, React-Redux, and Redux Toolkit.

- **Learn Modern Redux - Redux Toolkit, React-Redux Hooks, and RTK Query** <br />
  https://codetv.dev/series/learn-with-jason/s4/let-s-learn-modern-redux <br />
  An episode of the "Learn with Jason" show, with Redux maintainer Mark Erikson as guest. The episode features a live-coded app, and shows how to create a new React+TS project, add the Redux packages, and set up Redux Toolkit and React-Redux from scratch (including our recommended TS hooks configuration). It also shows how to use the RTK Query data fetching API and display that data in a UI.

- **Redux Tutorial: An Overview and Walkthrough** <br />
  https://www.taniarascia.com/redux-react-guide/ <br />
  A well-written tutorial from Tania Rascia that quickly explains key Redux concepts, and shows how to put together a basic Redux + React app using vanilla Redux and Redux Toolkit.

- **Redux for Beginners - The Brain-Friendly Guide to Learning Redux** <br />
  https://www.freecodecamp.org/news/redux-for-beginners-the-brain-friendly-guide-to-redux/ <br />
  An easy-to-follow tutorial that builds a small todo app with Redux Toolkit and React-Redux, including data fetching.

- **Redux made easy with Redux Toolkit and TypeScript** <br />
  https://mattbutton.com/redux-made-easy-with-redux-toolkit-and-typescript/ <br />
  A helpful tutorial that shows how to use Redux Toolkit and TypeScript together to write Redux applications, and how RTK simplifies typical Redux usage.

## Using Redux With React

_Explanations of the React-Redux bindings library_

- **React-Redux docs** <br />
  https://react-redux.js.org/ <br />
  The official docs for React-Redux, including the `useSelector` and `useDispatch` hooks, the recommended TypeScript setup, and the older `connect` API.

- **Modernizing a Legacy Redux Application with React-Redux Hooks** <br />
  https://app.egghead.io/playlists/modernizing-a-legacy-redux-application-with-react-hooks-c528 <br />
  A video series that shows the differences between the earlier `connect` API and the newer React-Redux hooks API, and how to use those hooks in your components.

- **A (Mostly) Complete Guide to React Rendering Behavior** <br />
  https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/ <br />
  Mark Erikson's explanation of when and why React components re-render, and how React-Redux fits into that. Useful background for understanding `useSelector` and performance.

## TypeScript

_Using Redux with TypeScript_

- **Redux: Usage with TypeScript** <br />
  [Usage with TypeScript](../usage/UsageWithTypescript.md) <br />
  Our own guide to setting up a typed store, typed hooks, and typed slices and thunks.

- **Redux Toolkit: TypeScript Quick Start** <br />
  https://redux-toolkit.js.org/tutorials/typescript <br />
  https://redux-toolkit.js.org/usage/usage-with-typescript <br />
  The Redux Toolkit docs on using RTK with TypeScript, from the initial store setup through typing each RTK API.

## Data Fetching with RTK Query

_Fetching and caching server data with the RTK Query API in Redux Toolkit_

- **RTK Query Overview** <br />
  https://redux-toolkit.js.org/rtk-query/overview <br />
  The RTK Query docs, covering what RTK Query is, how to define an API slice, and how to use the generated hooks in components.

- **Redux Essentials, Parts 7 and 8** <br />
  [Part 7: RTK Query Basics](../tutorials/essentials/part-7-rtk-query-basics.md) <br />
  [Part 8: RTK Query Advanced Patterns](../tutorials/essentials/part-8-rtk-query-advanced.md) <br />
  Our own tutorial shows how to convert an app from thunks to RTK Query, and how to handle cache invalidation, optimistic updates, and streaming updates.

- **RTK Query Basics: Query Endpoints, Data Flow and TypeScript** <br />
  https://egghead.io/courses/rtk-query-basics-query-endpoints-data-flow-and-typescript-57ea3c43 <br />
  A free video course by Lenz Weber-Tronic, the creator of RTK Query.

## Redux DevTools

- **Redux DevTools** <br />
  https://github.com/reduxjs/redux-devtools <br />
  The Redux DevTools browser extension lets you inspect every dispatched action and state change, and jump back and forth between states. `configureStore` enables it automatically in development. The repo includes the extension, the standalone `@redux-devtools/cli` for React Native and other environments, and the underlying DevTools components.

## Project-Based Tutorials

_Tutorials that teach Redux concepts by building projects, including larger "real-world"-type applications_

- **Practical Redux** <br/>
  https://blog.isquaredsoftware.com/2016/10/practical-redux-part-0-introduction/ <br/>
  https://blog.isquaredsoftware.com/series/practical-redux/ <br/>
  A series of posts intended to demonstrate a number of specific Redux techniques by building a sample application, based on the MekHQ application for managing Battletech campaigns. Written by Redux co-maintainer Mark Erikson. Covers topics like managing relational data, connecting multiple components and lists, complex reducer logic for features, handling forms, showing modal dialogs, and much more. (Note: this is an older series, and today we recommend newer patterns for writing Redux code. However, many of the principles in this series are still valuable.)

## Redux Implementation

_Explanations of how Redux works internally, by writing miniature reimplementations_

- **Getting Started with Redux - Video Series** <br/>
  https://egghead.io/courses/fundamentals-of-redux-course-from-dan-abramov-bd5cc867 <br/>
  https://github.com/tayiorbeii/egghead.io_redux_course_notes <br/>
  Dan Abramov, the creator of Redux, demonstrates various concepts in 30 short (2-5 minute) videos. The linked Github repo contains notes and transcriptions of the videos. (Note: these videos predate Redux Toolkit and show hand-written reducers and action creators. Watch them to understand how Redux works, after reading the Essentials tutorial to see how we write Redux code today.)

- **Building React Applications with Idiomatic Redux - Video Series** <br/>
  https://egghead.io/courses/building-react-applications-with-idiomatic-redux <br/>
  https://github.com/tayiorbeii/egghead.io_idiomatic_redux_course_notes <br/>
  Dan Abramov's second video tutorial series, continuing directly after the first. Includes lessons on store initial state, using Redux with React Router, using "selector" functions, normalizing state, use of Redux middleware, async action creators, and more. The linked Github repo contains notes and transcriptions of the videos. (Same note as above: older patterns, still valuable for the concepts.)

- **Live React: Hot Reloading and Time Travel** <br/>
  https://www.youtube.com/watch?v=xsSnOQynTHs <br/>
  Dan Abramov's original conference talk that introduced Redux. See how constraints enforced by Redux make hot reloading with time travel easy

- **Build Yourself a Redux** <br/>
  https://zapier.com/blog/how-to-build-redux/ <br/>
  An excellent in-depth "build a mini-Redux" article, which covers not only Redux's core, but also `connect` and middleware as well.

## Reducers

_Articles discussing ways to write reducer functions_

- **Structuring Reducers** <br/>
  [Structuring Reducers](../usage/structuring-reducers/StructuringReducers.md) <br/>
  Our own guide to splitting, combining, and reusing reducer logic, normalizing state, and immutable update patterns. Redux Toolkit's `createSlice` applies these same patterns.

- **Taking Advantage of `combineReducers`** <br/>
  https://randycoulman.com/blog/2016/11/22/taking-advantage-of-combinereducers/ <br/>
  Examples of using `combineReducers` multiple times to produce a state tree, and some thoughts on tradeoffs in various approaches to reducer logic. The same ideas apply to the `reducer` object passed to `configureStore`.

## Selectors

_Explanations of how and why to use selector functions to read values from state_

- **Deriving Data with Selectors** <br/>
  [Deriving Data with Selectors](../usage/deriving-data-selectors.md) <br/>
  Our own guide to writing selectors, memoizing them with Reselect, and using them with React-Redux.

- **Reselect docs** <br/>
  https://reselect.js.org/ <br/>
  The official Reselect docs, including the `createSelector` API, memoization options, and the development-mode checks that catch common selector mistakes.

- **Idiomatic Redux: Using Reselect Selectors for Encapsulation and Performance** <br/>
  https://blog.isquaredsoftware.com/2017/12/idiomatic-redux-using-reselect-selectors/ <br/>
  A complete guide to why you should use selector functions with Redux, how to use the Reselect library to write optimized selectors, and advanced tips for improving performance. (Note: the code samples use `connect`, but the reasoning applies equally to `useSelector`.)

## Normalization

_How to structure the Redux store like a database for best performance_

- **Normalizing State Shape** <br/>
  [Normalizing State Shape](../usage/structuring-reducers/NormalizingStateShape.md) <br/>
  Our own guide to why and how to store data in a normalized `{ids, entities}` shape.

- **`createEntityAdapter`** <br/>
  https://redux-toolkit.js.org/api/createEntityAdapter <br/>
  The Redux Toolkit API that generates reducers and selectors for managing normalized data in a slice.

- **Querying a Redux Store** <br/>
  https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f <br/>
  A look at best practices for organizing and storing data in Redux, including normalizing data and use of selector functions. (Note: predates `createEntityAdapter`, which now handles the update logic described here.)

## Middleware

_Explanations and examples of how middleware work and how to write them_

- **Middleware** <br/>
  [Understanding Redux: Middleware](../understanding/history-and-design/middleware.md) <br/>
  [Writing Custom Middleware](../usage/WritingCustomMiddleware.md) <br/>
  Our own explanation of what middleware are and how `applyMiddleware` works, plus a guide to writing your own.

- **Exploring Redux Middlewares** <br/>
  https://blog.krawaller.se/posts/exploring-redux-middleware/ <br/>
  Understanding middlewares through a series of small experiments

## Side Effects

_Handling async behavior in Redux_

- **Side Effects Approaches** <br/>
  [Side Effects Approaches](../usage/side-effects-approaches.mdx) <br/>
  Our recommendations for handling side effects: RTK Query for data fetching, thunks for general async logic, and the listener middleware for reacting to actions. Also compares sagas and observables.

- **Writing Logic with Thunks** <br/>
  [Writing Logic with Thunks](../usage/writing-logic-thunks.mdx) <br/>
  Our own guide to what thunks are, why they exist, and how to write them.

- **`createListenerMiddleware`** <br/>
  https://redux-toolkit.js.org/api/createListenerMiddleware <br/>
  The Redux Toolkit API for running logic in response to dispatched actions, with cancellation and debouncing support. Covers most use cases that previously needed sagas.

- **Stack Overflow: Dispatching Redux Actions with a Timeout** <br/>
  https://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559#35415559 <br/>
  Dan Abramov explains the basics of managing async behavior in Redux, walking through a progressive series of approaches (inline async calls, async action creators, thunk middleware).

- **Stack Overflow: Why do we need middleware for async flow in Redux?** <br/>
  https://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux/34599594#34599594 <br/>
  Dan Abramov gives reasons for using thunks and async middleware, and some useful patterns for using thunks.

- **What the heck is a "thunk"?** <br/>
  https://daveceddia.com/what-is-a-thunk/ <br/>
  A quick explanation for what the word "thunk" means in general, and for Redux specifically.

- **Idiomatic Redux: Thoughts on Thunks, Sagas, Abstractions, and Reusability** <br/>
  https://blog.isquaredsoftware.com/2017/01/idiomatic-redux-thoughts-on-thunks-sagas-abstraction-and-reusability/ <br/>
  A response to several "thunks are bad" concerns, arguing that thunks (and sagas) are still a valid approach for managing complex sync logic and async side effects.

## Thinking in Redux

_Deeper looks at how Redux is meant to be used, and why it works the way it does_

- **When (and when not) to reach for Redux** <br />
  https://changelog.com/posts/when-and-when-not-to-reach-for-redux <br />
  Redux maintainer Mark Erikson describes the problems Redux was created to solve, and how it compares to other commonly used tools.

- **Why React Context is Not a "State Management" Tool (and Why It Doesn't Replace Redux)** <br />
  https://blog.isquaredsoftware.com/2021/01/context-redux-differences/ <br />
  Mark Erikson explains what React Context actually does, how it differs from Redux, and when each one is the right choice.

- **You Might Not Need Redux** <br/>
  https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367 <br/>
  Dan Abramov discusses the tradeoffs involved in using Redux.

- **Idiomatic Redux: The Tao of Redux, Part 1 - Implementation and Intent** <br/>
  https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/ <br/>
  A deep dive into how Redux actually works, the constraints it asks you to follow, and the intent behind its design and usage.

- **Idiomatic Redux: The Tao of Redux, Part 2 - Practice and Philosophy** <br/>
  https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/ <br/>
  A follow-up look at why common Redux usage patterns exist, other ways that Redux can be used, and thoughts on the pros and cons of those different patterns and approaches.

- **What's So Great About Redux?** <br/>
  https://www.freecodecamp.org/news/whats-so-great-about-redux-ac16f1cc0f8b <br/>
  Deep and fascinating analysis of how Redux compares to OOP and message-passing, how typical Redux usage can devolve towards Java-like "setter" functions with more boilerplate, and something of a plea for a higher-level "blessed" abstraction on top of Redux to make it easier to work with and learn for newbies. Very worth reading. (Redux Toolkit is that abstraction.)

## Redux Architecture

_Patterns and practices for structuring larger Redux applications_

- **Redux Style Guide** <br/>
  [Style Guide](../style-guide/style-guide.md) <br/>
  Our recommended patterns and best practices for structuring Redux applications, organized by priority.

- **Avoiding Accidental Complexity When Structuring Your App State** <br/>
  https://hackernoon.com/avoiding-accidental-complexity-when-structuring-your-app-state-6e6d22ad5e2a <br/>
  An excellent set of guidelines for organizing your Redux store structure.

- **Redux for state management in large web apps** <br/>
  https://medium.com/mapbox/redux-for-state-management-in-large-web-apps-c7f3fab3ce9b <br/>
  Excellent discussion and examples of idiomatic Redux architecture, and how Mapbox applies those approaches to their Mapbox Studio application. (Note: written in 2017, so the code samples use `connect` and hand-written reducers.)

## Apps and Examples

- **Redux Templates** <br/>
  https://github.com/reduxjs/redux-templates <br/>
  Official project templates for Vite, Next.js, and other setups, preconfigured with Redux Toolkit, React-Redux, and TypeScript.

- **Redux Essentials Example App** <br/>
  https://github.com/reduxjs/redux-essentials-example-app <br/>
  The social media feed app built in [the Redux Essentials tutorial](../tutorials/essentials/part-1-overview-concepts.md), using Redux Toolkit, RTK Query, and TypeScript.

- **Webamp** <br/>
  https://webamp.org <br/>
  https://github.com/captbaritone/webamp <br/>
  An in-browser recreation of Winamp2, built with React and Redux. Actually plays MP3s, and lets you load in local MP3 files.

- **WordPress-Calypso** <br/>
  https://github.com/Automattic/wp-calypso <br/>
  The JavaScript- and API-powered WordPress.com

## Redux Docs Translations

- [中文文档](https://cn.redux.js.org/) — Chinese
- [繁體中文文件](https://github.com/chentsulin/redux) — Traditional Chinese
- [Redux in Russian](https://github.com/rajdee/redux-in-russian) — Russian
- [Redux en Español](https://es.redux.js.org/) - Spanish
- [Redux in Korean](https://ko.redux.js.org/) - Korean

## More Resources

- [React-Redux Links](https://github.com/markerikson/react-redux-links) is a curated list of high-quality articles, tutorials, and related content for React, Redux, ES2015, and more.
- [Awesome Redux](https://github.com/xgrommx/awesome-redux) is an extensive list of Redux-related repositories.
- [DEV Community](https://dev.to/t/redux) is a place to share Redux projects, articles and tutorials as well as start discussions and ask for feedback on Redux-related topics. Developers of all skill-levels are welcome to take part.
