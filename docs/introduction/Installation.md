---
id: installation
title: Installation
description: 'Introduction > Installation: Installation instructions for Redux and related packages'
---

# Installation

## Redux Toolkit

Redux Toolkit includes the Redux core, as well as other key packages we feel are essential for building Redux applications (such as Redux Thunk and Reselect).

It's available as a package on NPM for use with a module bundler or in a Node application:

```bash
# NPM
npm install @reduxjs/toolkit

# Yarn
yarn add @reduxjs/toolkit
```

The package includes a precompiled ESM build that can be used as a [`<script type="module">` tag](https://unpkg.com/@reduxjs/toolkit/dist/redux-toolkit.browser.mjs) directly in the browser.

## Create a React Redux App

The recommended way to start a new app with React and Redux is to use one of our [official templates](https://github.com/reduxjs/redux-templates). These come with Redux Toolkit and React-Redux already configured for that build tool, and include a small example app that shows how to use several of Redux Toolkit's features.

Use a tool like `tiged` to clone and extract a template:

```bash
# Vite + TypeScript
npx tiged reduxjs/redux-templates/packages/vite-template-redux my-app

# Expo + TypeScript
npx tiged reduxjs/redux-templates/packages/expo-template-redux-typescript my-app

# React Native + TypeScript
npx tiged reduxjs/redux-templates/packages/react-native-template-redux-typescript my-app

# Standalone Redux Toolkit app structure example
npx tiged reduxjs/redux-templates/packages/rtk-app-structure-example my-app
```

For Next.js, use [Next's `with-redux` example](https://github.com/vercel/next.js/tree/canary/examples/with-redux) and see our [Redux with Next.js guide](../usage/nextjs.mdx):

```bash
npx create-next-app --example with-redux my-app
```

## Complementary Packages

### React-Redux

Most likely, you'll also need [the `react-redux` bindings for use with React](https://github.com/reduxjs/react-redux)

```bash
npm install react-redux
```

Note that unlike Redux itself, many packages in the Redux ecosystem don't provide UMD builds, so we recommend using module bundlers like [Vite](https://vitejs.dev/) and [Webpack](https://webpack.js.org/) for the most comfortable development experience.

### Redux DevTools Extension

Redux Toolkit's `configureStore` automatically sets up integration with the [Redux DevTools](https://github.com/reduxjs/redux-devtools/tree/main/extension). You'll want to install the browser extensions to view the store state and actions:

- Redux DevTools Extension:
  - [Redux DevTools Extension for Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
  - [Redux DevTools Extension for Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)
  - [Redux DevTools Extension for Edge](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdiaponcejilbhhikei)

If you're using React, you'll want the React DevTools extension as well:

- React DevTools Extension:
  - [React DevTools Extension for Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
  - [React DevTools Extension for Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

## Redux Core

Redux Toolkit already includes and re-exports the `redux` core package, so most apps do not need to install it separately. To install the `redux` core package by itself:

```bash
# NPM
npm install redux

# Yarn
yarn add redux
```

If you're not using a bundler, you can [access these files on unpkg](https://unpkg.com/redux/), download them, or point your package manager to them.
