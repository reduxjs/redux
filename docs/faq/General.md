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

#### Further information

**Documentation**
- [Introduction: Motivation](/docs/introduction/Motivation.md)

**Discussions**
- [React How-To](https://github.com/petehunt/react-howto)
- [Twitter: Don't use Redux until...](https://twitter.com/dan_abramov/status/699241546248536064)
- [The Case for Flux](https://medium.com/swlh/the-case-for-flux-379b7d1982c6)
- [Stack Overflow: Why use Redux over Facebook Flux?](http://stackoverflow.com/questions/32461229/why-use-redux-over-facebook-flux)
- [Stack Overflow: Why should I use Redux in this example?](http://stackoverflow.com/questions/35675339/why-should-i-use-redux-in-this-example)
- [Stack Overflow: What could be the downsides of using Redux instead of Flux?](http://stackoverflow.com/questions/32021763/what-could-be-the-downsides-of-using-redux-instead-of-flux)

<a id="general-only-react"></a>
### Can Redux only be used with React?

Redux can be used as a data store for any UI layer. The most common usage is with React and React Native, but there are bindings available for Angular, Angular 2, Vue, Mithril, and more. Redux simply provides a subscription mechanism which can be used by any other code. That said it is most useful when combined with a declarative view implementation that can infer the UI updates from the state changes.

<a id="general-build-tools"></a>
### Do I need to have a particular build tool to use Redux?

Redux is originally written in ES6 and transpiled for production into ES5 with Webpack and Babel. You should be able to use it regardless of your JavaScript build process. Redux also offers a UMD build that can be used directly without any build process at all. The [counter-vanilla](https://github.com/reactjs/redux/tree/master/examples/counter-vanilla) example demonstrates basic ES5 usage with Redux included as a `<script>` tag. As the relevant pull request says:

> The new Counter Vanilla example is aimed to dispel the myth that Redux requires Webpack, React, hot reloading, sagas, action creators, constants, Babel, npm, CSS modules, decorators, fluent Latin, an Egghead subscription, a PhD, or an Exceeds Expectations O.W.L. level.

>Nope, it's just HTML, some artisanal `<script>` tags, and plain old DOM manipulation. Enjoy!
