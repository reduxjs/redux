---
id: faq
title: FAQ Index
sidebar_label: FAQ Index
hide_title: true
---

# Redux FAQ

## Table of Contents

- **General**
  - [When should I learn Redux?](faq/General.md#when-should-i-learn-redux)
  - [When should I use Redux?](faq/General.md#when-should-i-use-redux)
  - [Can Redux only be used with React?](faq/General.md#can-redux-only-be-used-with-react)
  - [Do I need to have a particular build tool to use Redux?](faq/General.md#do-i-need-to-have-a-particular-build-tool-to-use-redux)
- **Reducers**
  - [How do I share state between two reducers? Do I have to use combineReducers?](faq/Reducers.md#how-do-i-share-state-between-two-reducers-do-i-have-to-use-combinereducers)
  - [Do I have to use the switch statement to handle actions?](faq/Reducers.md#do-i-have-to-use-the-switch-statement-to-handle-actions)
- **Organizing State**
  - [Do I have to put all my state into Redux? Should I ever use React's setState()?](faq/OrganizingState.md#do-i-have-to-put-all-my-state-into-redux-should-i-ever-use-reacts-setstate)
  - [Can I put functions, promises, or other non-serializable items in my store state?](faq/OrganizingState.md#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state)
  - [How do I organize nested or duplicate data in my state?](faq/OrganizingState.md#how-do-i-organize-nested-or-duplicate-data-in-my-state)
  - [Should I put form state or other UI state in my store?](faq/OrganizingState.md#should-i-put-form-state-or-other-ui-state-in-my-store)
- **Store Setup**
  - [Can or should I create multiple stores? Can I import my store directly, and use it in components myself?](faq/StoreSetup.md#can-or-should-i-create-multiple-stores-can-i-import-my-store-directly-and-use-it-in-components-myself)
  - [Is it OK to have more than one middleware chain in my store enhancer? What is the difference between next and dispatch in a middleware function?](faq/StoreSetup.md#is-it-ok-to-have-more-than-one-middleware-chain-in-my-store-enhancer-what-is-the-difference-between-next-and-dispatch-in-a-middleware-function)
  - [How do I subscribe to only a portion of the state? Can I get the dispatched action as part of the subscription?](faq/StoreSetup.md#how-do-i-subscribe-to-only-a-portion-of-the-state-can-i-get-the-dispatched-action-as-part-of-the-subscription)
- **Actions**
  - [Why should type be a string, or at least serializable? Why should my action types be constants?](faq/Actions.md#why-should-type-be-a-string-or-at-least-serializable-why-should-my-action-types-be-constants)
  - [Is there always a one-to-one mapping between reducers and actions?](faq/Actions.md#is-there-always-a-one-to-one-mapping-between-reducers-and-actions)
  - [How can I represent “side effects” such as AJAX calls? Why do we need things like “action creators”, “thunks”, and “middleware” to do async behavior?](faq/Actions.md#how-can-i-represent-side-effects-such-as-ajax-calls-why-do-we-need-things-like-action-creators-thunks-and-middleware-to-do-async-behavior)
  - [What async middleware should I use? How do you decide between thunks, sagas, observables, or something else?](faq/Actions.md#what-async-middleware-should-i-use-how-do-you-decide-between-thunks-sagas-observables-or-something-else)
  - [Should I dispatch multiple actions in a row from one action creator?](faq/Actions.md#should-i-dispatch-multiple-actions-in-a-row-from-one-action-creator)
- **Immutable Data**
  - [What are the benefits of immutability?](faq/ImmutableData.md#what-are-the-benefits-of-immutability)
  - [Why is immutability required by Redux?](faq/ImmutableData.md#why-is-immutability-required-by-redux)
  - [What approaches are there for handling data immutability? Do I have to use Immutable.JS?](faq/ImmutableData.md#what-approaches-are-there-for-handling-data-immutability-do-i-have-to-use-immutable-js)
  - [What are the issues with using JavaScript for immutable operations?](faq/ImmutableData.md#what-are-the-issues-with-using-plain-javascript-for-immutable-operations)
- **Using Immutable.JS with Redux**
  - [Why should I use an immutable-focused library such as Immutable.JS?](recipes/UsingImmutableJS.md#why-should-i-use-an-immutable-focused-library-such-as-immutable-js)
  - [Why should I choose Immutable.JS as an immutable library?](recipes/UsingImmutableJS.md#why-should-i-choose-immutable-js-as-an-immutable-library)
  - [What are the issues with using Immutable.JS?](recipes/UsingImmutableJS.md#what-are-the-issues-with-using-immutable-js)
  - [Is Immutable.JS worth the effort?](recipes/UsingImmutableJS.md#is-using-immutable-js-worth-the-effort)
  - [What are some opinionated Best Practices for using Immutable.JS with Redux?](recipes/UsingImmutableJS.md#what-are-some-opinionated-best-practices-for-using-immutable-js-with-redux)
- **Code Structure**
  - [What should my file structure look like? How should I group my action creators and reducers in my project? Where should my selectors go?](faq/CodeStructure.md#what-should-my-file-structure-look-like-how-should-i-group-my-action-creators-and-reducers-in-my-project-where-should-my-selectors-go)
  - [How should I split my logic between reducers and action creators? Where should my “business logic” go?](faq/CodeStructure.md#how-should-i-split-my-logic-between-reducers-and-action-creators-where-should-my-business-logic-go)
  - [Why should I use action creators?](faq/CodeStructure.md#why-should-i-use-action-creators)
  - [Where should websockets and other persistent connections live?](faq/CodeStructure.md#where-should-websockets-and-other-persistent-connections-live)
- **Performance**
  - [How well does Redux “scale” in terms of performance and architecture?](faq/Performance.md#how-well-does-redux-scale-in-terms-of-performance-and-architecture)
  - [Won't calling “all my reducers” for each action be slow?](faq/Performance.md#wont-calling-all-my-reducers-for-each-action-be-slow)
  - [Do I have to deep-clone my state in a reducer? Isn't copying my state going to be slow?](faq/Performance.md#do-i-have-to-deep-clone-my-state-in-a-reducer-isnt-copying-my-state-going-to-be-slow)
  - [How can I reduce the number of store update events?](faq/Performance.md#how-can-i-reduce-the-number-of-store-update-events)
  - [Will having “one state tree” cause memory problems? Will dispatching many actions take up memory?](faq/Performance.md#will-having-one-state-tree-cause-memory-problems-will-dispatching-many-actions-take-up-memory)
  - [Will caching remote data cause memory problems?](faq/Performance.md#will-caching-remote-data-cause-memory-problems)
- **Design Decisions**
  - [Why doesn't Redux pass the state and action to subscribers?](faq/DesignDecisions.md#why-doesnt-redux-pass-the-state-and-action-to-subscribers)
  - [Why doesn't Redux support using classes for actions and reducers?](faq/DesignDecisions.md#why-doesnt-redux-support-using-classes-for-actions-and-reducers)
  - [Why does the middleware signature use currying?](faq/DesignDecisions.md#why-does-the-middleware-signature-use-currying)
  - [Why does applyMiddleware use a closure for dispatch?](faq/DesignDecisions.md#why-does-applymiddleware-use-a-closure-for-dispatch)
  - [Why doesn't `combineReducers` include a third argument with the entire state when it calls each reducer?](faq/DesignDecisions.md#why-doesnt-combinereducers-include-a-third-argument-with-the-entire-state-when-it-calls-each-reducer)
  - [Why doesn't mapDispatchToProps allow use of return values from `getState()` or `mapStateToProps()`?](faq/DesignDecisions.md#why-doesnt-mapdispatchtoprops-allow-use-of-return-values-from-getstate-or-mapstatetoprops)
- **React Redux**
  - [Why should I use React-Redux?](faq/ReactRedux.md#why-should-i-use-react-redux)
  - [Why isn't my component re-rendering, or my mapStateToProps running?](faq/ReactRedux.md#why-isnt-my-component-re-rendering-or-my-mapstatetoprops-running)
  - [Why is my component re-rendering too often?](faq/ReactRedux.md#why-is-my-component-re-rendering-too-often)
  - [How can I speed up my mapStateToProps?](faq/ReactRedux.md#how-can-i-speed-up-my-mapstatetoprops)
  - [Why don't I have this.props.dispatch available in my connected component?](faq/ReactRedux.md#why-dont-i-have-this-props-dispatch-available-in-my-connected-component)
  - [Should I only connect my top component, or can I connect multiple components in my tree?](faq/ReactRedux.md#should-i-only-connect-my-top-component-or-can-i-connect-multiple-components-in-my-tree)
- **Miscellaneous**
  - [Are there any larger, “real” Redux projects?](faq/Miscellaneous.md#are-there-any-larger-real-redux-projects)
  - [How can I implement authentication in Redux?](faq/Miscellaneous.md#how-can-i-implement-authentication-in-redux)
