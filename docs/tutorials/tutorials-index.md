---
id: tutorials-index
slug: index
title: 'Redux Tutorials Index'
sidebar_label: 'Tutorials Index'
description: 'Overview of the Redux tutorial pages'
---

import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

# Redux Tutorials Index

This page is the single index of official tutorials for Redux, Redux Toolkit, and React-Redux. The Redux Toolkit and React-Redux sections of this site have short quick-start pages, but the full-length tutorials live here so that each concept is explained once.

## Quick Starts

The quick starts show the fastest way to get a basic example running. Each one takes a few minutes.

- The [**Quick Start** page](./quick-start.md) shows how to add Redux Toolkit and React-Redux to a React + TypeScript app and wire up a counter slice, including how to infer the `RootState` and `AppDispatch` types and define pre-typed hooks. It ends with a short section on what to leave out in a plain JavaScript project.
- The [**RTK Query Quick Start**](/toolkit/tutorials/rtk-query) shows how to define an API slice and fetch data with generated React hooks.
- If you are using Next.js, the [**Setup with Next.js** guide](../usage/nextjs.mdx) covers creating a store per request and providing it to the App Router.

## Full Tutorials

We have two different full-size tutorials:

- The [**Redux Essentials tutorial**](./essentials/part-1-overview-concepts) is a "top-down" tutorial that teaches "how to use Redux the right way", using our latest recommended APIs and best practices (Redux Toolkit for the logic, React-Redux hooks for the UI, and "RTK Query" for fetching and caching data). It builds a "real-world" style example application and teaches Redux concepts along the way.
- The [**Redux Fundamentals tutorial**](./fundamentals/part-1-overview.md) is a "bottom-up" tutorial that teaches "how Redux works" from first principles and without any abstractions, and why standard Redux usage patterns exist. It ends by showing how Redux Toolkit simplifies those patterns.

:::tip

**We recommend starting with the [Redux Essentials tutorial](./essentials/part-1-overview-concepts)**, since it covers the key points you need to know about how to get started using our modern Redux Toolkit package to write actual applications.

If you want to understand what Redux Toolkit's APIs are doing for you under the hood, and why RTK is the recommended approach, read the Redux Fundamentals tutorial afterwards.

:::

## Migrating Existing Redux Code to Redux Toolkit

If you already know Redux and want to convert an existing application, the [**"Modern Redux with Redux Toolkit" page in the Redux Fundamentals tutorial**](./fundamentals/part-8-modern-redux.md) shows how RTK's APIs simplify Redux usage patterns and how to handle that migration. The [**Migrating to Modern Redux** guide](../usage/migrating-to-modern-redux.mdx) covers the same conversion for each kind of legacy Redux code (store setup, reducers, thunks, sagas, `connect`) in more depth.

## Using TypeScript

The [**Usage with TypeScript** guide](../usage/UsageWithTypescript.md) covers the standard patterns for typing a Redux store, hooks, reducers, thunks, and middleware. The [Redux Toolkit TypeScript page](/toolkit/usage/usage-with-typescript) documents the specific TS behavior of each RTK API, and the [Redux + TS template for Vite](https://github.com/reduxjs/redux-templates/tree/master/packages/vite-template-redux) comes with those patterns already configured.

## Video Resources

### Learn Modern Redux Livestream

Redux maintainer Mark Erikson appeared on the "Learn with Jason" show to explain how we recommend using Redux today. The show includes a live-coded example app that shows how to use Redux Toolkit and React-Redux hooks with TypeScript, as well as the RTK Query data fetching APIs.

See [the "Learn Modern Redux" show notes page](https://www.learnwithjason.dev/let-s-learn-modern-redux) for a transcript and links to the example app source.

<LiteYouTubeEmbed
    id="9zySeP5vH9c"
    title="Learn Modern Redux - Redux Toolkit, React-Redux Hooks, and RTK Query"
/>

### RTK Query Video Course

If you prefer a video course, you can [watch this RTK Query video course by Lenz Weber-Tronic, the creator of RTK Query, for free at Egghead](https://egghead.io/courses/rtk-query-basics-query-endpoints-data-flow-and-typescript-57ea3c43?af=7pnhj6) or take a look at the first lesson right here:

<div style={{position:"relative",paddingTop:"56.25%"}}>
  <iframe
    src="https://app.egghead.io/lessons/redux-course-introduction-and-application-walk-through-for-rtk-query-basics/embed?af=7pnhj6"
    title="RTK Query Video course at Egghead: Course Introduction and Application Walk through for RTK Query Basics"
    frameborder="0"
    allowfullscreen
    style={{position:"absolute",top:0,left:0,width:"100%",height:"100%"}}
  ></iframe>
</div>

See the [Videos](./videos.md) page for more recorded talks and courses.

## Legacy Redux Toolkit Tutorials

The Redux Toolkit docs previously had a set of "Basic/Intermediate/Advanced" tutorials. They were removed in favor of the Essentials and Fundamentals tutorials above. If you'd like to browse the old tutorials, the content files are still available in the repo's history:

[Redux Toolkit repo: legacy "Basic/Intermediate/Advanced" tutorial files](https://github.com/reduxjs/redux-toolkit/tree/e85eb17b39/docs/tutorials)
