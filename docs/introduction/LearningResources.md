---
id: learning-resources
title: Learning Resources
description: 'Introduction > Learning Resources: Additional articles and resources for learning Redux'
---

# Learning Resources

The Redux docs are intended to teach the basic concepts of Redux, as well as explain key concepts for use in real-world applications. However, the docs can't cover everything. Happily, there are many other great resources available for learning Redux. We encourage you to check them out. Many of them cover topics that are beyond the scope of the docs, or describe the same topics in other ways that may work better for your learning style.

This page includes our recommendations for some of the best external resources available to learn Redux. For an additional extensive list of tutorials, articles, and other resources on React, Redux, Javascript, and related topics, see the [React/Redux Links list](https://github.com/markerikson/react-redux-links).

## Basic Introductions

_Tutorials that teach the basic concepts of Redux and how to use it_

- **Intro to React, Redux, and TypeScript** <br />
  https://blog.isquaredsoftware.com/2020/12/presentations-react-redux-ts-intro/ <br />
  Redux maintainer Mark Erikson's slideset that covers the basics of React, Redux, and TypeScript. Redux topics include stores, reducers, middleware, React-Redux, and Redux Toolkit.

- **Learn Modern Redux - Redux Toolkit, React-Redux Hooks, and RTK Query** <br />
  https://www.learnwithjason.dev/let-s-learn-modern-redux <br />
  An episode of the "Learn with Jason" show, with Redux maintainer Mark Erikson as guest. The episode features a live-coded app, and shows how to create a new React+TS project, add the Redux packages, and set up Redux Toolkit and React-Redux from scratch (including our recommended TS hooks configuration). It also shows how to use the upcoming RTK Query data fetching API and display that data in a UI.

- **Redux Tutorial: An Overview and Walkthrough** <br />
  https://www.taniarascia.com/redux-react-guide/ <br />
  A well-written tutorial from Tania Rascia that quickly explains key Redux concepts, and shows how to put together a basic Redux + React app using vanilla Redux and Redux Toolkit.

- **Redux for Beginners - The Brain-Friendly Guide to Learning Redux** <br />
  https://www.freecodecamp.org/news/redux-for-beginners-the-brain-friendly-guide-to-redux/ <br />
  An easy-to-follow tutorial that builds a small todo app with Redux Toolkit and React-Redux, including data fetching.

- **Redux made easy with Redux Toolkit and TypeScript** <br />
  https://www.mattbutton.com/redux-made-easy-with-redux-toolkit-and-typescript/ <br />
  A helpful tutorial that shows how to use Redux Toolkit and TypeScript together to write Redux applications, and how RTK simplifies typical Redux usage.

- **Redux: From Twitter Hype to Production** <br/>
  https://slides.com/jenyaterpil/redux-from-twitter-hype-to-production#/ <br/>
  A well-produced slideshow that visually steps through core Redux concepts, usage with React, project organization, and side effects with thunks and sagas. Has some good animated diagrams demonstrating how data flows through a React+Redux architecture.

## Using Redux With React

_Explanations of the React-Redux bindings library_

- **Modernizing a Legacy Redux Application with React-Redux Hooks** <br />
  https://app.egghead.io/playlists/modernizing-a-legacy-redux-application-with-react-hooks-c528 <br />
  A video series that shows the differences between the earlier `connect` API and the newer React-Redux hooks API, and how to use those hooks in your components.

- **Why Redux is Useful in React Apps** <br/>
  https://www.fullstackreact.com/articles/redux-with-mark-erikson/ <br/>
  An explanation of some of the benefits of using Redux with React, including sharing data between components and hot module reloading.

## Project-Based Tutorials

_Tutorials that teach Redux concepts by building projects, including larger "real-world"-type applications_

- **Practical Redux** <br/>
  https://blog.isquaredsoftware.com/2016/10/practical-redux-part-0-introduction/ <br/>
  https://blog.isquaredsoftware.com/series/practical-redux/ <br/>
  An ongoing series of posts intended to demonstrate a number of specific Redux techniques by building a sample application, based on the MekHQ application for managing Battletech campaigns. Written by Redux co-maintainer Mark Erikson. Covers topics like managing relational data, connecting multiple components and lists, complex reducer logic for features, handling forms, showing modal dialogs, and much more. (Note: this is an older series, and today we recommend newer patterns for writing Redux code. However, many of the principles in this series are still valuable.)

## Redux Implementation

_Explanations of how Redux works internally, by writing miniature reimplementations_

- **Getting Started with Redux - Video Series** <br/>
  https://egghead.io/courses/fundamentals-of-redux-course-from-dan-abramov-bd5cc867 <br/>
  https://github.com/tayiorbeii/egghead.io_redux_course_notes <br/>
  Dan Abramov, the creator of Redux, demonstrates various concepts in 30 short (2-5 minute) videos. The linked Github repo contains notes and transcriptions of the videos.

- **Building React Applications with Idiomatic Redux - Video Series** <br/>
  https://egghead.io/courses/building-react-applications-with-idiomatic-redux <br/>
  https://github.com/tayiorbeii/egghead.io_idiomatic_redux_course_notes <br/>
  Dan Abramov's second video tutorial series, continuing directly after the first. Includes lessons on store initial state, using Redux with React Router, using "selector" functions, normalizing state, use of Redux middleware, async action creators, and more. The linked Github repo contains notes and transcriptions of the videos.

- **Live React: Hot Reloading and Time Travel** <br/>
  https://youtube.com/watch?v=xsSnOQynTHs <br/>
  Dan Abramov's original conference talk that introduced Redux. See how constraints enforced by Redux make hot reloading with time travel easy

- **Build Yourself a Redux** <br/>
  https://zapier.com/engineering/how-to-build-redux/ <br/>
  An excellent in-depth "build a mini-Redux" article, which covers not only Redux's core, but also `connect` and middleware as well.

- **Connect.js explained** <br/>
  https://gist.github.com/gaearon/1d19088790e70ac32ea636c025ba424e <br/>
  A very simplified version of React Redux's `connect()` function that illustrates the basic implementation

- **Let's Write Redux!** <br/>
  https://www.jamasoftware.com/blog/lets-write-redux/ <br/>
  Walks through writing a miniature version of Redux step-by-step, to help explain the concepts and implementation.

## Reducers

_Articles discussing ways to write reducer functions_

- **Taking Advantage of `combineReducers`** <br/>
  https://randycoulman.com/blog/2016/11/22/taking-advantage-of-combinereducers/ <br/>
  Examples of using `combineReducers` multiple times to produce a state tree, and some thoughts on tradeoffs in various approaches to reducer logic.

- **The Power of Higher-Order Reducers** <br/>
  https://slides.com/omnidan/hor#/ <br/>
  A slideshow from the author of redux-undo and other libraries, explaining the concept of higher-order reducers and how they can be used

- **Reducer composition with Higher Order Reducers** <br/>
  https://medium.com/@mange_vibration/reducer-composition-with-higher-order-reducers-35c3977ed08f <br/>
  Some great examples of writing small functions that can be composed together to perform larger specific reducer tasks, such as providing initial state, filtering, updating specific keys, and more.

- **Higher Order Reducers - It just sounds scary** <br/>
  https://medium.com/@danielkagan/high-order-reducers-it-just-sounds-scary-2b9e5dbfc705 <br/>
  Explains how reducers can be composed like Lego bricks to create reusable and testable reducer logic.

## Selectors

_Explanations of how and why to use selector functions to read values from state_

- **Idiomatic Redux: Using Reselect Selectors for Encapsulation and Performance** <br/>
  https://blog.isquaredsoftware.com/2017/12/idiomatic-redux-using-reselect-selectors/ <br/>
  A complete guide to why you should use selector functions with Redux, how to use the Reselect library to write optimized selectors, and advanced tips for improving performance.

- **ReactCasts #8: Selectors in Redux** <br/>
  https://www.youtube.com/watch?v=frT3to2ACCw <br/>
  A great overview of why and how to use selector functions to retrieve data from the store, and derive additional data from store values

- **Optimizing React Redux Application Development with Reselect** <br/>
  https://codebrahma.com/reselect-tutorial-optimizing-react-redux-application-development-with-reselect/ <br/>
  A good tutorial on Reselect. Covers the concept of "selector functions", how to use Reselect's API, and how to use memoized selectors to improve performance.

- **Usage of Reselect in a React-Redux Application** <br/>
  https://dashbouquet.com/blog/frontend-development/usage-of-reselect-in-a-react-redux-application <br/>
  Discusses the importance of memoized selectors for performance, and good practices for using Reselect.

- **React, Reselect, and Redux** <br/>
  https://medium.com/@parkerdan/react-reselect-and-redux-b34017f8194c <br/>
  An explanation of how Reselect's memoized selector functions are useful in Redux apps, and how to create unique selector instances for each component instance.

## Normalization

_How to structure the Redux store like a database for best performance_

- **Querying a Redux Store** <br/>
  https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f <br/>
  A look at best practices for organizing and storing data in Redux, including normalizing data and use of selector functions.

- **Normalizing Redux Stores for Maximum Code Reuse** <br/>
  https://medium.com/@adamrackis/normalizing-redux-stores-for-maximum-code-reuse-ae6e3844ae95 <br/>
  Thoughts on how normalized Redux stores enable some useful data handling approaches, with examples of using selector functions to denormalize hierarchical data.

- **Advanced Redux Entity Normalization** <br/>
  https://medium.com/@dcousineau/advanced-redux-entity-normalization-f5f1fe2aefc5 <br/>
  Describes a "keyWindow" concept for tracking subsets of entities in state, similar to an SQL "view". A useful extension to the idea of normalized data.

## Middleware

_Explanations and examples of how middleware work and how to write them_

- **Exploring Redux Middlewares** <br/>
  https://blog.krawaller.se/posts/exploring-redux-middleware/ <br/>
  Understanding middlewares through a series of small experiments

- **Redux Middleware Tutorial** <br/>
  https://www.pshrmn.com/tutorials/react/redux-middleware/ <br/>
  An overview of what middleware is, how `applyMiddleware` works, and how to write middleware.

- **ReactCasts #6: Redux Middleware** <br/>
  https://www.youtube.com/watch?v=T-qtHI1qHIg <br/>
  A screencast that describes how middleware fit into Redux, their uses, and how to implement a custom middleware

- **A Beginner's Guide to Redux Middleware** <br/>
  https://www.codementor.io/reactjs/tutorial/beginner-s-guide-to-redux-middleware <br/>
  A useful explanation of middleware use cases, with numerous examples

- **Functional Composition in Javascript** <br/>
  https://joecortopassi.com/articles/functional-composition-in-javascript/ <br/>
  Breaking down how the `compose` function works

## Side Effects - Basics

_Introductions to handling async behavior in Redux_

- **Stack Overflow: Dispatching Redux Actions with a Timeout** <br/>
  https://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559#35415559 <br/>
  Dan Abramov explains the basics of managing async behavior in Redux, walking through a progressive series of approaches (inline async calls, async action creators, thunk middleware).

- **Stack Overflow: Why do we need middleware for async flow in Redux?** <br/>
  https://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux/34599594#34599594 <br/>
  Dan Abramov gives reasons for using thunks and async middleware, and some useful patterns for using thunks.

- **What the heck is a "thunk"?** <br/>
  https://daveceddia.com/what-is-a-thunk/ <br/>
  A quick explanation for what the word "thunk" means in general, and for Redux specifically.

- **Thunks in Redux: The Basics** <br/>
  https://medium.com/fullstack-academy/thunks-in-redux-the-basics-85e538a3fe60 <br/>
  A detailed look at what thunks are, what they solve, and how to use them.

## Side Effects - Advanced

_Advanced tools and techniques for managing async behavior_

- **What is the right way to do asynchronous operations in Redux?** <br/>
  https://decembersoft.com/posts/what-is-the-right-way-to-do-asynchronous-operations-in-redux/ <br/>
  An excellent look at the most popular libraries for Redux side effects, with comparisons of how each one works.

- **Redux 4 Ways** <br/>
  https://medium.com/react-native-training/redux-4-ways-95a130da0cdc <br/>
  Side-by-side comparisons of implementing some basic data fetching using thunks, sagas, observables, and a promise middleware

- **Idiomatic Redux: Thoughts on Thunks, Sagas, Abstractions, and Reusability** <br/>
  https://blog.isquaredsoftware.com/2017/01/idiomatic-redux-thoughts-on-thunks-sagas-abstraction-and-reusability/ <br/>
  A response to several "thunks are bad" concerns, arguing that thunks (and sagas) are still a valid approach for managing complex sync logic and async side effects.

- **Javascript Power Tools: Redux-Saga** <br/>
  https://formidable.com/blog/2017/javascript-power-tools-redux-saga/ <br/>
  https://formidable.com/blog/2017/composition-patterns-in-redux-saga/ <br/>
  https://formidable.com/blog/2017/real-world-redux-saga-patterns/ <br/>
  A fantastic series that teaches the concepts, implementation, and benefits behind Redux-Saga, including how ES6 generators are used to control function flow, how sagas can be composed together to accomplish concurrency, and practical use cases for sagas.

- **Exploring Redux Sagas** <br/>
  https://medium.com/onfido-tech/exploring-redux-sagas-cc1fca2015ee <br/>
  An excellent article that explores how to use sagas to provide a glue layer to implement decoupled business logic in a Redux application.

- **Taming Redux with Sagas** <br/>
  https://objectpartners.com/2017/11/20/taming-redux-with-sagas/ <br/>
  A good overview of Redux-Saga, including info on generator functions, use cases for sagas, using sagas to deal with promises, and testing sagas.

- **Reactive Redux State with RxJS** <br/>
  https://ivanjov.com/reactive-redux-state-with-rxjs/ <br/>
  Describes the concept of "Reactive Programming" and the RxJS library, and shows how to use redux-observable to fetch data, along with examples of testing.

- **Using redux-observable to handle asynchronous logic in Redux** <br/>
  https://medium.com/dailyjs/using-redux-observable-to-handle-asynchronous-logic-in-redux-d49194742522 <br/>
  An extended post that compares a thunk-based implementation of handling a line-drawing example vs an observable-based implementation.

## Thinking in Redux

_Deeper looks at how Redux is meant to be used, and why it works the way it does_

- **When (and when not) to reach for Redux** <br />
  https://changelog.com/posts/when-and-when-not-to-reach-for-redux <br />
  Redux maintainer Mark Erikson describes the problems Redux was created to solve, and how it compares to other commonly used tools.

* **You Might Not Need Redux** <br/>
  https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367 <br/>
  Dan Abramov discusses the tradeoffs involved in using Redux.

* **Idiomatic Redux: The Tao of Redux, Part 1 - Implementation and Intent** <br/>
  https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/ <br/>
  A deep dive into how Redux actually works, the constraints it asks you to follow, and the intent behind its design and usage.

* **Idiomatic Redux: The Tao of Redux, Part 2 - Practice and Philosophy** <br/>
  https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/ <br/>
  A follow-up look at why common Redux usage patterns exist, other ways that Redux can be used, and thoughts on the pros and cons of those different patterns and approaches.

* **What's So Great About Redux?** <br/>
  https://medium.freecodecamp.org/whats-so-great-about-redux-ac16f1cc0f8b <br/>
  Deep and fascinating analysis of how Redux compares to OOP and message-passing, how typical Redux usage can devolve towards Java-like "setter" functions with more boilerplate, and something of a plea for a higher-level "blessed" abstraction on top of Redux to make it easier to work with and learn for newbies. Very worth reading.

## Redux Architecture

_Patterns and practices for structuring larger Redux applications_

- **Avoiding Accidental Complexity When Structuring Your App State** <br/>
  https://hackernoon.com/avoiding-accidental-complexity-when-structuring-your-app-state-6e6d22ad5e2a <br/>
  An excellent set of guidelines for organizing your Redux store structure.

- **Redux Step by Step: A Simple and Robust Workflow for Real Life Apps** <br/>
  https://hackernoon.com/redux-step-by-step-a-simple-and-robust-workflow-for-real-life-apps-1fdf7df46092 <br/>
  A follow-up to the "Accidental Complexity" article, discussing principle

- **Things I Wish I Knew About Redux** <br/>
  https://medium.com/horrible-hacks/things-i-wish-i-knew-about-redux-9924abf2f9e0 <br/>
  https://www.reddit.com/r/javascript/comments/4taau2/things_i_wish_i_knew_about_redux/ <br/>
  A number of excellent tips and lessons learned after building an app with Redux. Includes info on connecting components, selecting data, and app/project structure. Additional discussion on Reddit.

- **React+Redux: Tips and Best Practices for Clean, Reliable, & Maintainable Code** <br/>
  https://speakerdeck.com/goopscoop/react-plus-redux-tips-and-best-practices-for-clean-reliable-and-scalable-code <br/>
  An excellent slideshow with a wide variety of tips and suggestions, including keeping action creators simple and data manipulation in reducers, abstracting away API calls, avoiding spreading props, and more.

- **Redux for state management in large web apps** <br/>
  https://blog.mapbox.com/redux-for-state-management-in-large-web-apps-c7f3fab3ce9b <br/>
  Excellent discussion and examples of idiomatic Redux architecture, and how Mapbox applies those approaches to their Mapbox Studio application.

## Apps and Examples

- **React-Redux RealWorld Example: TodoMVC for the Real World** <br/>
  https://github.com/GoThinkster/redux-review <br/>
  An example full-stack "real world" application built with Redux. Demos a Medium-like social blogging site that includes JWT authentication, CRUD, favoriting articles, following users, routing, and more. The RealWorld project also includes many other implementations of the front and back ends of the site, specifically intended to show how different server and client implementations of the same project and API spec compare with each other.

- **Project Mini-Mek** <br/>
  https://github.com/markerikson/project-minimek <br/>
  A sample app to demonstrate various useful Redux techniques, accompanying the "Practical Redux" blog series at https://blog.isquaredsoftware.com/series/practical-redux

- **react-redux-yelp-clone** <br/>
  https://github.com/mohamed-ismat/react-redux-yelp-clone <br/>
  An adaptation of the "Yelp Clone" app by FullStackReact. It extends the original by using Redux and Redux Saga instead of local state, as well as React Router v4, styled-components, and other modern standards. Based on the React-Boilerplate starter kit.

- **WordPress-Calypso** <br/>
  https://github.com/Automattic/wp-calypso <br/>
  The new JavaScript- and API-powered WordPress.com

- **Sound-Redux** <br/>
  https://github.com/andrewngu/sound-redux <br/>
  A Soundcloud client built with React / Redux

- **Webamp** <br/>
  https://webamp.org <br/>
  https://github.com/captbaritone/webamp <br/>
  An in-browser recreation of Winamp2, built with React and Redux. Actually plays MP3s, and lets you load in local MP3 files.

- **Tello** <br/>
  https://github.com/joshwcomeau/Tello <br/>
  A simple and delightful way to track and manage TV shows

- **io-808** <br/>
  https://github.com/vincentriemer/io-808 <br/>
  An attempt at a fully recreated web-based TR-808 drum machine

## Redux Docs Translations

- [中文文档](http://camsong.github.io/redux-in-chinese/) — Chinese
- [繁體中文文件](https://github.com/chentsulin/redux) — Traditional Chinese
- [Redux in Russian](https://github.com/rajdee/redux-in-russian) — Russian
- [Redux en Español](https://es.redux.js.org/) - Spanish
- [Redux in Korean](https://ko.redux.js.org/) - Korean

## Books

- **Redux in Action** <br/>
  https://www.manning.com/books/redux-in-action <br/>
  A comprehensive book that covers many key aspects of using Redux, including the basics of reducers and actions and use with React, complex middlewares and side effects, application structure, performance, testing, and much more. Does a great job of explaining the pros, cons, and tradeoffs of many approaches to using Redux. Personally recommended by Redux co-maintainer Mark Erikson.

- **The Complete Redux Book** <br/>
  https://leanpub.com/redux-book <br/>
  How do I manage a large state in production? Why do I need store enhancers? What is the best way to handle form validations? Get the answers to all these questions and many more using simple terms and sample code. Learn everything you need to use Redux to build complex and production-ready web applications. (Note: now permanently free!)

- **Taming the State in React** <br/>
  https://www.robinwieruch.de/learn-react-redux-mobx-state-management/ <br/>
  If you have learned React with the previous book of the author called The Road to learn React, Taming the State in React will be the perfect blend to learn about basic and advanced state management in React. You will start out with learning only Redux without React. Afterward, the book shows you how to connect Redux to your React application. The advanced chapters will teach you about normalization, naming, selectors and asynchronous actions. In the end, you will set up and build a real world application with React and Redux.

## Courses

- **Modern React with Redux, by Stephen Grider (paid)** <br/>
  https://www.udemy.com/react-redux/ <br/>
  Master the fundamentals of React and Redux with this tutorial as you develop apps with React Router, Webpack, and ES6. This course will get you up and running quickly, and teach you the core knowledge you need to deeply understand and build React components and structure applications with Redux.

- **Redux, by Tyler McGinnis (paid)** <br/>
  https://tylermcginnis.com/courses/redux/ <br/>
  When learning Redux, you need to learn it in the context of an app big enough to see the benefits. That's why this course is huge. A better name might be _"Real World Redux"_. If you're sick of "todo list" Redux tutorials, you've come to the right place. In this course we'll talk all about what makes Redux special for managing state in your application. We'll build an actual "real world" application so you can see how Redux handles edge cases like optimistic updates and error handling. We'll also cover many other technologies that work well with Redux, Firebase, and CSS Modules.

- **Learn Redux, by Wes Bos (free)** <br/>
  https://learnredux.com/ <br/>
  A video course that walks through building 'Reduxstagram' — a simple photo app that will simplify the core ideas behind Redux, React Router and React.js

## More Resources

- [React-Redux Links](https://github.com/markerikson/react-redux-links) is a curated list of high-quality articles, tutorials, and related content for React, Redux, ES6, and more.
- [Redux Ecosystem Links](https://github.com/markerikson/redux-ecosystem-links) is a categorized collection of Redux-related libraries, addons, and utilities.
- [Awesome Redux](https://github.com/xgrommx/awesome-redux) is an extensive list of Redux-related repositories.
- [DEV Community](https://dev.to/t/redux) is a place to share Redux projects, articles and tutorials as well as start discussions and ask for feedback on Redux-related topics. Developers of all skill-levels are welcome to take part.
