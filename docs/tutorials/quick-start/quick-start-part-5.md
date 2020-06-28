---
id: quick-start-part-5
title: 'Redux Quick Start, Part 5, Performance and Normalizing Data'
sidebar_label: 'Performance and Normalizing Data'
hide_title: true
description: The official Quick Start tutorial for Redux - the fastest way to learn and start using Redux today!
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

# Quick Start, Part 5: Performance and Normalizing Data

:::tip What You'll Learn

:::

:::info Prerequisites

:::

## Introduction

In [Part 3 of this tutorial](./quick-start-part-3.md), we saw how to use multiple pieces of data from the Redux store inside of React components, customize the contents of action objects before they're dispatched, and handle more complex update logic in our reducers.

So far, all the data we've worked with has been directly inside of our React client application. However, most real applications need to work with data from a server, by making HTTP API calls to fetch and save items.

In this section, we'll convert our social media app to fetch the posts and users data from an API, and add new posts by saving them to the API.

## What You've Learned

Congratulations, you've completed the Quick Start tutorial! Let's see what the final app looks like in action:

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/markerikson/redux-quickstart-example-app/tree/checkpoint-4-entitySlices/?fontsize=14&hidenavigation=1&theme=dark"
  title="redux-quick-start-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

As a reminder, here's what we covered in this section:

:::tip

:::

## What's Next?

The concepts we've covered in this tutorial should be enough to get you started building your own applications using React and Redux. Now's a great time to try working on a project yourself to solidify these concepts and see how they work in practice. If you're not sure what kind of a project to build, see [this list of app project ideas](https://github.com/florinpop17/app-ideas) for some inspiration.

The Quick Start tutorial focused on "how to use Redux correctly", rather than "how it works" or "why it works this way". In particular, Redux Toolkit is a higher-level set of abstractions and utilities, and it's helpful to understand what the abstractions in RTK are actually doing for you. Reading through the [Basic Tutorial](../../basics/README.md) and [Advanced Tutorial](../../advanced/README.md) will help you understand how to write Redux code "by hand", and why we recommend Redux Toolkit as the default way to write Redux logic.

:::info

While the concepts in the "Basic" and "Advanced" tutorials are still valid, those pages are some of the oldest parts of our docs. We'll be updating those tutorials soon to improve the explanations and show some patterns that are simpler and easier to use. Keep an eye out for those updates. We'll also be reorganizing our docs to make it easier to find information.

:::

The [Recipes](../../recipes/README.md) section has information on a number of important concepts, like [how to structure your reducers](../../recipes/structuring-reducers/StructuringReducers.md), and [our Style Guide page](../../style-guide/style-guide) has important information on our recommended patterns and best practices.

If you'd like to know more about _why_ Redux exists, what problems it tries to solve, and how it's meant to be used, see Redux maintainer Mark Erikson's posts on [The Tao of Redux, Part 1: Implementation and Intent](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/) and [The Tao of Redux, Part 2: Practice and Philosophy](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/).

If you're looking for help with Redux questions, come join [the `#redux` channel in the Reactiflux server on Discord](https://www.reactiflux.com).

Thanks for reading through this tutorial, and we hope you enjoy building applications with Redux!
