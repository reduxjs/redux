---
id: application-setup 
title: Application Setup
sidebar_label: Application Setup
---

# Application Setup

## Introduction

Welcome to the Application Setup section! **This page will focus on showing you how to set up Redux in different environments like Create React App/Vite, React Native, and Next.**

## React Native
This section will teach you how to setup a React Native project with Redux Toolkit. If you want to start a React Native project with the Redux Toolkit already setup in your terminal, run the following command:
```sh
  expo init my-app --template react-native-redux-template
```
You can also follow this link to view the template on [**GitHub**](https://github.com/betomoedano/react-native-template-redux-toolkit). If you want to use Typescript checkout this [**Template**](https://github.com/rahsheen/react-native-template-redux-typescript).
### File Structure
Typically in React Native projects, we have an `src` folder that contains the code for our application such as components, screens, etc. And at the root of the project, we have the `App.js` that usually is the initial file to the app.

#### Where do I put the slices?
Although Redux doesn't care about your file structure we recommend putting all your slices under a folder called `features` the idea is that you pick the concept or multiple concepts of your app and create separate folders per feature. 
For example, if we have a counter slice our file structure would look like this: `src/features/counter/counterSlice.js`

#### Where do I put the store? 
We recommend keeping the `store.js` file inside a folder named `app` under `src`. If you are using Typescript and have a predefined version of the [Redux hooks](https://react-redux.js.org/api/hooks) we recommend putting these hooks inside the `app` folder as well.

:::tip
See [Redux FAQ: Code Structure](https://redux.js.org/faq/code-structure) for extended details on file structure.
:::

### Adding the React Redux Provider
The [`<Provider>`](https://react-redux.js.org/api/provider) component makes the Redux `store` available to any nested components that need to access the Redux store. 

In the example below, we added the `<Provider>` to the `<App>` since it is at the very top of our component hierarchy.

```js title="App.js"
import Home from "./src/screens/Home";
import { Provider } from "react-redux";
import { store } from "./src/app/store";

export default function App() {
  return (
    <Provider store={store}>
      <Home />
    </Provider>
  );
}
```

### Additional considerations when initializing the app
In some cases, you could need access to the Redux store in the `<App>` component but since we are adding the Provider inside the `<App>` we can not access the store within the `<App>`. 
In the example below we show how to solve this by creating an `<AppWrapper>` which contains the `<Provider>` and the `<App>`.

```js title="App.js"
import { View, Text } from "react-native";
import { Provider } from "react-redux";
import { store } from "./src/app/store";
import { useSelector } from "@reduxjs/toolkit";

export default function AppWrapper() {
   <Provider store={store}>
      <App>
   </Provider>
}

function App() {
  const count = useSelector((state) => state.counter.count);
  return (
      <View>
        <Text>Counter value: {count}</Text>
      </View>
  );
}
```

## Further Resources

- See [the Redux Toolkit TypeScript Next.js Example](https://github.com/vercel/next.js/tree/canary/examples/with-redux) for how to integrate Next.js with Redux Toolkit.
- See [the Create React App/Vite Example](https://github.com/learnwithjason/lets-learn-redux-toolkit) for how to integrate React/Vite with Redux Toolkit.