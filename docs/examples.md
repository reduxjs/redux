## Examples

### Simple Examples

Redux is distributed with a Counter and a TodoMVC example in its source code.

First, clone the repo:

```
git clone https://github.com/gaearon/redux.git
cd redux
```

Run the Counter example:

```
cd redux/examples/counter
npm install
npm start
```

Run the TodoMVC example:

```
cd ../todomvc
npm install
npm start
```

### Async and Universal Examples with Routing

These async and [universal (aka “isomorphic”)](https://medium.com/@mjackson/universal-javascript-4761051b7ae9) examples using React Router should help you get started:

* [redux-react-router-async-example](https://github.com/emmenko/redux-react-router-async-example): Work in progress. Semi-official. Only the client side. Uses React Router.
* [react-redux-universal-hot-example](https://github.com/erikras/react-redux-universal-hot-example): Universal. Uses React Router.
* [redux-example](https://github.com/quangbuule/redux-example): Universal. Uses Immutable, React Router.
* [isomorphic-counter-example](https://github.com/khtdr/redux-react-koa-isomorphic-counter-example): Universal. A bare-bone implentation of the [counter example app](https://github.com/gaearon/redux/tree/master/examples/counter). Uses promises-middleware to interact with API via Koa on the server.

Don’t be shy, add your own!
