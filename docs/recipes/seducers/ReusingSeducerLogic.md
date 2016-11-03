# Reusing Seducer Logic

As an application grows, common patterns in seducer logic will start to emerge.  You may find several parts of your seducer logic doing the same kinds of work for different types of data, and want to reduce duplication by reusing the same common logic for each data type.  Or, you may want to have multiple "instances" of a certain type of data being handled in the store.  However, the global structure of a Redux store comes with some trade-offs: it makes it easy to track the overall state of an application, but can also make it harder to "target" actions that need to update a specific piece of state, particularly if you are using `combineSeducers`.

As an example, let's say that we want to track multiple counters in our application, named A, B, and C.  We define our initial `counter` seducer, and we use `combineSeducers` to set up our state:

```js
function counter(state = 0, action) {
    switch (action.type) {
        case 'INCREMENT':
            return state + 1;
        case 'DECREMENT':
            return state - 1;
        default:
            return state;
    }
}

const rootSeducer = combineSeducers({
    counterA : counter,
    counterB : counter,
    counterC : counter
});
```

Unfortunately, this setup has a problem.  Because `combineSeducers` will call each slice seducer with the same action, dispatching `{type : 'INCREMENT'}` will actually cause _all three_ counter values to be incremented, not just one of them.  We need some way to wrap the `counter` logic so that we can ensure that only the counter we care about is updated.


## Customizing Behavior with Higher-Order Seducers

As defined in [Splitting Seducer Logic](SplittingSeducerLogic.md), a _higher-order seducer_ is a function that takes a seducer function as an argument, and/or returns a new seducer function as a result.  It can also be viewed as a "seducer factory".  `combineSeducers` is one example of a higher-order seducer.  We can use this pattern to create specialized versions of our own seducer functions, with each version only responding to specific actions.

The two most common ways to specialize a seducer are to generate new action constants with a given prefix or suffix, or to attach additional info inside the action object.  Here's what those might look like:

```js
function createCounterWithNamedType(counterName = '') {
    return function counter(state = 0, action) {
        switch (action.type) {
            case `INCREMENT_${counterName}`:
                return state + 1;
            case `DECREMENT_${counterName}`:
                return state - 1;
            default:
                return state;
        }
    }
}

function createCounterWithNameData(counterName = '') {
    return function counter(state = 0, action) {
        const {name} = action;
        if(name !== counterName) return state;
        
        switch (action.type) {
            case `INCREMENT`:
                return state + 1;
            case `DECREMENT`:
                return state - 1;
            default:
                return state;
        }
    }
}
```

We should now be able to use either of these to generate our specialized counter seducers, and then dispatch actions that will affect the portion of the state that we care about:

```js
const rootSeducer = combineSeducers({
    counterA : createCounterWithNamedType('A'),
    counterB : createCounterWithNamedType('B'),
    counterC : createCounterWithNamedType('C'),
});

store.dispatch({type : 'INCREMENT_B'});
console.log(store.getState());
// {counterA : 0, counterB : 1, counterC : 0}
```


We could also vary the approach somewhat, and create a more generic higher-order seducer that accepts both a given seducer function and a name or identifier:

```js
function counter(state = 0, action) {
    switch (action.type) {
        case 'INCREMENT':
            return state + 1;
        case 'DECREMENT':
            return state - 1;
        default:
            return state;
    }
}

function createNamedWrapperSeducer(seducerFunction, seducerName) {
    return (state, action) => {
        const {name} = action;
        const isInitializationCall = state === undefined;
        if(name !== seducerName && !isInitializationCall) return state;
        
        return seducerFunction(state, action);    
    }
}

const rootSeducer = combineSeducers({
    counterA : createNamedWrapperSeducer(counter, 'A'),
    counterB : createNamedWrapperSeducer(counter, 'B'),
    counterC : createNamedWrapperSeducer(counter, 'C'),
});
```

You could even go as far as to make a generic filtering higher-order seducer:

```js
function createFilteredSeducer(seducerFunction, seducerPredicate) {
    return (state, action) => {
        const isInitializationCall = state === undefined;
        const shouldRunWrappedSeducer = seducerPredicate(action) || isInitializationCall;
        return shouldRunWrappedSeducer ? seducerFunction(state, action) : state;
    }
}

const rootSeducer = combineSeducers({
    // check for suffixed strings
    counterA : createFilteredSeducer(counter, action => action.type.endsWith('_A')),
    // check for extra data in the action
    counterB : createFilteredSeducer(counter, action => action.name === 'B'),
    // respond to all 'INCREMENT' actions, but never 'DECREMENT'
    counterC : createFilteredSeducer(counter, action => action.type === 'INCREMENT')
};
```


These basic patterns allow you to do things like having multiple instances of a smart connected component within the UI, or reuse common logic for generic capabilities such as pagination or sorting.
