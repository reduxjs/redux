---
id: historical-context
title: Historical Context
sidebar_label: Historical Context
hide_title: true
---

# Historical Context

To understand Redux at a deeper level, it's necessary to understand the underlying Flux architecture, its functional programming influences and its minimal API philosophy.

## Flux

When React was first released, the [Flux](https://facebook.github.io/flux/docs/in-depth-overview.html) architecture came along with it. The Flux pattern influenced subsequent state management libraries and Flux implementations. Redux was one of them.

Flux prescribed unidirectional data flow, views derived from store data and action creators to support a semantic API that describes all application changes. You can see this in some of Redux's influences and goals:

- Make state mutations predictable by imposing certain restrictions on how and when updates can happen.
- Every change is described as an action
- The idea of "dispatching actions"
- The use of "action creator functions" to create those action objects
  that "update logic" should be decoupled from the rest of the application and centralized
- And more

On top of Flux, Redux added additional design goals, such as:

- Hot reloading
- Time travel for debugging
- Single source of truth, often meaning one large global store instead of a possibility of multiple stores
- Add nice functional programming properties like composing

## Functional Programming

To understand why the [functional programming](https://en.wikipedia.org/wiki/Functional_programming) paradigm is so key, here are some of functional programming's key principles

- A declarative programming paradigm, which means programming is done with expressions or declarations instead of statements.
- Calling a function f twice with the same value for an argument x produces the same result f(x) each time
- Eliminating side effects, changes in state that do not depend on the function inputs, can make it much easier to understand and predict the behavior of a program, which is one of the key motivations for the development of functional programming.

Functional programming principles are borrowed to help make state computation more predictable since UIs are notoriously stateful and hard to conceptualize. State is limited to concerns with the view and help the UI produce different views depending on the differing state.

Other references to functional programming:

- Higher order functions: functions that return another function and/or take function(s) as an argument
- Pure functions: functions with no side effects

## Minimal API

Founders placed a lot of trust in the community, rather than taking a stance on what everyone should do. This increases the flexibility of Redux, in the way it's used and in what way it grows. In order to stay lightweight and flexible enough for industry use, small applications and other community needs, nothing is built in.

> [the] reason the middleware API exists in the first place is because we explicitly did not want to prescribe a particular solution for async." My previous Flux library, Flummox, had what was essentially a promise middleware built in. It was convenient for some, but because it was built in, you couldn't change or opt-out of its behavior. With Redux, we knew that the community would come up with a multitude of better async solutions that whatever we could have built in ourselves.
> Redux Thunk is promoted in the docs because it's the absolute bare minimum solution. We were confident that the community would come up with something different and/or better. We were right!”
> From: https://hashnode.com/ama/with-redux-cisteui6p005gzx53fstg8t6l
