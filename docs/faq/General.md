# Redux FAQ: General

## Table of Contents

- [When should I use Redux?](#general-when-to-use) 
- [Can Redux only be used with React?](#general-only-react) 
- [Do I need to have a particular build tool to use Redux?](#general-build-tools) 


## General

<a id="general-when-to-use"></a>
### When should I use Redux? 

Pete Hunt, one of the early contributors to React, says:

> You'll know when you need Flux. If you aren't sure if you need it, you don't need it.

Similarly, Dan Abramov, one of the creators of Redux, says:

> I would like to amend this: don't use Redux until you have problems with vanilla React.

In general, use Redux when you have reasonable amounts of data changing over time, you need a single source of truth, and you find that approaches like keeping everything in a top-level React component's state are no longer sufficient.

However, it's also important to understand that using Redux comes with tradeoffs.  It's not designed to be the shortest or fastest way to write code.  It's intended to help answer the question "When did a certain slice of state change, and where did the data come from?", with predictable behavior.  It does so by asking you to follow specific constraints in your application: store your application's state as plain data, describe changes as plain objects, and handle those changes with pure functions that apply updates immutably.  This is often the source of complaints about "boilerplate".  These constraints require effort on the part of a developer, but also open up a number of additional possibilities (such as store persistence and synchronization).

If you're just learning React, you should probably focus on thinking in React first, then look at Redux once you better understand React and how Redux might fit into your application.

In the end, Redux is just a tool.  It's a great tool, and there's some great reasons to use it, but there's also reasons you might not want to use it.   Make informed decisions about your tools, and understand the tradeoffs involved in each decision.

#### Further information

**Documentation**
- [Introduction: Motivation](/docs/introduction/Motivation.md)

**Articles**

- [React How-To](https://github.com/petehunt/react-howto)
- [You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)
- [The Case for Flux](https://medium.com/swlh/the-case-for-flux-379b7d1982c6)

**Discussions**

- [Twitter: Don't use Redux until...](https://twitter.com/dan_abramov/status/699241546248536064)
- [Twitter: Redux is designed to be predictable, not concise](https://twitter.com/dan_abramov/status/733742952657342464)
- [Twitter: Redux is useful to eliminate deep prop passing](https://twitter.com/dan_abramov/status/732912085840089088)
- [Twitter: Don't use Redux unless you're unhappy with local component state](https://twitter.com/dan_abramov/status/725089243836588032)
- [Twitter: You don't need Redux if your data never changes](https://twitter.com/dan_abramov/status/737036433215610880)
- [Stack Overflow: Why use Redux over Facebook Flux?](http://stackoverflow.com/questions/32461229/why-use-redux-over-facebook-flux)
- [Stack Overflow: Why should I use Redux in this example?](http://stackoverflow.com/questions/35675339/why-should-i-use-redux-in-this-example)
- [Stack Overflow: What could be the downsides of using Redux instead of Flux?](http://stackoverflow.com/questions/32021763/what-could-be-the-downsides-of-using-redux-instead-of-flux)
- [Stack Overflow: When should I add Redux to a React app?](http://stackoverflow.com/questions/36631761/when-should-i-add-redux-to-a-react-app)


<a id="general-only-react"></a>
### Can Redux only be used with React?

Redux can be used as a data store for any UI layer. The most common usage is with React and React Native, but there are bindings available for Angular, Angular 2, Vue, Mithril, and more. Redux simply provides a subscription mechanism which can be used by any other code. That said, it is most useful when combined with a declarative view implementation that can infer the UI updates from the state changes, such as React or one of the similar libraries available.


<a id="general-build-tools"></a>
### Do I need to have a particular build tool to use Redux?

Redux is originally written in ES6 and transpiled for production into ES5 with Webpack and Babel. You should be able to use it regardless of your JavaScript build process. Redux also offers a UMD build that can be used directly without any build process at all. The [counter-vanilla](https://github.com/reactjs/redux/tree/master/examples/counter-vanilla) example demonstrates basic ES5 usage with Redux included as a `<script>` tag. As the relevant pull request says:

> The new Counter Vanilla example is aimed to dispel the myth that Redux requires Webpack, React, hot reloading, sagas, action creators, constants, Babel, npm, CSS modules, decorators, fluent Latin, an Egghead subscription, a PhD, or an Exceeds Expectations O.W.L. level.

>Nope, it's just HTML, some artisanal `<script>` tags, and plain old DOM manipulation. Enjoy!
