# Redux FAQ: Performance

## Table of Contents

- [How well does Redux “scale” in terms of performance and architecture?](#performance-scaling)
- [Won't calling “all my reducers” for each action be slow?](#performance-all-reducers)
- [Do I have to deep-clone my state in a reducer? Isn't copying my state going to be slow?](#performance-clone-state)
- [How can I reduce the number of store update events?](#performance-update-events)
- [Will having “one state tree” cause memory problems? Will dispatching many actions take up memory?](#performance-state-memory)



## Performance

<a id="performance-scaling"></a>
### How well does Redux “scale” in terms of performance and architecture? 

While there's no single definitive answer to this, most of the time this should not be a concern in either case.

The work done by Redux generally falls into a few areas: processing actions in middleware and reducers (including object duplication for immutable updates), notifying subscribers after actions are dispatched, and updating UI components based on the state changes. While it's certainly *possible* for each of these to become a performance concern in sufficiently complex situations, there's nothing inherently slow or inefficient about how Redux is implemented. In fact, React Redux in particular is heavily optimized to cut down on unnecessary re-renders, and React-Redux v5 shows noticeable improvements over earlier versions.

Redux may not be as efficient out of the box when compared to other libraries.  For maximum rendering performance in a React application, state should be stored in a normalized shape, many individual components should be connected to the store instead of just a few, and connected list components should pass item IDs to their connected child list items (allowing the list items to look up their own data by ID).  This minimizes the overall amount of rendering to be done.  Use of memoized selector functions is also an important performance consideration.

As for architecture, anecdotal evidence is that Redux works well for varying project and team sizes. Redux is currently used by hundreds of companies and thousands of developers, with several hundred thousand monthly installations from NPM. One developer reported:

> for scale, we have ~500 action types, ~400 reducer cases, ~150 components, 5 middlewares, ~200 actions, ~2300 tests

#### Further information

**Documentation**
- [Recipes: Structuring Reducers - Normalizing State Shape](/docs/recipes/reducers/NormalizingStateShape.md)


**Articles**
- [How to Scale React Applications](https://www.smashingmagazine.com/2016/09/how-to-scale-react-applications/) (accompanying talk: [Scaling React Applications](https://vimeo.com/168648012))
- [High-Performance Redux](http://somebody32.github.io/high-performance-redux/)
- [Improving React and Redux Perf with Reselect](http://blog.rangle.io/react-and-redux-performance-with-reselect/)
- [Encapsulating the Redux State Tree](http://randycoulman.com/blog/2016/09/13/encapsulating-the-redux-state-tree/)
- [React/Redux Links: Performance - Redux](https://github.com/markerikson/react-redux-links/blob/master/react-performance.md#redux-performance)

**Discussions**
- [#310: Who uses Redux?](https://github.com/reactjs/redux/issues/310)
- [#1751: Performance issues with large collections](https://github.com/reactjs/redux/issues/1751)
- [React Redux #269: Connect could be used with a custom subscribe method](https://github.com/reactjs/react-redux/issues/269)
- [React Redux #407: Rewrite connect to offer an advanced API](https://github.com/reactjs/react-redux/issues/407)
- [React Redux #416: Rewrite connect for better performance and extensibility](https://github.com/reactjs/react-redux/pull/416)
- [Redux vs MobX TodoMVC Benchmark: #1](https://github.com/mweststrate/redux-todomvc/pull/1)
- [Reddit: What's the best place to keep the initial state?](https://www.reddit.com/r/reactjs/comments/47m9h5/whats_the_best_place_to_keep_the_initial_state/)
- [Reddit: Help designing Redux state for a single page app](https://www.reddit.com/r/reactjs/comments/48k852/help_designing_redux_state_for_a_single_page/)
- [Reddit: Redux performance issues with a large state object?](https://www.reddit.com/r/reactjs/comments/41wdqn/redux_performance_issues_with_a_large_state_object/)
- [Reddit: React/Redux for Ultra Large Scale apps](https://www.reddit.com/r/javascript/comments/49box8/reactredux_for_ultra_large_scale_apps/)
- [Twitter: Redux scaling](https://twitter.com/NickPresta/status/684058236828266496)
- [Twitter: Redux vs MobX benchmark graph - Redux state shape matters](https://twitter.com/dan_abramov/status/720219615041859584)
- [Stack Overflow: How to optimize small updates to props of nested components?](http://stackoverflow.com/questions/37264415/how-to-optimize-small-updates-to-props-of-nested-component-in-react-redux)
- [Chat log: React/Redux perf - updating a 10K-item Todo list](https://gist.github.com/markerikson/53735e4eb151bc228d6685eab00f5f85)
- [Chat log: React/Redux perf - single connection vs many connections](https://gist.github.com/markerikson/6056565dd65d1232784bf42b65f8b2ad)


<a id="performance-all-reducers"></a>
### Won't calling “all my reducers” for each action be slow?

It's important to note that a Redux store really only has a single reducer function. The store passes the current state and dispatched action to that one reducer function, and lets the reducer handle things appropriately.

Obviously, trying to handle every possible action in a single function does not scale well, simply in terms of function size and readability, so it makes sense to split the actual work into separate functions that can be called by the top-level reducer. In particular, the common suggested pattern is to have a separate sub-reducer function that is responsible for managing updates to a particular slice of state at a specific key. The `combineReducers()` that comes with Redux is one of the many possible ways to achieve this. It's also highly suggested to keep your store state as flat and as normalized as possible. Ultimately, though, you are in charge of organizing your reducer logic any way you want.

However, even if you happen to have many different reducer functions composed together, and even with deeply nested state, reducer speed is unlikely to be a problem. JavaScript engines are capable of running a very large number of function calls per second, and most of your reducers are probably just using a `switch` statement and returning the existing state by default in response to most actions.

If you actually are concerned about reducer performance, you can use a utility such as [redux-ignore](https://github.com/omnidan/redux-ignore) or [reduxr-scoped-reducer](https://github.com/chrisdavies/reduxr-scoped-reducer) to ensure that only certain reducers listen to specific actions. You can also use [redux-log-slow-reducers](https://github.com/michaelcontento/redux-log-slow-reducers) to do some performance benchmarking.

#### Further information

**Discussions**
- [#912: Proposal: action filter utility](https://github.com/reactjs/redux/issues/912)
- [#1303: Redux Performance with Large Store and frequent updates](https://github.com/reactjs/redux/issues/1303)
- [Stack Overflow: State in Redux app has the name of the reducer](http://stackoverflow.com/questions/35667775/state-in-redux-react-app-has-a-property-with-the-name-of-the-reducer/35674297)
- [Stack Overflow: How does Redux deal with deeply nested models?](http://stackoverflow.com/questions/34494866/how-does-redux-deals-with-deeply-nested-models/34495397)


<a id="performance-clone-state"></a>
### Do I have to deep-clone my state in a reducer? Isn't copying my state going to be slow?

Immutably updating state generally means making shallow copies, not deep copies. Shallow copies are much faster than deep copies, because fewer objects and fields have to be copied, and it effectively comes down to moving some pointers around.

However, you *do* need to create a copied and updated object for each level of nesting that is affected. Although that shouldn't be particularly expensive, it's another good reason why you should keep your state normalized and shallow if possible.

> Common Redux misconception: you need to deeply clone the state. Reality: if something inside doesn't change, keep its reference the same!

#### Further information

**Documentation**
- [Recipes: Structuring Reducers - Prerequisite Concepts](/docs/recipes/reducers/PrerequisiteConcepts.md)
- [Recipes: Structuring Reducers - Immutable Update Patterns](/docs/recipes/reducers/ImmutableUpdatePatterns.md)

**Discussions**
- [#454: Handling big states in reducer](https://github.com/reactjs/redux/issues/454)
- [#758: Why can't state be mutated?](https://github.com/reactjs/redux/issues/758)
- [#994: How to cut the boilerplate when updating nested entities?](https://github.com/reactjs/redux/issues/994)
- [Twitter: common misconception - deep cloning](https://twitter.com/dan_abramov/status/688087202312491008)
- [Cloning Objects in JavaScript](http://www.zsoltnagy.eu/cloning-objects-in-javascript/)


<a id="performance-update-events"></a>
### How can I reduce the number of store update events?

Redux notifies subscribers after each successfully dispatched action (i.e. an action reached the store and was handled by reducers). In some cases, it may be useful to cut down on the number of times subscribers are called, particularly if an action creator dispatches multiple distinct actions in a row.

If you use React, note that you can improve performance of multiple synchronous dispatches by wrapping them in `ReactDOM.unstable_batchedUpdates()`, but this API is experimental and may be removed in any React release so don't rely on it too heavily. Take a look at [redux-batched-actions](https://github.com/tshelburne/redux-batched-actions) (a higher-order reducer that lets you dispatch several actions as if it was one and “unpack” them in the reducer), [redux-batched-subscribe](https://github.com/tappleby/redux-batched-subscribe) (a store enhancer that lets you debounce subscriber calls for multiple dispatches), or [redux-batch](https://github.com/manaflair/redux-batch) (a store enhancer that handles dispatching an array of actions with a single subscriber notification).

#### Further information

**Discussions**
- [#125: Strategy for avoiding cascading renders](https://github.com/reactjs/redux/issues/125)
- [#542: Idea: batching actions](https://github.com/reactjs/redux/issues/542)
- [#911: Batching actions](https://github.com/reactjs/redux/issues/911)
- [#1813: Use a loop to support dispatching arrays](https://github.com/reactjs/redux/pull/1813)
- [React Redux #263: Huge performance issue when dispatching hundreds of actions](https://github.com/reactjs/react-redux/issues/263)

**Libraries**
- [Redux Addons Catalog: Store - Change Subscriptions](https://github.com/markerikson/redux-ecosystem-links/blob/master/store.md#store-change-subscriptions)


<a id="performance-state-memory"></a>
### Will having “one state tree” cause memory problems? Will dispatching many actions take up memory?

First, in terms of raw memory usage, Redux is no different than any other JavaScript library. The only difference is that all the various object references are nested together into one tree, instead of maybe saved in various independent model instances such as in Backbone. Second, a typical Redux app would probably have somewhat *less* memory usage than an equivalent Backbone app because Redux encourages use of plain JavaScript objects and arrays rather than creating instances of Models and Collections. Finally, Redux only holds onto a single state tree reference at a time. Objects that are no longer referenced in that tree will be garbage collected, as usual.

Redux does not store a history of actions itself. However, the Redux DevTools do store actions so they can be replayed, but those are generally only enabled during development, and not used in production.

#### Further information

**Documentation**
- [Docs: Async Actions](/docs/advanced/AsyncActions.md)

**Discussions**
- [Stack Overflow: Is there any way to "commit" the state in Redux to free memory?](http://stackoverflow.com/questions/35627553/is-there-any-way-to-commit-the-state-in-redux-to-free-memory/35634004)
- [Reddit: What's the best place to keep initial state?](https://www.reddit.com/r/reactjs/comments/47m9h5/whats_the_best_place_to_keep_the_initial_state/)
