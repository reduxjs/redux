# Redux FAQ: Actions

## Table of Contents

- [Why should type be a string, or at least serializable? Why should my action types be constants?](#why-should-type-be-a-string-or-at-least-serializable-why-should-my-action-types-be-constants)
- [Is there always a one-to-one mapping between reducers and actions?](#is-there-always-a-one-to-one-mapping-between-reducers-and-actions)
- [How can I represent “side effects” such as AJAX calls? Why do we need things like “action creators”, “thunks”, and “middleware” to do async behavior?](#how-can-i-represent-side-effects-such-as-ajax-calls-why-do-we-need-things-like-action-creators-thunks-and-middleware-to-do-async-behavior)
- [What async middleware should I use? How do you decide between thunks, sagas, observables, or something else?](#what-async-middleware-should-i-use-how-do-you-decide-between-thunks-sagas-observables-or-something-else)
- [Should I dispatch multiple actions in a row from one action creator?](#should-i-dispatch-multiple-actions-in-a-row-from-one-action-creator)

## Actions

### Why should `type` be a string, or at least serializable? Why should my action types be constants?

As with state, serializable actions enable several of Redux's defining features, such as time travel debugging, and recording and replaying actions. Using something like a `Symbol` for the `type` value or using `instanceof` checks for actions themselves would break that. Strings are serializable and easily self-descriptive, and so are a better choice. Note that it _is_ okay to use Symbols, Promises, or other non-serializable values in an action if the action is intended for use by middleware. Actions only need to be serializable by the time they actually reach the store and are passed to the reducers.

We can't reliably enforce serializable actions for performance reasons, so Redux only checks that every action is a plain object, and that the `type` is defined. The rest is up to you, but you might find that keeping everything serializable helps debug and reproduce issues.

Encapsulating and centralizing commonly used pieces of code is a key concept in programming. While it is certainly possible to manually create action objects everywhere, and write each `type` value by hand, defining reusable constants makes maintaining code easier. If you put constants in a separate file, you can [check your `import` statements against typos](https://www.npmjs.com/package/eslint-plugin-import) so you can't accidentally use the wrong string.

#### Further information

**Documentation**

- [Reducing Boilerplate](/docs/recipes/ReducingBoilerplate.md#actions)

**Discussion**

- [#384: Recommend that Action constants be named in the past tense](https://github.com/reactjs/redux/issues/384)
- [#628: Solution for simple action creation with less boilerplate](https://github.com/reactjs/redux/issues/628)
- [#1024: Proposal: Declarative reducers](https://github.com/reactjs/redux/issues/1024)
- [#1167: Reducer without switch](https://github.com/reactjs/redux/issues/1167)
- [Stack Overflow: Why do you need 'Actions' as data in Redux?](http://stackoverflow.com/q/34759047/62937)
- [Stack Overflow: What is the point of the constants in Redux?](http://stackoverflow.com/q/34965856/62937)

### Is there always a one-to-one mapping between reducers and actions?

No. We suggest you write independent small reducer functions that are each responsible for updates to a specific slice of state. We call this pattern “reducer composition”. A given action could be handled by all, some, or none of them. This keeps components decoupled from the actual data changes, as one action may affect different parts of the state tree, and there is no need for the component to be aware of this. Some users do choose to bind them more tightly together, such as the “ducks” file structure, but there is definitely no one-to-one mapping by default, and you should break out of such a paradigm any time you feel you want to handle an action in many reducers.

#### Further information

**Documentation**

- [Basics: Reducers](/docs/basics/Reducers.md)
- [Recipes: Structuring Reducers](/docs/recipes/StructuringReducers.md)

**Discussions**

- [Twitter: most common Redux misconception](https://twitter.com/dan_abramov/status/682923564006248448)
- [#1167: Reducer without switch](https://github.com/reactjs/redux/issues/1167)
- [Reduxible #8: Reducers and action creators aren't a one-to-one mapping](https://github.com/reduxible/reduxible/issues/8)
- [Stack Overflow: Can I dispatch multiple actions without Redux Thunk middleware?](http://stackoverflow.com/questions/35493352/can-i-dispatch-multiple-actions-without-redux-thunk-middleware/35642783)

### How can I represent “side effects” such as AJAX calls? Why do we need things like “action creators”, “thunks”, and “middleware” to do async behavior?

This is a long and complex topic, with a wide variety of opinions on how code should be organized and what approaches should be used.

Any meaningful web app needs to execute complex logic, usually including asynchronous work such as making AJAX requests. That code is no longer purely a function of its inputs, and the interactions with the outside world are known as [“side effects”](https://en.wikipedia.org/wiki/Side_effect_%28computer_science%29)

Redux is inspired by functional programming, and out of the box, has no place for side effects to be executed. In particular, reducer functions _must_ always be pure functions of `(state, action) => newState`. However, Redux's middleware makes it possible to intercept dispatched actions and add additional complex behavior around them, including side effects.

In general, Redux suggests that code with side effects should be part of the action creation process. While that logic _can_ be performed inside of a UI component, it generally makes sense to extract that logic into a reusable function so that the same logic can be called from multiple places—in other words, an action creator function.

The simplest and most common way to do this is to add the [Redux Thunk](https://github.com/gaearon/redux-thunk) middleware that lets you write action creators with more complex and asynchronous logic. Another widely-used method is [Redux Saga](https://github.com/yelouafi/redux-saga) which lets you write more synchronous-looking code using generators, and can act like “background threads” or “daemons” in a Redux app. Yet another approach is [Redux Loop](https://github.com/raisemarketplace/redux-loop), which inverts the process by allowing your reducers to declare side effects in response to state changes and have them executed separately. Beyond that, there are _many_ other community-developed libraries and ideas, each with their own take on how side effects should be managed.

#### Further information

**Documentation**

- [Advanced: Async Actions](/docs/advanced/AsyncActions.md)
- [Advanced: Async Flow](/docs/advanced/AsyncFlow.md)
- [Advanced: Middleware](/docs/advanced/Middleware.md)

**Articles**

- [Redux Side-Effects and You](https://medium.com/@fward/redux-side-effects-and-you-66f2e0842fc3)
- [Pure functionality and side effects in Redux](http://blog.hivejs.org/building-the-ui-2/)
- [From Flux to Redux: Async Actions the easy way](http://danmaz74.me/2015/08/19/from-flux-to-redux-async-actions-the-easy-way/)
- [React/Redux Links: "Redux Side Effects" category](https://github.com/markerikson/react-redux-links/blob/master/redux-side-effects.md)
- [Gist: Redux-Thunk examples](https://gist.github.com/markerikson/ea4d0a6ce56ee479fe8b356e099f857e)

**Discussions**

- [#291: Trying to put API calls in the right place](https://github.com/reactjs/redux/issues/291)
- [#455: Modeling side effects](https://github.com/reactjs/redux/issues/455)
- [#533: Simpler introduction to async action creators](https://github.com/reactjs/redux/issues/533)
- [#569: Proposal: API for explicit side effects](https://github.com/reactjs/redux/pull/569)
- [#1139: An alternative side effect model based on generators and sagas](https://github.com/reactjs/redux/issues/1139)
- [Stack Overflow: Why do we need middleware for async flow in Redux?](http://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux)
- [Stack Overflow: How to dispatch a Redux action with a timeout?](http://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559)
- [Stack Overflow: Where should I put synchronous side effects linked to actions in redux?](http://stackoverflow.com/questions/32982237/where-should-i-put-synchronous-side-effects-linked-to-actions-in-redux/33036344)
- [Stack Overflow: How to handle complex side-effects in Redux?](http://stackoverflow.com/questions/32925837/how-to-handle-complex-side-effects-in-redux/33036594)
- [Stack Overflow: How to unit test async Redux actions to mock ajax response](http://stackoverflow.com/questions/33011729/how-to-unit-test-async-redux-actions-to-mock-ajax-response/33053465)
- [Stack Overflow: How to fire AJAX calls in response to the state changes with Redux?](http://stackoverflow.com/questions/35262692/how-to-fire-ajax-calls-in-response-to-the-state-changes-with-redux/35675447)
- [Reddit: Help performing Async API calls with Redux-Promise Middleware.](https://www.reddit.com/r/reactjs/comments/469iyc/help_performing_async_api_calls_with_reduxpromise/)
- [Twitter: possible comparison between sagas, loops, and other approaches](https://twitter.com/dan_abramov/status/689639582120415232)

### What async middleware should I use? How do you decide between thunks, sagas, observables, or something else?

There are [many async/side effect middlewares available](https://github.com/markerikson/redux-ecosystem-links/blob/master/side-effects.md), but the most commonly used ones are [`redux-thunk`](https://github.com/reduxjs/redux-thunk), [`redux-saga`](https://github.com/redux-saga/redux-saga), and [`redux-observable`](https://github.com/redux-observable/redux-observable). These are different tools, with different strengths, weaknesses, and use cases.

As a general rule of thumb:

- Thunks are best for complex synchronous logic (especially code that needs access to the entire Redux store state), and simple async logic (like basic AJAX calls). With the use of `async/await`, it can be reasonable to use thunks for some more complex promise-based logic as well.
- Sagas are best for complex async logic and decoupled "background thread"-type behavior, especially if you need to listen to dispatched actions (which is something that can't be done with thunks). They require familiarity with ES6 generator functions and `redux-saga`'s "effects" operators.
- Observables solve the same problems as sagas, but rely on RxJS to implement async behavior. They require familiarity with the RxJS API.

We recommend that most Redux users should start with thunks, and then add an additional side effect library like sagas or observables later if their app really requires handling for more complex async logic.

Since sagas and observables have the same use case, an application would normally use one or the other, but not both. However, note that **it's absolutely fine to use both thunks and either sagas or observables together**, because they solve different problems.

**Articles**

- [Decembersoft: What is the right way to do asynchronous operations in Redux?](https://decembersoft.com/posts/what-is-the-right-way-to-do-asynchronous-operations-in-redux/)
- [Decembersoft: Redux-Thunk vs Redux-Saga](https://decembersoft.com/posts/redux-thunk-vs-redux-saga/)
- [Redux-Thunk vs Redux-Saga: an overview](https://medium.com/@shoshanarosenfield/redux-thunk-vs-redux-saga-93fe82878b2d)
- [Redux-Saga V.S. Redux-Observable](https://hackmd.io/s/H1xLHUQ8e#side-by-side-comparison)

**Discussions**

- [Reddit: discussion of using thunks and sagas together, and pros and cons of sagas](https://www.reddit.com/r/reactjs/comments/8vglo0/react_developer_map_by_adamgolab/e1nr597/)
- [Stack Overflow: Pros/cons of using redux-saga with ES6 generators vs redux-thunk with ES2017 async/await](https://stackoverflow.com/questions/34930735/pros-cons-of-using-redux-saga-with-es6-generators-vs-redux-thunk-with-es2017-asy)
- [Stack Overflow: Why use Redux-Observable over Redux-Saga?](https://stackoverflow.com/questions/40021344/why-use-redux-observable-over-redux-saga/40027778#40027778)

### Should I dispatch multiple actions in a row from one action creator?

There's no specific rule for how you should structure your actions. Using an async middleware like Redux Thunk certainly enables scenarios such as dispatching multiple distinct but related actions in a row, dispatching actions to represent progression of an AJAX request, dispatching actions conditionally based on state, or even dispatching an action and checking the updated state immediately afterwards.

In general, ask if these actions are related but independent, or should actually be represented as one action. Do what makes sense for your own situation but try to balance the readability of reducers with readability of the action log. For example, an action that includes the whole new state tree would make your reducer a one-liner, but the downside is now you have no history of _why_ the changes are happening, so debugging gets really difficult. On the other hand, if you emit actions in a loop to keep them granular, it's a sign that you might want to introduce a new action type that is handled in a different way.

Try to avoid dispatching several times synchronously in a row in the places where you're concerned about performance. There are a number of addons and approaches that can batch up dispatches as well.

#### Further information

**Documentation**

- [FAQ: Performance - Reducing Update Events](/docs/faq/Performance.md#performance-update-events)

**Articles**

- [Idiomatic Redux: Thoughts on Thunks, Sagas, Abstraction, and Reusability](http://blog.isquaredsoftware.com/2017/01/idiomatic-redux-thoughts-on-thunks-sagas-abstraction-and-reusability/#multiple-dispatching)

**Discussions**

- [#597: Valid to dispatch multiple actions from an event handler?](https://github.com/reactjs/redux/issues/597)
- [#959: Multiple actions one dispatch?](https://github.com/reactjs/redux/issues/959)
- [Stack Overflow: Should I use one or several action types to represent this async action?](http://stackoverflow.com/questions/33637740/should-i-use-one-or-several-action-types-to-represent-this-async-action/33816695)
- [Stack Overflow: Do events and actions have a 1:1 relationship in Redux?](http://stackoverflow.com/questions/35406707/do-events-and-actions-have-a-11-relationship-in-redux/35410524)
- [Stack Overflow: Should actions be handled by reducers to related actions or generated by action creators themselves?](http://stackoverflow.com/questions/33220776/should-actions-like-showing-hiding-loading-screens-be-handled-by-reducers-to-rel/33226443#33226443)
- [Twitter: "Good thread on the problems with Redux Thunk..."](https://twitter.com/dan_abramov/status/800310164792414208)
