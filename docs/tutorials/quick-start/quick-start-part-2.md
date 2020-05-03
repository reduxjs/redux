---
id: quick-start-part-2
title: Redux Quick Start - Part 2
sidebar_label: 'Building a Redux App'
hide_title: true
description: The official Quick Start tutorial for Redux - the fastest way to learn and start using Redux today!
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

# Quick Start, Part 2: Building a React + Redux App

:::tip What You'll Learn

- How to use Redux Toolkit and React-Redux to build a typical app
- Key guidelines and patterns for using Redux

:::

:::info Prerequisites

- Reading [Part 1](./quick-start-part-1.md) to understand Redux terms and concepts

:::

## Introduction

In [Part 1](./quick-start-part-1.md) of this tutorial, we looked at how Redux can help us build maintainable apps by giving us a single central place to put global app state. We also talked about core Redux concepts like dispatching action objects, using reducer functions that return new state values, and writing async logic using thunks. Finally, we saw how APIs like `configureStore` and `createSlice` from Redux Toolkit and `Provider` and `useSelector` from React-Redux work together to let us write Redux logic and interact with that logic from our React components.

Now that you have some idea of what these pieces are, it's time to put that knowledge into practice. We're going to build a small social media feed app, which will include a number of features that demonstrate some real-world use cases. This will help you understand how to use Redux in your own applications.

:::caution

The example app is not meant as a complete production-ready project. The goal is to help you learn the Redux APIs and typical usage patterns, and point you in the right direction using some limited examples. Also, some of the early pieces we build will be updated later on to show better ways to do things. Please read through the whole tutorial to see all the concepts in use.

:::

### Project Setup

For this tutorial, we've created a pre-configured starter project that already has React and Redux set up, includes some default styling, and has a fake REST API that will allow us to write actual API requests in our app. You'll use this as the basis for writing the actual application code.

To get started, you can open and fork this CodeSandbox:

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/markerikson/redux-quickstart-example-app/tree/master/?fontsize=14&hidenavigation=1&theme=dark"
  title="redux-quick-start-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

You can also [clone the same project from this Github repo](https://github.com/markerikson/redux-quickstart-example-app). You can install the tools for the project with `npm install`, and start it with `npm start`.

> We'd like to thank [Tania Rascia](https://www.taniarascia.com/), whose [Using Redux with React](https://www.taniarascia.com/redux-react-guide/) tutorial helped inspire the example in this page. It also uses her [Primitive UI CSS starter](https://taniarascia.github.io/primitive/) for styling.

#### Creating a New Redux + React Project

Once you've finished this tutorial, you'll probably want to try working on your own projects. We recommend using the [Redux templates for Create-React-App](https://github.com/reduxjs/cra-template-redux) as the fastest way to create a new Redux + React project. It comes with Redux Toolkit and React-Redux already configured, using [the same "counter" app example you saw in Part 1](./quick-start-part-1.md). This lets you jump right into writing your actual application code without having to add the Redux packages and set up the store.

If you want to know specific details on how to add Redux to a project, see this explanation:

<DetailedExplanation title="Detailed Explanation: Adding Redux to a React Project">

**TODO Explanation here**

</DetailedExplanation>
