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

The package includes a precompiled ESM build that can be used as a [`<script type="module">` tag](https://unpkg.com/redux/dist/redux.browser.mjs) directly in the browser.

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

If you're using React, you'll want the React DevTools extension as well:

- React DevTools Extension:
  - [React DevTools Extension for Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
  - [React DevTools Extension for Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

## Create a React Redux App

The recommended way to start new apps with React and Redux is by using [our official Redux+TS template for Vite](https://github.com/reduxjs/redux-templates), or by creating a new Next.js project using [Next's `with-redux` template](https://github.com/vercel/next.js/tree/canary/examples/with-redux).

Both of these already have Redux Toolkit and React-Redux configured appropriately for that build tool, and come with a small example app that demonstrates how to use several of Redux Toolkit's features.

```bash
# Vite with our Redux+TS template
# (using the `degit` tool to clone and extract the template)
npx degit reduxjs/redux-templates/packages/vite-template-redux my-app

# Next.js using the `with-redux` template
npx create-next-app --example with-redux my-app
```

We do not currently have official React Native templates, but recommend these templates for standard React Native and for Expo:

- https://github.com/rahsheen/react-native-template-redux-typescript
- https://github.com/rahsheen/expo-template-redux-typescript

## Redux Core

To install the `redux` core package by itself:

```bash
# NPM
npm install redux

# Yarn
yarn add redux
```

If you're not using a bundler, you can [access these files on unpkg](https://unpkg.com/redux/), download them, or point your package manager to them.
