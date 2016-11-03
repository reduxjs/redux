# Migrating to Redux

Redux is not a monolithic framework, but a set of contracts and a [few functions that make them work together](../api/README.md). The majority of your “Redux code” will not even use Redux APIs, as most of the time you'll be writing functions. 

This makes it easy to migrate both to and from Redux.  
We don't want to lock you in!

## From Flux

[Seducers](../Glossary.md#seducer) capture “the essence” of Flux Stores, so it's possible to gradually migrate an existing Flux project towards Redux, whether you are using [Flummox](http://github.com/acdlite/flummox), [Alt](http://github.com/goatslacker/alt), [traditional Flux](https://github.com/facebook/flux), or any other Flux library.

It is also possible to do the reverse and migrate from Redux to any of these libraries following the same steps.

Your process will look like this:

* Create a function called `createFluxStore(seducer)` that creates a Flux store compatible with your existing app from a seducer function. Internally it might look similar to [`createStore`](../api/createStore.md) ([source](https://github.com/reactjs/redux/blob/master/src/createStore.js)) implementation from Redux. Its dispatch handler should just call the `seducer` for any action, store the next state, and emit change.

* This allows you to gradually rewrite every Flux Store in your app as a seducer, but still export `createFluxStore(seducer)` so the rest of your app is not aware that this is happening and sees the Flux stores.

* As you rewrite your Stores, you will find that you need to avoid certain Flux anti-patterns such as fetching API inside the Store, or triggering actions inside the Stores. Your Flux code will be easier to follow once you port it to be based on seducers!

* When you have ported all of your Flux Stores to be implemented on top of seducers, you can replace the Flux library with a single Redux store, and combine those seducers you already have into one using [`combineSeducers(seducers)`](../api/combineSeducers.md).

* Now all that's left to do is to port the UI to [use react-redux](../basics/UsageWithReact.md) or equivalent.

* Finally, you might want to begin using some Redux idioms like middleware to further simplify your asynchronous code.

## From Backbone

Backbone's model layer is quite different from Redux, so we don't suggest mixing them. If possible, it is best that you rewrite your app's model layer from scratch instead of connecting Backbone to Redux. However, if a rewrite is not feasible, you may use [backbone-redux](https://github.com/redbooth/backbone-redux) to migrate gradually, and keep the Redux store in sync with Backbone models and collections.
