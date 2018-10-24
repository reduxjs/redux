# Next Steps

If you landed in this section, you might be wondering at this point, "what should I do now?". Here is where we provide some essential tips/suggestions on how to diverge from creating trivial TodoMVC apps to a real world application.

## Tips & Considerations For The Real World

Whenever we decide to create a new project, we tend to bypass several aspects that in the future may slow us down. In a real world project we have to consider several things before we start coding, such as: how to configure a `store`, `store` size, data structure, state model, middlewares, environment, async transactions, immutability, etc..

The above are some of the main considerations we have to think about beforehand. It's not an easy task, but there are some strategies for making it go smoothly.

### UI vs State

One of the biggest challenges developers face when using Redux is to _describe UI state with data_. The majority of software programs out there are just data transformation, and having the clear understanding that UIs are simply data beautifully presented facilitates the process of building them.

_Nicolas Hery_ describes it really well in _"[Describing UI state with data](http://nicolashery.com/describing-ui-state-with-data/)"_. Also, it's always good to know _[When to use Redux](https://medium.com/@fastphrase/when-to-use-redux-f0aa70b5b1e2)_, because a lot of times _[You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)_

### Configure a Store

To configure a `store` we have to make major considerations on which middleware to use. There are several libraries out there, but the most popular ones are:

#### Perform Asynchronous dispatch

- [redux-thunk](https://github.com/gaearon/redux-thunk)
  - Redux Thunk middleware allows you to write action creators that return a function instead of an action. The thunk can be used to delay the dispatch of an action, or to dispatch only if a certain condition is met. It incorporates the methods `dispatch` and `getState` as parameters.
- [redux-saga](https://github.com/redux-saga/redux-saga)
  - redux-saga is a library that aims to make the execution of application side effects (e.g., asynchronous tasks like data fetching and impure procedures such as accessing the browser cache) manageable and efficient. It's simple to test, as it uses the ES6 feature called `generators`, making the flow as easy to read as synchronous code.
- [redux-observable](https://github.com/redux-observable/redux-observable)
  - redux-observable is a middleware for redux that is inspired by redux-thunk. It allows developers to dispatch a function that returns an `Observable`, `Promise` or `iterable` of action(s). When the observable emits an action, or the promise resolves an action, or the iterable gives an action out, that action is then dispatched as usual.

#### Development Purposes / debug

- [redux-devtools](https://github.com/reduxjs/redux-devtools)
  - Redux DevTools is a set of tools for your Redux development workflow.
- [redux-logger](https://github.com/evgenyrodionov/redux-logger)
  - redux-logger logs all actions that are being dispatched to the store.

To be able to choose one of these libraries we must take into account whether we are building a small or large application. Usability, code standards, and JavaScript knowledge may also be considered. All of them are similar.

**Tip**: Think of middlewares as **skills** you give to your `store`. i.e: By attributing the `redux-thunk` to your store, you're giving the `store` the ability to dispatch async actions.

### Naming Convention

A big source of confusion when it comes to a large project is what to name things. This is often just as important as the code itself. Defining a naming convention for your actions at the very beginning of a project and sticking to that convention helps you to scale up as the scope of the project grows.

Great source:
[A Simple Naming Convention for Action Creators in Redux](https://decembersoft.com/posts/a-simple-naming-convention-for-action-creators-in-redux-js/)
and
[Redux Patterns and Anti-Patterns](https://tech.affirm.com/redux-patterns-and-anti-patterns-7d80ef3d53bc)

**Tip**: Set up an opinionated code formatter, such as [Prettier](https://github.com/prettier/prettier).

### Scalability

There is no magic to analyze and predict how much your application is going to grow. But it's okay! Redux's simplistic foundation means it will adapt to many kinds of applications as they grow. Here are some resources on how to build up your application in a sensible manner:

- [Taming Large React Applications with Redux](http://slides.com/joelkanzelmeyer/taming-large-redux-apps#/)
- [Real-World React and Redux - part l](https://dzone.com/articles/real-world-reactjs-and-redux-part-1)
- [Real-World React and Redux - part ll](https://dzone.com/articles/real-world-reactjs-and-redux-part-2)
- [Redux: Architecting and scaling a new web app at the NY Times](https://www.youtube.com/watch?v=lI3IcjFg9Wk)

**Tip**: It's great to plan things beforehand, but don't get caught up in ["analysis paralysis"](https://en.wikipedia.org/wiki/Analysis_paralysis). Done is always better than perfect, after all. And [Redux makes refactoring easy](https://blog.boldlisting.com/so-youve-screwed-up-your-redux-store-or-why-redux-makes-refactoring-easy-400e19606c71) if you need to.

With all that being said, the best practice is to keep coding and learning. Participate in [issues](https://github.com/reduxjs/redux/issues) and [StackOverFlow questions](https://stackoverflow.com/questions/tagged/redux). Helping others is a great way of mastering Redux.

**Tip**: A repository with an extensive amount of content about best practices and Redux architecture is shared by @markerikson at [react-redux-links](https://github.com/markerikson/react-redux-links).
