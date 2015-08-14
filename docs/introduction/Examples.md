# Examples

Redux is distributed with a few examples in its [source code](https://github.com/rackt/redux/tree/master/examples).  
**To run any of them, clone the repo and run `npm install` both in the root and the example folder.**

>##### Note on Copying
>If you copy Redux examples outside their folders, remove these lines from their `webpack.config.js`:
>
>```js
>alias: {
>   'redux': path.join(__dirname, '..', '..', 'src')
>},
>```
>and
>```js
>{
>   test: /\.js$/,
>   loaders: ['babel'],
>   include: path.join(__dirname, '..', '..', 'src')
>},
```
>
> Otherwise they’ll try to resolve Redux to a relative `src` folder, and the build will fail.

## Counter

Run the [Counter](https://github.com/rackt/redux/tree/master/examples/counter) example:

```
git clone https://github.com/gaearon/redux.git

cd redux
npm install

cd examples/counter
npm install

npm start
open http://localhost:3000/
```

It covers:

* Basic Redux flow;
* Testing.

## TodoMVC

Run the [TodoMVC](https://github.com/rackt/redux/tree/master/examples/todomvc) example:

```
git clone https://github.com/gaearon/redux.git

cd redux
npm install

cd examples/todomvc
npm install

npm start
open http://localhost:3000/
```

It covers:

* Redux flow with two reducers;
* Updating nested data;
* Testing.

## Async

Run the [Async](https://github.com/rackt/redux/tree/master/examples/async) example:

```
git clone https://github.com/gaearon/redux.git

cd redux
npm install

cd examples/async
npm install

npm start
open http://localhost:3000/
```

It covers:

* Basic async Redux flow with [redux-thunk](https://github.com/gaearon/redux-thunk);
* Caching responses and showing a spinner while data is fetching;
* Invalidating the cached data.

## Real World

Run the [Real World](https://github.com/rackt/redux/tree/master/examples/real-world) example:

```
git clone https://github.com/gaearon/redux.git

cd redux
npm install

cd examples/real-world
npm install

npm start
open http://localhost:3000/
```

It covers:

* Real-world async Redux flow;
* Keeping entities in a normalized entity cache;
* A custom middleware for API calls;
* Caching responses and showing a spinner while data is fetching;
* Pagination;
* Routing.

## More Examples

You can find more examples in [Awesome Redux](https://github.com/xgrommx/awesome-redux).

