# Next Steps

If you landed in this section, you might be wondering at this point, "what
should I do now?". Here is where we provide some essential tips / suggestions on
how to diverge from creating trivial TodoMVC apps to a Real world application.

## Tips & Considerations - Real World

Whenever we decide to create a new project, we tend to bypass several aspects
that in the future may slow us down. In a _Real world project_ we have to
consider several things before we start coding, such as: How to Configure a
`Store`, `Store` size, data structure, state model, middlewares, environment,
Async transactions, immutability and etc..

Those above are some of the main considerations we have to think beforehand.
It's not an easy task but there are some strategies on how to go through it
smoothly.

### UI vs State

One of the biggest challenges developers face when using Redux is to _ Describe
UI state with Data_. The majority software programs out there are just _data
transformation_ and having the clear understanding that UI's are simply data
beautifully presented facilitates the process of Building it.

_Nicolas Hery_ describes it really well in
_"[Describing UI state with data](http://nicolashery.com/describing-ui-state-with-data/)"_.
Also, it's always good to know
_[When to use Redux](https://medium.com/@fastphrase/when-to-use-redux-f0aa70b5b1e2)_,
because a lot of times
_[You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)_

### Configure a Store

To configure a `store` we have to make major considerations on which middlewares
to use, there are several libraries out there, but the most famous ones are:

#### Perform Asynchronous dispatch

* [redux-thunk](https://github.com/gaearon/redux-thunk)
  * Redux Thunk middleware allows you to write action creators that return a
    function instead of an action. The thunk can be used to delay the dispatch
    of an action, or to dispatch only if a certain condition is met. It
    incorporates the methods `dispatch` and `getState` as parameters.
* [redux-saga](https://github.com/redux-saga/redux-saga)
  * redux-saga is a library that aims to make application side effects (i.e.
    asynchronous like data fetching and impure procedures such as accessing the
    browser cache) in a manageable and efficient way to execute. It's simple to
    test as it uses the ES6 feature called `Generators`, making the flow easy to
    read as sychronous code.
* [redux-observable](https://github.com/redux-observable/redux-observable)
  * redux-observable is a middleware for redux that is inspired by redux-thunk.
    It allows developers to dispatch a function that returns an `observable`,
    `promise` or `iterable` of action(s). When the observable emits an action,
    or the promise resolves an action, or the iterable gives an action out, that
    action is then dispatched as usual.

#### Development Purposes / debug

* [redux-devtools](https://github.com/gaearon/redux-devtools)
  * Redux DevTools is a development time package that provides power-ups for
    your Redux development workflow.
* [redux-logger](https://github.com/evgenyrodionov/redux-logger)
  * Redux-logger displays / `console.log` all actions that are being dispatched
    to the store.

To be able to choose one of these libraries we must take into account whether we
are building a small or large application. Usability, code standards, and
javascript script knowledge may also be a factor considered. Overall, all of
them are similar.

**Tip**: Think of middlewares as **skills** you give to your `store`. i.e: By
Atributting the `redux-thunk` to your store, you're giving the `Store` the
ability to _dispatch Async Actions_

### Naming Convention

A big source of confusion when it comes to a large project is **Naming
Convetion**, this is just as important as the project itself. Defining naming
convetion for you actions (or any variable) at the very beginning of a project
is a game changer for its maintenance in a long run. The key is to keep it
consistent

Great source:
[A Simple Naming Convention for Action Creators in Redux](https://decembersoft.com/posts/a-simple-naming-convention-for-action-creators-in-redux-js/)
and
[Redux Patterns and Anti-Patterns](https://tech.affirm.com/redux-patterns-and-anti-patterns-7d80ef3d53bc)

**Tip**: Set up an opinionated code formatter, such as
[Prettier](https://github.com/prettier/prettier). Major key to success.

### Scalability

There is no magic to analyze and predict how much your application is going to
grow, and it's okay ! Redux seriously takes it into consideration by simplifing
how the store is created and even easier if you need to replicate it, after all
a store is nothing but piece of `Object` that can be nested, copied and etc.
However, there are some great strategies that can be applied for a better
developement, please check it out below:

* [Taming Large React Applications with Redux](http://slides.com/joelkanzelmeyer/taming-large-redux-apps#/)
* [Real-World React and Redux - part l](https://dzone.com/articles/real-world-reactjs-and-redux-part-1)
* [Real-World React and Redux - part ll](https://dzone.com/articles/real-world-reactjs-and-redux-part-2)
* [Redux: Architecting and scaling a new web app at the NY Times](https://www.youtube.com/watch?v=lI3IcjFg9Wk)

**Tip**: It's great to plan things beforehand, but don't over-think or get
caught up on
[Analysis paralysis](https://en.wikipedia.org/wiki/Analysis_paralysis), Move
forward! Done is always better than perfect, after all,
[Redux makes refactoring easy](https://blog.boldlisting.com/so-youve-screwed-up-your-redux-store-or-why-redux-makes-refactoring-easy-400e19606c71),
if you need to.

With all that being said, the **Main Tip** is to keep practicing and learning.
Participate in [_forums_](https://news.ycombinator.com/item?id=15343001),
[_StackOverFlow_](https://stackoverflow.com/questions/tagged/redux), and helping
others is a great way of mastering Redux.

**Tip**: A respository with an extensive amount of content about **Best
practices** and **Redux Architecture** shared by **@markerikson** at
[react-redux-links](https://github.com/markerikson/react-redux-links) - Check it
out !
