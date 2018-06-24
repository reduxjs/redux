# Alternatives

TL;DR All state management libraries have their pros and cons and there is no best choice. There is just one that suits your needs. Comparing them is a bit meaningless in a sense that they all solve the problem in different ways.

## Introduction

We will talk about the following tools / libraries :

- [setState](https://reactjs.org/docs/state-and-lifecycle.html)
- [Redux](https://redux.js.org)
- [Mobx](https://mobx.js.org)
- [Mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)

NB: There are other state management libraries that we will not compare here.

Requirements :

- familiar with [React components](https://reactjs.org/docs/components-and-props.html), [React state and lifecycle](https://reactjs.org/docs/state-and-lifecycle.html)

Note on setState :

Before diving into a state management library, it is really important to have used setState and faced some troubles maintaining state between deeply nested nodes or sibling nodes.

There is a great article on this subject written by Dan Abramov : [You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367).

## Overview

#### Core concepts

As we cannot compare the incomparable (these tools solve the same issue but differently), we will describe the core concepts of these libraries.

|                               | setState   | Redux      | Mobx               | Mobx-state-tree |
| ----------------------------- | ---------- | ---------- | ------------------ | --------------- |
| [Location](#location)         | component  | global     | component / global | global          |
| [Observable](#observable)     | plain data | plain data | observable data    | observable data |
| [Subscription](#subscription) | implicit   | explicit   | implicit           | explicit        |
| [Shape](#shape)               |            | graph      | tree               | tree            |
| [Immutable](#immutable)       | yes        | no         | yes                | yes             |
|                               |            |            |                    |                 |

#### Inheritent features

All these libraries allow you to have :

- Easy time traveling
- Easy testing
- Fancy debugging tools

### Location

This is where your store live. Does it live outside of the DOM tree or inside a specific component ? This changes whether you control your state locally or globally.

### Observable

[Observer pattern](https://en.wikipedia.org/wiki/Observer_pattern) allows you to subscribe to changes on an object.

### Subscription

_Implicit_ subscription means you do not have to do anything to specify what data you want to subscribe to changes.

_Explicit_ subscription means you have to specify what data you need to listen to changes for your rendering.

#### Redux

In redux you have to subscribe to store node manually using map functions and connect to your component.

### Shape

Or one store vs multiple stores. The libraries we analyze use either a _tree_ or a _graph_.

The shape of your data fits a certain shape of a store. If the relationships between your entities form a graph (tree), then you will _probably_ find it easier to use a graph (tree).

#### Redux

Although it is possible to have multiple stores in your Redux application (you can use your own combineReducers function), it is not recommended. The Redux store is a tree. Dealing with this data structure is easier when your data are normalized.

#### Mobx

Mobx is at first a graph, which means you can have multiple stores. A good practice though is to have a root store that contains all the others -> your store is now a tree.

Note : if you have troubles normalizing you state like your domain data, you can use [normalizr](https://github.com/paularmstrong/normalizr)

### Immutable

From [ImmutableJS doc](https://facebook.github.io/immutable-js/) :

> Immutable data cannot be changed once created, leading to much simpler application development, no defensive copying, and enabling advanced memoization and change detection techniques with simple logic. Persistent data presents a mutative API which does not update the data in-place, but instead always yields new updated data.

To update your store you have to use immutable function. You can also use [ImmutableJS](https://facebook.github.io/immutable-js/) to help you.

Note : If you find it hard to update an immutable store you can leverages [ES6 Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to update your immutable store in a mutable way.

See also [immer](https://github.com/mweststrate/immer) library to update your immutable store in a mutable way.

## What is best suitable for you ?

The answer depends on multiple aspects among :

- size of your team : if you are alone, you know everything about the app, having obscure and tedious-to-maintain abstractions will probably not help you.
- size and deadline of the project : do not over engineer a small project.
- maintainability : enforce good practices to make your app easier to maintain.

### Learning curve

If your team is new with state management ecosystem, you have to consider the learning curve of the tools you are using.

Usually, it is easier for people coming from Object Oriented Programming to understand and use Mobx or Mobx-state-tree.

Redux pattern is more common for Functional Programming.

#### Redux

Special note for the boilerplate code. A lot of complains about Redux is that is requires a lot of boilerplate code to do a simple action.

On the other side, other people find it clearer because there is no added abstraction layer.

If you fear boilerplate code but like Redux, you can use tools to abstract or generate the code like [reduxsauce](https://github.com/infinitered/reduxsauce) for instance.

## Conclusion

> It does not matter.

Focus on having a great product that makes users happy.

Do not listen to others, make your own decisions, if a library suits your needs, then use it.

If you have some time, play around with some libraries out there and experience how one solve the issues and compare to the others.

If you have to use one and do not like it, do not feel blocked. They are all extremely flexible and allow you to build tools to model them into something you like better.
