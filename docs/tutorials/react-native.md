---
id: react-native-quick-start
title: React Native Quick Start
sidebar_label: React Native Quick Start
---

# Redux Toolkit React Native Quick Start

:::tip What You'll Learn

- How to manage state in React Native using Redux Toolkit and React Redux

:::

:::info Prerequisites

- Some experience using [React Native](https://reactnative.dev/docs/getting-started) as well as [Hooks](https://reactjs.org/docs/hooks-intro.html), [Navigation](https://reactnavigation.org/), [Core Components, and APIs](https://reactnative.dev/docs/components-and-apis).
- Familiarity with [ES6 syntax and features](https://www.taniarascia.com/es6-syntax-and-feature-overview/)
- Understanding of [Redux terms and concepts](https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow)

:::

## Introduction

Welcome to the Redux Toolkit React Native Quick Start tutorial! **This tutorial will briefly show how to use Redux Toolkit and React Redux to manage state in React Native**.

### How to Read This Tutorial

Here is an already set up [React Native Template Redux TypeScript](https://github.com/rahsheen/react-native-template-redux-typescript).

## Installation

Add the Redux Toolkit and React-Redux packages to your project:

If you are using npm
```sh
npm install @reduxjs/toolkit react-redux
```
If you are using yarn
```sh
yarn add @reduxjs/toolkit react-redux
```

## Create Slice

Let's imagine that we are building a Reminders app and we want to make the reminders available to the `AddReminderScreen.js` and the `HomeScreen.js`.

We need to use createSlice to define our Reminders logic. Inside of your `/src` folder create another folder called `features`, inside features create another folder called `reminders` and finally create a `remindersSlice.js` file.

We recommend putting as much as the logic for a given feature as possible into a single file, we typically refer to this as a "Slice File" because it represents the logic in the data for one Slice of your redux state.

:::tip File Structure

Redux does not care about your file structure however we recommend separate folders per feature. See [Redux FAQ: Code Structure](https://redux.js.org/faq/code-structure) for extended details on file structure.

:::

```js title="src/features/reminders/remindersSlice.js"
import { createSlice } from "@reduxjs/toolkit";

//initial state for this slice
const initialState = {
  reminders: [],
};

//here we define the slice that contains the reducer logic
export const remindersSlice = createSlice({
  name: "reminders",
  initialState,
  reducers: {
    setReminders: (state, action) => {
      state.reminders = action.payload;
    },
    addReminder: (state, action) => {
      state.reminders.push(action.payload);
    },
    deleteReminder: (state, action) => {
      state.reminders = state.reminders.filter(
        (reminder) => reminder.id !== action.payload
      );
    },
  },
});

export const { setReminders, addReminder, deleteReminder } = remindersSlice.actions;
export default remindersSlice.reducer;

```

## Create a Redux Store

## What's Next?

See [the "Usage with TypeScript" page](../usage/UsageWithTypescript.md) for extended details on how to use Redux Toolkit's APIs with TypeScript.
