# Learning Resources

The Redux docs are intended to teach the basic concepts of Redux, as well as explain key concepts for use in real-world applications. However, the docs can't cover everything. Happily, there are many other great resources available for learning Redux. We encourage you to check them out. Many of them cover topics that are beyond the scope of the docs, or describe the same topics in other ways that may work better for your learning style.

This page includes our recommendations for some of the best external resources available to learn Redux. For an additional extensive list of tutorials, articles, and other resources on React, Redux, Javascript, and related topics, see the [React/Redux Links list](https://github.com/markerikson/react-redux-links).

## Basic Introductions

_Tutorials that teach the basic concepts of Redux and how to use it_

- **Getting Started with Redux - Video Series**  
  https://egghead.io/series/getting-started-with-redux  
  https://github.com/tayiorbeii/egghead.io_redux_course_notes  
  Dan Abramov, the creator of Redux, demonstrates various concepts in 30 short (2-5 minute) videos. The linked Github repo contains notes and transcriptions of the videos.

- **Building React Applications with Idiomatic Redux - Video Series**  
  https://egghead.io/series/building-react-applications-with-idiomatic-redux  
  https://github.com/tayiorbeii/egghead.io_idiomatic_redux_course_notes  
  Dan Abramov's second video tutorial series, continuing directly after the first. Includes lessons on store initial state, using Redux with React Router, using "selector" functions, normalizing state, use of Redux middleware, async action creators, and more. The linked Github repo contains notes and transcriptions of the videos.

- **Live React: Hot Reloading and Time Travel**  
  http://youtube.com/watch?v=xsSnOQynTHs  
  Dan Abramov's original conference talk that introduced Redux. See how constraints enforced by Redux make hot reloading with time travel easy

- **A Cartoon Guide to Redux**  
  https://code-cartoons.com/a-cartoon-intro-to-redux-3afb775501a6  
  A high-level description of Redux, with friendly cartoons to help illustrate the ideas.

- **Leveling Up with React: Redux**  
  https://css-tricks.com/learning-react-redux/  
  A very well-written introduction to Redux and its related concepts, with some nifty cartoon-ish diagrams.

- **An Introduction to Redux**  
  https://www.smashingmagazine.com/2016/06/an-introduction-to-redux/  
  An overview and intro to the basic concepts of Redux. Looks at the benefits of using Redux, how it differs from MVC or Flux, and its relation to functional programming.

- **Redux Tutorial**  
  https://www.pshrmn.com/tutorials/react/redux/  
  A short, clear tutorial that introduces basic Redux terms, shows how to split reducer functions, and describes the Redux store API.

- **Redux: From Twitter Hype to Production**  
  http://slides.com/jenyaterpil/redux-from-twitter-hype-to-production#/  
  An extremely well-produced slideshow that visually steps through core Redux concepts, usage with React, project organization, and side effects with thunks and sagas. Has some absolutely _fantastic_ animated diagrams demonstrating how data flows through a React+Redux architecture.

- **DevGuides: Introduction to Redux**  
  http://devguides.io/redux/  
  A tutorial that covers several aspects of Redux, including actions, reducers, usage with React, and middleware.

## Using Redux With React

_Explanations of the React-Redux bindings and the `connect` function_

- **Why Redux is Useful in React Apps**  
  https://www.fullstackreact.com/articles/redux-with-mark-erikson/  
  An explanation of some of the benefits of using Redux with React, including sharing data between components and hot module reloading.

* **What Does Redux Do? (and when should you use it?)**  
  https://daveceddia.com/what-does-redux-do/  
  An excellent summary of how Redux helps solve data flow problems in a React app.

* **How Redux Works: A Counter-Example**  
  https://daveceddia.com/how-does-redux-work/  
  A great follow-up to the previous article. It explains how to use Redux and React-Redux, by first showing a React component that stores a value in its internal state, and then refactoring it to use Redux instead. Along the way, the article explains important Redux terms and concepts, and how they all fit together to make the Redux data flow work properly.

* **Redux and React: An Introduction**  
  http://jakesidsmith.com/blog/post/2017-11-18-redux-and-react-an-introduction/  
  A great introduction to Redux's core concepts, with explanations of how to use the React-Redux package to use Redux with React.

## Project-Based Tutorials

_Tutorials that teach Redux concepts by building projects, including larger "real-world"-type applications_

- **Practical Redux**  
  http://blog.isquaredsoftware.com/2016/10/practical-redux-part-0-introduction/  
  http://blog.isquaredsoftware.com/series/practical-redux/  
  An ongoing series of posts intended to demonstrate a number of specific Redux techniques by building a sample application, based on the MekHQ application for managing Battletech campaigns. Written by Redux co-maintainer Mark Erikson. Covers topics like managing relational data, connecting multiple components and lists, complex reducer logic for features, handling forms, showing modal dialogs, and much more.

- **Building a Simple CRUD App with React + Redux**  
  http://www.thegreatcodeadventure.com/building-a-simple-crud-app-with-react-redux-part-1/  
  A nifty 8-part series that demonstrates building a CRUD app, including routing, AJAX calls, and the various CRUD aspects. Very well written, with some useful diagrams as well.

- **The Soundcloud Client in React + Redux**  
  http://www.robinwieruch.de/the-soundcloud-client-in-react-redux/  
  A detailed walkthrough demonstrating project setup, routing, authentication, fetching of remote data, and wrapping of a stateful library.

- **Full-Stack Redux Tutorial**  
  http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html  
  A full-blown, in-depth tutorial that builds up a complete client-server application.

- **Getting Started with React, Redux and Immutable: a Test-Driven Tutorial**  
  http://www.theodo.fr/blog/2016/03/getting-started-with-react-redux-and-immutable-a-test-driven-tutorial-part-1/  
  http://www.theodo.fr/blog/2016/03/getting-started-with-react-redux-and-immutable-a-test-driven-tutorial-part-2/  
  Another solid, in-depth tutorial, similar to the "Full-Stack" tutorial. Builds a client-only TodoMVC app, and demonstrates a good project setup (including a Mocha+JSDOM-based testing configuration). Well-written, covers many concepts, and very easy to follow.

- **Redux Hero: An Intro to Redux and Reselect**  
  https://decembersoft.com/posts/redux-hero-part-1-a-hero-is-born-a-fun-introduction-to-redux-js/  
  An introduction to Redux and related libraries through building a small RPG-style game

## Redux Implementation

_Explanations of how Redux works internally, by writing miniature reimplementations_

- **Build Yourself a Redux**  
  https://zapier.com/engineering/how-to-build-redux/  
  An excellent in-depth "build a mini-Redux" article, which covers not only Redux's core, but also `connect` and middleware as well.

- **Connect.js explained**  
  https://gist.github.com/gaearon/1d19088790e70ac32ea636c025ba424e  
  A very simplified version of React Redux's `connect()` function that illustrates the basic implementation

- **Let's Write Redux!**  
  http://www.jamasoftware.com/blog/lets-write-redux/  
  Walks through writing a miniature version of Redux step-by-step, to help explain the concepts and implementation.

## Reducers

_Articles discussing ways to write reducer functions_

- **Taking Advantage of `combineReducers`**  
  http://randycoulman.com/blog/2016/11/22/taking-advantage-of-combinereducers/  
  Examples of using `combineReducers` multiple times to produce a state tree, and some thoughts on tradeoffs in various approaches to reducer logic.

- **The Power of Higher-Order Reducers**  
  http://slides.com/omnidan/hor#/  
  A slideshow from the author of redux-undo and other libraries, explaining the concept of higher-order reducers and how they can be used

- **Reducer composition with Higher Order Reducers**  
  https://medium.com/@mange_vibration/reducer-composition-with-higher-order-reducers-35c3977ed08f  
  Some great examples of writing small functions that can be composed together to perform larger specific reducer tasks, such as providing initial state, filtering, updating specific keys, and more.

- **Higher Order Reducers - It just sounds scary**  
  https://medium.com/@danielkagan/high-order-reducers-it-just-sounds-scary-2b9e5dbfc705  
  Explains how reducers can be composed like Lego bricks to create reusable and testable reducer logic.

## Selectors

_Explanations of how and why to use selector functions to read values from state_

- **Idiomatic Redux: Using Reselect Selectors for Encapsulation and Performance**  
  https://blog.isquaredsoftware.com/2017/12/idiomatic-redux-using-reselect-selectors/  
  A complete guide to why you should use selector functions with Redux, how to use the Reselect library to write optimized selectors, and advanced tips for improving performance.

- **ReactCasts #8: Selectors in Redux**  
  https://www.youtube.com/watch?v=frT3to2ACCw  
  A great overview of why and how to use selector functions to retrieve data from the store, and derive additional data from store values

- **Optimizing React Redux Application Development with Reselect**  
  https://codebrahma.com/reselect-tutorial-optimizing-react-redux-application-development-with-reselect/  
  A good tutorial on Reselect. Covers the concept of "selector functions", how to use Reselect's API, and how to use memoized selectors to improve performance.

- **Usage of Reselect in a React-Redux Application**  
  https://dashbouquet.com/blog/frontend-development/usage-of-reselect-in-a-react-redux-application  
  Discusses the importance of memoized selectors for performance, and good practices for using Reselect.

- **React, Reselect, and Redux**  
  https://medium.com/@parkerdan/react-reselect-and-redux-b34017f8194c  
  An explanation of how Reselect's memoized selector functions are useful in Redux apps, and how to create unique selector instances for each component instance.

## Normalization

_How to structure the Redux store like a database for best performance_

- **Querying a Redux Store**  
  https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f  
  A look at best practices for organizing and storing data in Redux, including normalizing data and use of selector functions.

- **Normalizing Redux Stores for Maximum Code Reuse**  
  https://medium.com/@adamrackis/normalizing-redux-stores-for-maximum-code-reuse-ae6e3844ae95  
  Thoughts on how normalized Redux stores enable some useful data handling approaches, with examples of using selector functions to denormalize hierarchical data.

- **Redux Normalizr: Improve your State Management**  
  http://www.robinwieruch.de/the-soundcloud-client-in-react-redux-normalizr/  
  A tutorial describing how to use Normalizr for improved data management of nested data in Redux

- **Advanced Redux Entity Normalization**  
  https://medium.com/@dcousineau/advanced-redux-entity-normalization-f5f1fe2aefc5  
  Describes a "keyWindow" concept for tracking subsets of entities in state, similar to an SQL "view". A useful extension to the idea of normalized data.

## Middleware

_Explanations and examples of how middleware work and how to write them_

- **Exploring Redux Middlewares**  
  http://blog.krawaller.se/posts/exploring-redux-middleware/  
  Understanding middlewares through a series of small experiments

- **Redux Middleware Tutorial**  
  http://www.pshrmn.com/tutorials/react/redux-middleware/  
  An overview of what middleware is, how `applyMiddleware` works, and how to write middleware.

- **ReactCasts #6: Redux Middleware**  
  https://www.youtube.com/watch?v=T-qtHI1qHIg  
  A screencast that describes how middleware fit into Redux, their uses, and how to implement a custom middleware

- **A Beginner's Guide to Redux Middleware**  
  https://www.codementor.io/reactjs/tutorial/beginner-s-guide-to-redux-middleware  
  A useful explanation of middleware use cases, with numerous examples

- **Functional Composition in Javascript**  
  https://joecortopassi.com/articles/functional-composition-in-javascript/  
  Breaking down how the `compose` function works

## Side Effects - Basics

_Introductions to handling async behavior in Redux_

- **Stack Overflow: Dispatching Redux Actions with a Timeout**  
  http://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559#35415559  
  Dan Abramov explains the basics of managing async behavior in Redux, walking through a progressive series of approaches (inline async calls, async action creators, thunk middleware).

- **Stack Overflow: Why do we need middleware for async flow in Redux?**  
  http://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux/34599594#34599594  
  Dan Abramov gives reasons for using thunks and async middleware, and some useful patterns for using thunks.

- **What the heck is a "thunk"?**  
  https://daveceddia.com/what-is-a-thunk/  
  A quick explanation for what the word "thunk" means in general, and for Redux specifically.

- **Thunks in Redux: The Basics**  
  https://medium.com/fullstack-academy/thunks-in-redux-the-basics-85e538a3fe60  
  A detailed look at what thunks are, what they solve, and how to use them.

## Side Effects - Advanced

_Advanced tools and techniques for managing async behavior_

- **What is the right way to do asynchronous operations in Redux?**  
  https://decembersoft.com/posts/what-is-the-right-way-to-do-asynchronous-operations-in-redux/  
  An excellent look at the most popular libraries for Redux side effects, with comparisons of how each one works.

- **Redux 4 Ways**  
  https://medium.com/react-native-training/redux-4-ways-95a130da0cdc  
  Side-by-side comparisons of implementing some basic data fetching using thunks, sagas, observables, and a promise middleware

- **Idiomatic Redux: Thoughts on Thunks, Sagas, Abstractions, and Reusability**  
  http://blog.isquaredsoftware.com/2017/01/idiomatic-redux-thoughts-on-thunks-sagas-abstraction-and-reusability/  
  A response to several "thunks are bad" concerns, arguing that thunks (and sagas) are still a valid approach for managing complex sync logic and async side effects.

- **Javascript Power Tools: Redux-Saga**  
  http://formidable.com/blog/2017/javascript-power-tools-redux-saga/  
  http://formidable.com/blog/2017/composition-patterns-in-redux-saga/  
  http://formidable.com/blog/2017/real-world-redux-saga-patterns/  
  A fantastic series that teaches the concepts, implementation, and benefits behind Redux-Saga, including how ES6 generators are used to control function flow, how sagas can be composed together to accomplish concurrency, and practical use cases for sagas.

- **Exploring Redux Sagas**  
  https://medium.com/onfido-tech/exploring-redux-sagas-cc1fca2015ee  
  An excellent article that explores how to use sagas to provide a glue layer to implement decoupled business logic in a Redux application.

- **Taming Redux with Sagas**  
  https://objectpartners.com/2017/11/20/taming-redux-with-sagas/  
  A good overview of Redux-Saga, including info on generator functions, use cases for sagas, using sagas to deal with promises, and testing sagas.

- **Reactive Redux State with RxJS**  
  https://ivanjov.com/reactive-redux-state-with-rxjs/  
  Describes the concept of "Reactive Programming" and the RxJS library, and shows how to use redux-observable to fetch data, along with examples of testing.

- **Using redux-observable to handle asynchronous logic in Redux**  
  https://medium.com/dailyjs/using-redux-observable-to-handle-asynchronous-logic-in-redux-d49194742522  
  An extended post that compares a thunk-based implementation of handling a line-drawing example vs an observable-based implementation.

## Thinking in Redux

_Deeper looks at how Redux is meant to be used, and why it works the way it does_

- **You Might Not Need Redux**  
  https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367  
  Dan Abramov discusses the tradeoffs involved in using Redux.

- **Idiomatic Redux: The Tao of Redux, Part 1 - Implementation and Intent**
  http://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/  
  A deep dive into how Redux actually works, the constraints it asks you to follow, and the intent behind its design and usage.

- **Idiomatic Redux: The Tao of Redux, Part 2 - Practice and Philosophy**  
  http://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/  
  A follow-up look at why common Redux usage patterns exist, other ways that Redux can be used, and thoughts on the pros and cons of those different patterns and approaches.

- **What's So Great About Redux?**  
  https://medium.freecodecamp.org/whats-so-great-about-redux-ac16f1cc0f8b  
  https://storify.com/acemarke/redux-pros-cons-and-limitations  
  https://twitter.com/modernserf/status/886426115874717697  
  Deep and fascinating analysis of how Redux compares to OOP and message-passing, how typical Redux usage can devolve towards Java-like "setter" functions with more boilerplate, and something of a plea for a higher-level "blessed" abstraction on top of Redux to make it easier to work with and learn for newbies. Very worth reading. The author originally wrote a tweetstorm, which is captured in the Storify link, and wrote the blog post to expand on those thoughts. Finally, he followed up with a few more thoughts on abstract vs concrete examples in another shorter tweet thread.

## Redux Architecture

_Patterns and practices for structuring larger Redux applications_

- **Avoiding Accidental Complexity When Structuring Your App State**  
  https://hackernoon.com/avoiding-accidental-complexity-when-structuring-your-app-state-6e6d22ad5e2a  
  An excellent set of guidelines for organizing your Redux store structure.

- **Redux Step by Step: A Simple and Robust Workflow for Real Life Apps**  
  https://hackernoon.com/redux-step-by-step-a-simple-and-robust-workflow-for-real-life-apps-1fdf7df46092  
  A follow-up to the "Accidental Complexity" article, discussing principle

- **Things I Wish I Knew About Redux**  
  https://medium.com/horrible-hacks/things-i-wish-i-knew-about-redux-9924abf2f9e0  
  https://www.reddit.com/r/javascript/comments/4taau2/things_i_wish_i_knew_about_redux/  
  A number of excellent tips and lessons learned after building an app with Redux. Includes info on connecting components, selecting data, and app/project structure. Additional discussion on Reddit.

- **React+Redux: Tips and Best Practices for Clean, Reliable, & Maintainable Code**  
  https://speakerdeck.com/goopscoop/react-plus-redux-tips-and-best-practices-for-clean-reliable-and-scalable-code  
  An excellent slideshow with a wide variety of tips and suggestions, including keeping action creators simple and data manipulation in reducers, abstracting away API calls, avoiding spreading props, and more.

- **Redux for state management in large web apps**  
  https://www.mapbox.com/blog/redux-for-state-management-in-large-web-apps/  
  Excellent discussion and examples of idiomatic Redux architecture, and how Mapbox applies those approaches to their Mapbox Studio application.

## Apps and Examples

- **React-Redux RealWorld Example: TodoMVC for the Real World**  
  https://github.com/GoThinkster/redux-review  
  An example full-stack "real world" application built with Redux. Demos a Medium-like social blogging site that includes JWT authentication, CRUD, favoriting articles, following users, routing, and more. The RealWorld project also includes many other implementations of the front and back ends of the site, specifically intended to show how different server and client implementations of the same project and API spec compare with each other.

- **Project Mini-Mek**  
  https://github.com/markerikson/project-minimek  
  A sample app to demonstrate various useful Redux techniques, accompanying the "Practical Redux" blog series at http://blog.isquaredsoftware.com/series/practical-redux

- **react-redux-yelp-clone**  
  https://github.com/mohamed-ismat/react-redux-yelp-clone  
  An adaptation of the "Yelp Clone" app by FullStackReact. It extends the original by using Redux and Redux Saga instead of local state, as well as React Router v4, styled-components, and other modern standards. Based on the React-Boilerplate starter kit.

- **WordPress-Calypso**  
  https://github.com/Automattic/wp-calypso  
  The new JavaScript- and API-powered WordPress.com

- **Sound-Redux**  
  https://github.com/andrewngu/sound-redux  
  A Soundcloud client built with React / Redux

- **Webamp**  
  https://webamp.org  
  https://github.com/captbaritone/webamp  
  An in-browser recreation of Winamp2, built with React and Redux. Actually plays MP3s, and lets you load in local MP3 files.

- **Tello**  
  https://github.com/joshwcomeau/Tello  
  A simple and delightful way to track and manage TV shows

- **io-808**  
  https://github.com/vincentriemer/io-808  
  An attempt at a fully recreated web-based TR-808 drum machine

## Redux Docs Translations

- [中文文档](http://camsong.github.io/redux-in-chinese/) — Chinese
- [繁體中文文件](https://github.com/chentsulin/redux) — Traditional Chinese
- [Redux in Russian](https://github.com/rajdee/redux-in-russian) — Russian
- [Redux en Español](http://es.redux.js.org/) - Spanish

## Books

- **Redux in Action**  
  https://www.manning.com/books/redux-in-action  
  A comprehensive book that covers many key aspects of using Redux, including the basics of reducers and actions and use with React, complex middlewares and side effects, application structure, performance, testing, and much more. Does a great job of explaining the pros, cons, and tradeoffs of many approaches to using Redux. Personally recommended by Redux co-maintainer Mark Erikson.

- **The Complete Redux Book**  
  https://leanpub.com/redux-book  
  How do I manage a large state in production? Why do I need store enhancers? What is the best way to handle form validations? Get the answers to all these questions and many more using simple terms and sample code. Learn everything you need to use Redux to build complex and production-ready web applications. (Note: now permanently free!)

## Courses

- **Modern React with Redux, by Stephen Grider (paid)**  
  https://www.udemy.com/react-redux/  
  Master the fundamentals of React and Redux with this tutorial as you develop apps with React Router, Webpack, and ES6. This course will get you up and running quickly, and teach you the core knowledge you need to deeply understand and build React components and structure applications with Redux.

- **Redux, by Tyler McGinnis (paid)**  
  https://tylermcginnis.com/courses/redux/  
  When learning Redux, you need to learn it in the context of an app big enough to see the benefits. That's why this course is huge. A better name might be _"Real World Redux"_. If you're sick of "todo list" Redux tutorials, you've come to the right place. In this course we'll talk all about what makes Redux special for managing state in your application. We'll build an actual "real world" application so you can see how Redux handles edge cases like optimistic updates and error handling. We'll also cover many other technologies that work well with Redux, Firebase, and CSS Modules.

- **Learn Redux, by Wes Bos (free)**  
  https://learnredux.com/  
  A video course that walks through building 'Reduxstagram' — a simple photo app that will simplify the core ideas behind Redux, React Router and React.js

## More Resources

- [React-Redux Links](https://github.com/markerikson/react-redux-links) is a curated list of high-quality articles, tutorials, and related content for React, Redux, ES6, and more.
- [Redux Ecosystem Links](https://github.com/markerikson/redux-ecosystem-links) is a categorized collection of Redux-related libraries, addons, and utilities.
- [Awesome Redux](https://github.com/xgrommx/awesome-redux) is an extensive list of Redux-related repositories.
- [DEV Community](https://dev.to/t/redux) is a place to share Redux projects, articles and tutorials as well as start discussions and ask for feedback on Redux-related topics. Developers of all skill-levels are welcome to take part.
