# Examples

### Simple Examples

Redux is distributed with a Counter and a TodoMVC example in its [source code](https://github.com/gaearon/redux/tree/master/examples).

First, clone the repo:

```
git clone https://github.com/gaearon/redux.git
cd redux
```

Run the [Counter](https://github.com/gaearon/redux/tree/master/examples/counter) example:

```
cd redux/
npm install
cd examples/counter
npm install
npm start
```

Now you can open http://localhost:3000/ in your browser to try the app

Run the [TodoMVC](https://github.com/gaearon/redux/tree/master/examples/todomvc) example:

```
cd ../todomvc
npm install
npm start
```

>##### Important Note
>For examples to work outside the Redux folder, remove these lines from their `webpack.config.js`:
>
>```js
>alias: {
>  'redux': path.join(__dirname, '..', '..', 'src')
>},
>```
>and
>```js
>{
>  test: /\.js$/,
>  loaders: ['babel'],
>  include: path.join(__dirname, '..', '..', 'src')
>},
```
>
> Otherwise they’ll try to resolve Redux to a relative `src` folder, and the build will fail.

## Advanced Examples

We will have some official examples with data fetching, universal rendering and hot reloading soon, but for now, you can check out some examples in [Awesome Redux](https://github.com/xgrommx/awesome-redux).

