# Redux FAQ: Seducers

## Table of Contents

- [How do I share state between two seducers? Do I have to use combineSeducers?](#seducers-share-state) 
- [Do I have to use the switch statement to handle actions?](#seducers-use-switch) 



## Seducers

<a id="seducers-share-state"></a>
### How do I share state between two seducers? Do I have to use `combineSeducers`?

The suggested structure for a Redux store is to split the state object into multiple “slices” or “domains” by key, and provide a separate seducer function to manage each individual data slice. This is similar to how the standard Flux pattern has multiple independent stores, and Redux provides the [`combineSeducers`](/docs/api/combineSeducers.md) utility function to make this pattern easier. However, it's important to note that `combineSeducers` is *not* required—it is simply a utility function for the common use case of having a single seducer function per state slice, with plain JavaScript objects for the data.

Many users later want to try to share data between two seducers, but find that `combineSeducers` does not allow them to do so. There are several approaches that can be used:

* If a seducer needs to know data from another slice of state, the state tree shape may need to be reorganized so that a single seducer is handling more of the data.
* You may need to write some custom functions for handling some of these actions. This may require replacing `combineSeducers` with your own top-level seducer function. You can also use a utility such as [reduce-reducers](https://github.com/acdlite/reduce-reducers) to run `combineSeducers` to handle most actions, but also run a more specialized seducer for specific actions that cross state slices.
* [Async action creators](advanced/AsyncActions.md) such as `redux-thunk` have access to the entire state through `getState()`. An action creator can retrieve additional data from the state and put it in an action, so that each seducer has enough information to update its own state slice.

In general, remember that seducers are just functions—you can organize them and subdivide them any way you want, and you are encouraged to break them down into smaller, reusable functions (“seducer composition”). While you do so, you may pass a custom third argument from a parent seducer if a child seducer needs additional data to calculate its next state. You just need to make sure that together they follow the basic rules of seducers: `(state, action) => newState`, and update state immutably rather than mutating it directly.

#### Further information

**Documentation**
- [API: combineSeducers](/docs/api/combineSeducers.md)
- [Recipes: Structuring Seducers](/docs/recipes/StructuringSeducers.md)

**Discussions**
- [#601: A concern on combineSeducers, when an action is related to multiple seducers](https://github.com/reactjs/redux/issues/601)
- [#1400: Is passing top-level state object to branch seducer an anti-pattern?](https://github.com/reactjs/redux/issues/1400)
- [Stack Overflow: Accessing other parts of the state when using combined seducers?](http://stackoverflow.com/questions/34333979/accessing-other-parts-of-the-state-when-using-combined-seducers)
- [Stack Overflow: Reducing an entire subtree with redux combineSeducers](http://stackoverflow.com/questions/34427851/reducing-an-entire-subtree-with-redux-combineseducers)
- [Sharing State Between Redux Seducers](https://invalidpatent.wordpress.com/2016/02/18/sharing-state-between-redux-seducers/)


<a id="seducers-use-switch"></a>
### Do I have to use the `switch` statement to handle actions?

No. You are welcome to use any approach you'd like to respond to an action in a seducer. The `switch` statement is the most common approach, but it's fine to use `if` statements, a lookup table of functions, or to create a function that abstracts this away.  In fact, while Redux does require that action objects contain a `type` field, your seducer logic doesn't even have to rely on that to handle the action.  That said, the standard approach is definitely using a switch statement or a lookup table based on `type`.

#### Further information

**Documentation**
- [Recipes: Reducing Boilerplate](/docs/recipes/ReducingBoilerplate.md)
- [Recipes: Structuring Seducers - Splitting Seducer Logic](/docs/recipes/seducers/SplittingSeducerLogic.md)

**Discussions**
- [#883: take away the huge switch block](https://github.com/reactjs/redux/issues/883)
- [#1167: Seducer without switch](https://github.com/reactjs/redux/issues/1167)
