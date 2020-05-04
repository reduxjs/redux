---
id: quick-start-part-3
title: Redux Quick Start - Part 3
sidebar_label: 'Using Redux Data'
hide_title: true
description: The official Quick Start tutorial for Redux - the fastest way to learn and start using Redux today!
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

# Quick Start, Part 3: Using Redux Data

:::tip What You'll Learn

- Using Redux data in multiple React components
- Organizing logic that dispatches actions
- Writing more complex update logic in reducers

:::

:::info Prerequisites

- Familiarity with the [Redux data flow and React-Redux APIs from Part 2](./quick-start-part-2.md)

:::

## Introduction

In [Part 2 of this tutorial](./quick-start-part-2.md), we saw how to start from an empty Redux+React project setup, add a new slice of state, and create React components that can read data from the Redux store and dispatch actions to update that data. We also looked at how data flows through the application, with components dispatching actions, reducers processing actions and returning new state, and components reading the new state and rerendering the UI.

Now that you know the core steps to write Redux logic, we're going to use those same steps to add some new features to our social media feed that will make it more useful: viewing a single post, editing existing posts, showing post author details, post timestamps, and reaction buttons.

## TODO

Actually write all the content for this page :)

Here's what our app looks like after all these changes:

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/markerikson/redux-quickstart-example-app/tree/checkpoint-2-reactionButtons/?fontsize=14&hidenavigation=1&theme=dark"
  title="redux-quick-start-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

## What You've Learned

Here's what we covered in this section:

:::tip

- **Any React component can use data from the Redux store as needed**
  - Any component can read any data that is in the Redux store
  - Multiple components can read the same data, even at the same time
  - Components should try to return just the data they need from selectors
  - Components can combine multiple pieces of data to generate the right UI
  - Any component can dispatch actions to cause state updates
- **Redux action creators can prepare action objects with the right contents**
  - `createSlice` and `createAction` can accept a "prepare callback" that returns the action payload
  - Unique IDs and other random values should be put in the action, not calculated in the reducer
- **Reducers should contain the actual state update logic**
  - Reducers can contain whatever logic is needed to calculate the next state
  - Action objects should contain just enough info to describe what happened

:::
