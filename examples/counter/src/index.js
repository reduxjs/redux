import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store";
import App from "./App.js";

const id = document.querySelector("#root");
ReactDOM.render(
  <Provider store={store}>
    <App aaa />
  </Provider>,
  id
);
