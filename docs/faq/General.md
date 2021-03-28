---
id: general
title: General
hide_title: true
---

# Redux FAQ: General

## When should I learn Redux?

What to learn can be an overwhelming question for a JavaScript developer. It helps to narrow the range of options by learning one thing at a time and focusing on problems you find in your work. Redux is a pattern for managing application state. If you do not have problems with state management, you might find the benefits of Redux harder to understand. Some UI libraries (like React) have their own state management system. If you are using one of these libraries, especially if you are just learning to use them, we encourage you to learn the capabilities of that built-in system first. It might be all you need to build your application. If your application becomes so complex that you are confused about where state is stored or how state changes, then it is a good time to learn Redux.

:::tip

**We recommend that most new learners should focus on learning React first, and wait to learn Redux until after you're already comfortable with React**. That way, there's fewer new concepts to learn at once, and it's more clear what concepts are part of React and what concepts are part of Redux. You'll also have a better understanding of how using Redux fits into a React app, and why Redux can be useful.

:::

#### Further information

**Articles**

- [Deciding What Not To Learn](https://gedd.ski/post/what-not-to-learn/)
- [How to learn web frameworks](https://ux.shopify.com/how-to-learn-web-frameworks-9d447cb71e68)
- [Redux vs MobX vs Flux vs... Do you even need that?](https://goshakkk.name/redux-vs-mobx-vs-flux-etoomanychoices/)

**Discussions**

- [Ask HN: Overwhelmed with learning front-end, how do I proceed?](https://news.ycombinator.com/item?id=12882816)
- [Twitter: If you want to teach someone to use an abstraction...](https://twitter.com/acemarke/status/901329101088215044)
- [Twitter: it was never intended to be learned before...](https://twitter.com/dan_abramov/status/739961787295117312)
- [Twitter: Learning Redux before React?](https://twitter.com/dan_abramov/status/739962098030137344)
- [Twitter: The first time I used React, people told me I needed Redux...](https://twitter.com/raquelxmoss/status/901576285020856320)
- [Twitter: This was my experience with Redux...](https://twitter.com/garetmckinley/status/901500556568645634)
- [Dev.to: When is it time to use Redux?](https://dev.to/dan_abramov/comment/1n2k)

## When should I use Redux?

**Not all apps need Redux. It's important to understand the kind of application you're building, the kinds of problems that you need to solve, and what tools can best solve the problems you're facing.**

Redux helps you deal with shared state management, but like any tool, it has tradeoffs. It's not designed to be the shortest or fastest way to write code. It's intended to help answer the question "When did a certain slice of state change, and where did the data come from?", with predictable behavior. There are more concepts to learn, and more code to write. It also adds some indirection to your code, and asks you to follow certain restrictions. It's a trade-off between short term and long term productivity.

As Pete Hunt, one of the early contributors to React, says:

> You'll know when you need Flux. If you aren't sure if you need it, you don't need it.

Similarly, Dan Abramov, one of the creators of Redux, says:

> I would like to amend this: don't use Redux until you have problems with vanilla React.

**Redux is most useful when in cases when**:

- You have large amounts of application state that are needed in many places in the app
- The app state is updated frequently
- The logic to update that state may be complex
- The app has a medium or large-sized codebase, and might be worked on by many people
- You need to see how that state is being updated over time

There are also many other tools available that can help solve some of the same problems Redux does: state management, caching fetched server data, and passing data through the UI.

:::info

If you're not sure whether Redux is a good choice for your app, these resources give some more guidance:

- **[When (and when not) to reach for Redux](https://changelog.com/posts/when-and-when-not-to-reach-for-redux)**
- **[The Tao of Redux, Part 1 - Implementation and Intent](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)**
- **[You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)**

:::

In the end, Redux is just a tool. It's a great tool, and there are some great reasons to use it, but there are also reasons you might not want to use it. Make informed decisions about your tools, and understand the tradeoffs involved in each decision.

#### Further information

**Documentation**

- [Thinking in Redux: Motivation](../understanding/thinking-in-redux/Motivation.md)

**Articles**

- **[When (and when not) to reach for Redux](https://changelog.com/posts/when-and-when-not-to-reach-for-redux)**
- **[The Tao of Redux, Part 1 - Implementation and Intent](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)**
- [You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)
- [The Case for Flux](https://medium.com/swlh/the-case-for-flux-379b7d1982c6)

**Discussions**

- [Twitter: Don't use Redux until...](https://twitter.com/dan_abramov/status/699241546248536064)
- [Twitter: Redux is designed to be predictable, not concise](https://twitter.com/dan_abramov/status/733742952657342464)
- [Twitter: Redux is useful to eliminate deep prop passing](https://twitter.com/dan_abramov/status/732912085840089088)
- [Twitter: Don't use Redux unless you're unhappy with local component state](https://twitter.com/dan_abramov/status/725089243836588032)
- [Twitter: You don't need Redux if your data never changes](https://twitter.com/dan_abramov/status/737036433215610880)
- [Twitter: If your reducer looks boring, don't use redux](https://twitter.com/dan_abramov/status/802564042648944642)
- [Reddit: You don't need Redux if your app just fetches something on a single page](https://www.reddit.com/r/reactjs/comments/5exfea/feedback_on_my_first_redux_app/dagglqp/)
- [Stack Overflow: Why use Redux over Facebook Flux?](https://stackoverflow.com/questions/32461229/why-use-redux-over-facebook-flux)
- [Stack Overflow: Why should I use Redux in this example?](https://stackoverflow.com/questions/35675339/why-should-i-use-redux-in-this-example)
- [Stack Overflow: What could be the downsides of using Redux instead of Flux?](https://stackoverflow.com/questions/32021763/what-could-be-the-downsides-of-using-redux-instead-of-flux)
- [Stack Overflow: When should I add Redux to a React app?](https://stackoverflow.com/questions/36631761/when-should-i-add-redux-to-a-react-app)
- [Stack Overflow: Redux vs plain React?](https://stackoverflow.com/questions/39260769/redux-vs-plain-react/39261546#39261546)
- [Twitter: Redux is a platform for developers to build customized state management with reusable things](https://twitter.com/acemarke/status/793862722253447168)

## Can Redux only be used with React?

Redux can be used as a data store for any UI layer. The most common usage is with React and React Native, but there are bindings available for Angular, Angular 2, Vue, Mithril, and more. Redux simply provides a subscription mechanism which can be used by any other code. That said, it is most useful when combined with a declarative view implementation that can infer the UI updates from the state changes, such as React or one of the similar libraries available.

## Do I need to have a particular build tool to use Redux?

Redux is originally written in ES6 and transpiled for production into ES5 with Webpack and Babel. You should be able to use it regardless of your JavaScript build process. Redux also offers a UMD build that can be used directly without any build process at all. The [counter-vanilla](https://github.com/reduxjs/redux/tree/master/examples/counter-vanilla) example demonstrates basic ES5 usage with Redux included as a `<script>` tag. As the relevant pull request says:

> The new Counter Vanilla example is aimed to dispel the myth that Redux requires Webpack, React, hot reloading, sagas, action creators, constants, Babel, npm, CSS modules, decorators, fluent Latin, an Egghead subscription, a PhD, or an Exceeds Expectations O.W.L. level.
>
> Nope, it's just HTML, some artisanal `<script>` tags, and plain old DOM manipulation. Enjoy!
