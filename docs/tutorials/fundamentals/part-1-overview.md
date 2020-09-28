---
id: part-1-overview
title: 'Redux Fundamentals, Part 1: Redux Overview'
sidebar_label: 'Redux Overview'
hide_title: true
description: 'The official Fundamentals tutorial for Redux: learn the fundamentals of using Redux'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

# Redux Fundamentals, Part 1: Redux Overview

:::tip What You'll Learn

- What Redux is and why you might want to use it
- The basic pieces that make up a Redux app

:::

## Introduction

Welcome to the Redux Fundamentals tutorial! **This tutorial will introduce you to the core concepts, principles, and patterns for using Redux**. By the time you finish, you should understand the different pieces that make up a Redux app, how data flows when using Redux, and our standard recommended patterns for building Redux apps.

In Part 1 of this tutorial, we'll briefly look at a minimal example of a working Redux app to see what the pieces are, and in [Part 2](./part-2-concept-data-flow.md) we'll look at those pieces in more detail and how data flows in a Redux application.

Starting in [Part 3](./part-3-actions-reducers.md), we'll use that knowledge to build a small example app that demonstrates how these pieces fit together and talk about how Redux works in practice. After we finish building the working example app "by hand" so that you can see exactly what's happening, we'll talk about some of the standard patterns and abstractions typically used with Redux. Finally, we'll see how these lower-level examples translate into the higher-level patterns that we recommend for actual usage in real applications.

### How to Read This Tutorial

This tutorial focuses on the lower-level concepts you need to know to understand Redux. However, **most of the code samples in this tutorial are only meant as examples of concepts to explain "how Redux works"**. They do not include our recommended patterns for efficiently using Redux, and so **these code samples should not be used for writing real applications**.

:::info

If you're looking to learn more about how Redux is used to write real-world applications, please see:

- [**The "Modern Redux" page in this tutorial**](./part-9-modern-redux.md), which shows how to convert the low-level examples into the modern patterns we do recommend for real-world usage
- [**The "Redux Essentials" tutorial**](../essentials/part-1-overview-concepts.md), which teaches "how to use Redux, the right way" for real-world apps, using our latest recommended patterns and practices.

:::

We've tried to keep these explanations beginner-friendly, but we do need to make some assumptions about what you know already so that we can focus on explaining Redux itself. **This tutorial assumes that you know**:

:::important Prerequisites

- Familiarity with [HTML & CSS](https://internetingishard.com/).
- Familiarity with [ES6 syntax and features](https://www.taniarascia.com/es6-syntax-and-feature-overview/)
- Understanding of [the array and object spread operators](https://javascript.info/rest-parameters-spread#spread-syntax)
- Knowledge of React terminology: [JSX](https://reactjs.org/docs/introducing-jsx.html), [State](https://reactjs.org/docs/state-and-lifecycle.html), [Function Components, Props](https://reactjs.org/docs/components-and-props.html), and [Hooks](https://reactjs.org/docs/hooks-intro.html)
- Knowledge of [asynchronous JavaScript](https://javascript.info/promise-basics) and [making AJAX requests](https://javascript.info/fetch)

:::

**If you're not already comfortable with those topics, we encourage you to take some time to become comfortable with them first, and then come back to learn about Redux**. We'll be here when you're ready!

Finally, you should make sure that you have the React and Redux DevTools extensions installed in your browser:

- React DevTools Extension:
  - [React DevTools Extension for Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
  - [React DevTools Extension for Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
- Redux DevTools Extension:
  - [Redux DevTools Extension for Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
  - [Redux DevTools Extension for Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

## What is Redux?

It helps to understand what this "Redux" thing is in the first place. What does it do? What problems does it help me solve? Why would I want to use it?

**Redux is a pattern and library for managing and updating application state, using events called "actions".** It serves as a centralized store for state that needs to be used across your entire application, with rules ensuring that the state can only be updated in a predictable fashion.

### Why Should I Use Redux?

Redux helps you manage "global" state - state that is needed across many parts of your application.

**The patterns and tools provided by Redux make it easier to understand when, where, why, and how the state in your application is being updated, and how your application logic will behave when those changes occur**. Redux guides you towards writing code that is predictable and testable, which helps give you confidence that your application will work as expected.

### When Should I Use Redux?

Redux helps you deal with shared state management, but like any tool, it has tradeoffs. There's more concepts to learn, and more code to write. It also adds some indirection to your code, and asks you to follow certain restrictions. It's a trade-off between short term and long term productivity.

Redux is more useful when:

- You have large amounts of application state that are needed in many places in the app
- The app state is updated frequently over time
- The logic to update that state may be complex
- The app has a medium or large-sized codebase, and might be worked on by many people

**Not all apps need Redux. Take some time to think about the kind of app you're building, and decide what tools would be best to help solve the problems you're working on.**

:::info Want to Know More?

If you're not sure whether Redux is a good choice for your app, these resources give some more guidance:

- **[Redux FAQ: When should I use Redux?](../../faq/General.md#when-should-i-use-redux)**
- **[You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)**
- **[The Tao of Redux, Part 1 - Implementation and Intent](http://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)**

:::

### Redux Libraries and Tools

Redux is a small standalone JS library. However, it is commonly used with several other packages:

#### React-Redux

Redux can integrate with any UI framework, and is most frequently used with React. [**React-Redux**](https://react-redux.js.org/) is our official package that lets your React components interact with a Redux store by reading pieces of state and dispatching actions to update the store.

#### Redux Toolkit

[**Redux Toolkit**](https://redux-toolkit.js.org) is our recommended approach for writing Redux logic. It contains packages and functions that we think are essential for building a Redux app. Redux Toolkit builds in our suggested best practices, simplifies most Redux tasks, prevents common mistakes, and makes it easier to write Redux applications.

#### Redux DevTools Extension

The [**Redux DevTools Extension**](https://github.com/zalmoxisus/redux-devtools-extension) shows a history of the changes to the state in your Redux store over time. This allows you to debug your applications effectively, including using powerful techniques like "time-travel debugging".
