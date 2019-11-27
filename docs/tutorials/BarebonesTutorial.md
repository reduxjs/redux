---
id: barebones
title: Barebones Tutorial
sidebar_label: Barebones Tutorial
hide_title: true
---

# Barebones Tutorial

In this tutorial, we will cover the key concepts often used in Redux:

- [Actions](#actions)
- [Reducers](#reducers)
- [Payloads](#action-payload)
- [Action creators](#action-creators)

Once we've covered those, we'll see how the [Redux store](#redux-store) handily pulls them all together for convenient state management.

**It is recommended that, if you are new to Redux, you follow this tutorial along in its entirety, as it is structured in a way to incrementally build on previously covered material.**

## Actions

### Motivation

The purpose of an _action_ is to represent an event, interaction or intended state change.

### Definition

An action satisfies two conditions:

1. An action is a plain object
2. An action has a `type` property

#### An aside: Flux Standard Actions

A more demanding standard for an action to meet is the '[Flux Standard Action (FSAs)](https://github.com/redux-utilities/flux-standard-action)' specification, but **Redux does not _require_ actions to be Flux Standard Actions**.

Having said that, you might be interested in reading more about them and following the FSA conventions. (All FSAs are accepted by Redux as actions, but not all actions are FSAs.)

#### `type`

The `type` property is typically a string that describes the event, interaction or intended state change.

The `type` property is not _required_ to use any particular casing or tensing, although `SCREAMING_SNAKE_CASE` is common, and it is recommended to describe some event in the past tense (i.e. `PIZZA_ORDERED`, or `pizza_ordered`, instead of `ORDER_PIZZA`).

### Examples

| Data                                           | Is this an action?                                                          |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| `'PIZZA_ORDERED'`                              | [No](#not-an-action-pizza_ordered)                                          |
| `{ event: 'PIZZA_ORDERED' }`                   | [No](#not-an-action-event-pizza_ordered)                                    |
| `{ type: 'PIZZA_ORDERED' }`                    | [**Yes!**](#is-an-action-type-pizza_ordered)                                |
| `{ type: 'pizza/count/add' }`                  | [**Yes!**](#is-an-action-type-pizza-count-add)                              |
| `{ type: 'pizza/count/add', otherProp: true }` | [**Yes!**](#is-an-action-type-pizza-count-add-otherprop-true) (but not FSA) |
| `() => ({ type: 'pizza/count/add' })`          | [No](#is-not-an-action-type-pizza-count-add)                                |

#### Not an action: `PIZZA_ORDERED`

This is not an action, because it is not a plain object. Actions must be plain objects.

#### Not an action: `{ event: 'PIZZA_ORDERED' }`

This is not an action, because it does not have a type property. Actions must have a `type` property.

#### Is an action: `{ type: 'PIZZA_ORDERED' }`

This is an action, because: (i) it is a plain object; and (ii) it has a `type` property.

#### Is an action: `{ type: 'pizza/count/add' }`

This is an action, because: (i) it is a plain object; and (ii) it has a `type` property.

#### Is an action: `{ type: 'pizza/count/add', otherProp: true }`

This is an action, because: (i) it is a plain object; and (ii) it has a `type` property. It is not a [Flux-Standard-Action](https://github.com/redux-utilities/flux-standard-action), however.

#### Is not an action: `() => ({ type: 'pizza/count/add' })`

This is not an action, because it is not a plain object. Actions must be plain objects. (However, since this is a function that _returns_ an action, it is an [_action creator_](#action-creators).)

## Reducers

### Motivation

The purpose of a _reducer_ is to predictably generate the new value for some state, in response to an [action](#actions), subject to a restriction: there should be no mutations or side-effects (i.e., a reducer should be a _pure function_).

This restriction is important because it enables Redux to support features like 'hot reloading' and 'time travel'.

### Definition

Reducer functions have the following signature: `(state, action) => newState`.

Given the same `state` and `action`, a reducer should always return the same value of `newState`.

As said [above](#motivation-1), there should be no mutations or side-effects caused by a reducer function.

The value of `newState` might well be the same as `state`, depending on the action. That's up to you!

A useful reducer is likely to have a return value that depends on the action's [`type`](#type).

### Example: number state

Let's suppose that we're modelling the floor number shown inside of an elevator.

In this example, we will build a simple reducer that returns the state value for a counter that represents that floor number displayed digitally inside the loft. It should be able to handle both increases and decreases, since our elevator can travel both upwards and downwards.

#### Desired outcome

Let's sketch out what we're aiming for in our function, `floorNumberReducer`.

Every time we make a call to `floorNumberReducer`, it should return a number that represents the floor number to be shown on our elevator's digital display, based on: (i) the previous floor number state passed in; and (ii) the action passed in.

What do you think would be sensible return values for the following calls to the reducer, based on the actions being dispatched?

```js
// What floor number should be returned if we are at floor three, and the elevator doors are opened?
const afterDoorsOpenedAtFloorThree = floorNumberReducer(3, {
  type: 'ELEVATOR_DOORS_OPENED'
})

// What floor number should be returned if we are at floor seven, and somebody gets into the elevator?
const afterPersonBoardedAtFloorSeven = floorNumberReducer(7, {
  type: 'PERSON_BOARDED'
})

// What floor number should be returned if we are at floor 5, and the elevator ascends one floor?
const afterAscendingAtFloorFive = floorNumberReducer(5, {
  type: 'ELEVATOR_FLOOR_ASCENDED'
})

// What floor number should be returned if we are at floor 23, and it starts raining outside?
const afterRainingAtFloorTwentyThree = floorNumberReducer(23, {
  type: 'RAIN_STARTED'
})

// What floor number should be returned if we are at floor 11, and the elevator descends one floor?
const afterDescendingAtFloorEleven = floorNumberReducer(11, {
  type: 'ELEVATOR_FLOOR_DESCENDED'
})
```

##### `afterDoorsOpenedAtFloorThree` should be `3`

The elevator doors opening shouldn't by itself make any difference to 'what floor number the elevator display shows'. The reducer should return the same value as before.

##### `afterPersonBoardedAtFloorSeven` should be `7`

A person boarding the elevator shouldn't by itself make any difference to 'what floor number the elevator display shows'. The reducer should return the same value as before.

##### `afterAscendingAtFloorFive` should be `6`

The elevator _was_ at floor five, but has now ascended a floor. The reducer should return an incremented value to reflect this.

##### `afterRainingAtFloorTwentyThree` should be `23`

Rain starting outside the building shouldn't by itself make any difference to 'what floor number the elevator display shows'. The reducer should return the same value as before.

##### `afterDescendingAtFloorEleven` should be `10`

The elevator _was_ at floor ten, but has now descended a floor. The reducer should return a decremented value to reflect this.

**Notice that, for a majority of actions, we are expecting our reducer function to return the same value that it was passed.**

This makes sense, if you consider what we are modelling: out of all possible events in the world that we could model in an `action` passed into `floorNumberReducer`, only a really small number of them are going to be relevant.

#### Achieving the desired outcome

Here's a first pass at writing a reducer to achieve that desired outcome:

```js
/*
  @param {number} state - The current floor number being shown in the elevator
  @param {object} action - Represents an event, interaction or intended state change

  @returns {number} The floor number that should now be shown in the elevator
*/
const floorNumberReducer = (state, action) => {
  if (action.type === 'ELEVATOR_FLOOR_ASCENDED') {
    return state + 1
  } else if (action.type === 'ELEVATOR_FLOOR_DESCENDED') {
    return state - 1
  } else {
    // We expect the vast majority of calls to end up here
    return state
  }
}

floorNumberReducer(3, { type: 'ELEVATOR_DOORS_OPENED' }) // => 3
floorNumberReducer(7, { type: 'PERSON_BOARDED' }) // => 7
floorNumberReducer(5, { type: 'ELEVATOR_FLOOR_ASCENDED' }) // => 6
floorNumberReducer(23, { type: 'RAIN_STARTED' }) // => 23
floorNumberReducer(11, { type: 'ELEVATOR_FLOOR_DESCENDED' }) // => 10
```

#### Refactoring to use a `switch` statement

Whilst the above reducer function does the job, and is a perfectly valid Redux reducer, it's a little verbose - if we ended up extended it to respond to actions like `{ type: 'ELEVATOR_CRASHES_TO_GROUND_FLOOR' }`, we're going to have to add another `else if` statement, and things could get cluttered.

A common pattern which is recommended as slightly cleaner is a switch statement:

```js
/*
  @param {number} state - The current floor number being shown in the elevator
  @param {object} action - Represents an event, interaction or intended state change

  @returns {number} The floor number that should now be shown in the elevator
*/
const floorNumberReducer = (state, action) => {
  switch (action.type) {
    case 'ELEVATOR_FLOOR_ASCENDED':
      return state + 1
    case 'ELEVATOR_FLOOR_DESCENDED':
      return state - 1
    case 'ELEVATOR_CRASHED_TO_GROUND_FLOOR':
      return 0

    // default catches all other values of action.type
    default:
      return state
  }
}

floorNumberReducer(3, { type: 'ELEVATOR_DOORS_OPENED' }) // => 3
floorNumberReducer(5, { type: 'ELEVATOR_FLOOR_ASCENDED' }) // => 6
floorNumberReducer(11, { type: 'ELEVATOR_FLOOR_DESCENDED' }) // => 10
floorNumberReducer(2, { type: 'ELEVATOR_CRASHED_TO_GROUND_FLOOR' }) // => 0
```

You don't have to use a `switch` statement, but it is recommended.

### Example: object state

We'll now extend our example to handle object state that models both the floor number shown in the elevator _and_ a list of names representing passengers who are currently in the elevator.

This state will look something like this:

```js
const exampleState = {
  floorNumber: 5,
  passengers: ['Eliza Dolittle', 'Barack Obama', 'Marge Simpson']
}
```

As well as modelling increases and decreases in floor number as before, we also now want to be able to model passengers in our elevator. We'll add a couple of simplifying assumptions:

- We'll assume that passengers _only_ exit (and worry about boarding later on)
- We'll assume, if a passenger is exiting, then it _must_ be the first passenger in the list (a [FIFO structure](<https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics)>))

These are ridiculous assumptions, I know. Don't worry - we'll relax them in a later example.

#### Desired outcome

Let's sketch out what we're aiming for in our function, `elevatorReducer`.

Our elevator state is handling some state that is an object, with two properties, `floorNumber` and `passengers`. As such, since the reducer [should return the new value of state](#definition-1), `elevatorReducer` should always return an object with these two properties.

Here, then, are some sensible return values for us to expect from `elevatorReducer`:

```js
elevatorReducer(
  { floorNumber: 5, passengers: [] }, // first arg of a reducer is previous state
  { type: 'RAIN_STARTED' } // second arg of a reducer is an action
)
// This action should affect neither floor number nor passengers inside the elevator
// we expect: { floorNumber: 5, passengers: [] }

elevatorReducer(
  { floorNumber: 2, passengers: ['Chance the Rapper'] },
  { type: 'ELEVATOR_FLOOR_DESCENDED' }
)
// This action should decrement floor number but not affect passengers inside
// we expect: { floorNumber: 1, passengers: ['Chance the Rapper'] }

elevatorReducer(
  { floorNumber: 11, passengers: ['Hansel', 'Gretel'] },
  { type: 'PASSENGER_EXITED' }
)
// This action should mean Hansel, as first passenger, leaves
// we expect: { floorNumber: 11, passengers: ['Gretel'] }
```

#### Refactoring `floorNumberReducer`

We'll take, as a starting point, the [`floorNumberReducer` from an earlier example](#refactoring-to-use-a-switch-statement), and refactor it so it works for our new object state.

```js
/*
  @param {object} state - An object with two properties, floorNumber and passengers
  @param {number} state.floorNumber - The current floor number being shown in the elevator
  @param {string[]} state.passengers - An array of passenger names
  @param {object} action - Represents an event, interaction or intended state change

  @returns {object} An object with two properties, floorNumber and passengers
*/
const elevatorReducer = (state, action) => {
  switch (action.type) {
    case 'ELEVATOR_FLOOR_ASCENDED':
      // we need to return an object, since elevatorReducer handles object state
      // should have two properties, floorNumber and passengers
      // the passengers property should be as it was before
      return {
        floorNumber: state.floorNumber + 1,
        passengers: state.passengers
      }

    case 'ELEVATOR_FLOOR_DESCENDED':
      // alternative 'spread' syntax: spreads out all properties of state,
      // then overwrites floorNumber with a new value
      return { ...state, floorNumber: state.floorNumber - 1 }

    case 'ELEVATOR_CRASHED_TO_GROUND_FLOOR':
      return { ...state, floorNumber: 0 }

    default:
      return state
  }
}
```

This `elevatorReducer` means that we can now handle the elevator ascending and descending. However, since we haven't yet taught our reducer how to handle passengers exiting, that action is going to get caught in the `default` statement and so the state will be returned, unchanged:

```js
elevatorReducer({ floorNumber: 5, passengers: [] }, { type: 'RAIN_STARTED' }) // this looks good:
// => { floorNumber: 5, passengers: [] }

elevatorReducer(
  { floorNumber: 2, passengers: ['Chance the Rapper'] },
  { type: 'ELEVATOR_FLOOR_DESCENDED' }
) // this looks good:
// => { floorNumber: 1, passengers: ['Chance the Rapper'] }

elevatorReducer(
  { floorNumber: 11, passengers: ['Hansel', 'Gretel'] },
  { type: 'PASSENGER_EXITED' }
) // this DOES NOT look right, Hansel is still there!
// => { floorNumber: 11, passengers: ['Hansel', 'Gretel'] }
```

#### Achieving the desired outcome

All we need to do is add a new `case` to handle passengers exiting, [_making sure not to mutate any state_](#definition-1).

```js
/*
  @param {object} state - An object with two properties, floorNumber and passengers
  @param {number} state.floorNumber - The current floor number being shown in the elevator
  @param {string[]} state.passengers - An array of passenger names
  @param {object} action - Represents an event, interaction or intended state change

  @returns {object} An object with two properties, floorNumber and passengers
*/
const elevatorReducer = (state, action) => {
  switch (action.type) {
    case 'ELEVATOR_FLOOR_ASCENDED':
      return { ...state, floorNumber: state.floorNumber + 1 }

    case 'ELEVATOR_FLOOR_DESCENDED':
      return { ...state, floorNumber: state.floorNumber - 1 }

    case 'ELEVATOR_CRASHED_TO_GROUND_FLOOR':
      return { ...state, floorNumber: 0 }

    case 'PASSENGER_EXITED':
      // hooray for slice, a non-mutative method!
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
      return {
        ...state,
        passengers: passengers.slice(1)
      }

    /*
        or a more readable alternative using array destructuring:
        const [firstPassenger, ...remainingPassengers] = passengers
        return { ...state, passengers: remainingPassengers }
      */

    default:
      return state
  }
}

elevatorReducer(
  { floorNumber: 11, passengers: ['Hansel', 'Gretel'] },
  { type: 'PASSENGER_EXITED' }
) // this looks correct now!
// => { floorNumber: 11, passengers: ['Gretel'] }
```

## Action `payload`

### Motivation

If you've been following along, [as of our last example](#achieving-our-desired-outcome-1) we have now written a reducer function that manages object state representing an elevator, with a floor number and list of passengers.

We used a couple of _very silly_ assumptions in constructing that example:

> - We'll assume that passengers _only_ exit (and worry about boarding later on)
> - We'll assume, if a passenger is exiting, then it _must_ be the first passenger in the list (a [FIFO structure](<https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics)>))

Clearly, we're not modelling our elevator very well with these two constraints, which we'll now relax.

But how would we model a passenger being added?

```js
const elevatorReducer = (state, action) => {
  switch (action.type) {
    // looking only at the relevant case:

    case 'PASSENGER_BOARDED':
      return {
        ...state,
        passengers: [
          ...state.passengers, // spread all existing passengers into the array
          someNewPassenger // but where does this new passenger come from...?
        ]
      }
  }
}
```

Our `elevatorReducer` needs to be able to refer to a string, representing the new passenger's name.

Where could that come from?

### Definition

Recall that an [`action`](#definition) is a plain object with a `type` property.

Any other additional information can be passed through a `payload` property, which could be of any type as you see fit.

### Examples

| Action                                                                   | `payload` might represent...             |
| ------------------------------------------------------------------------ | ---------------------------------------- |
| `{ type: 'PIZZA_ORDERED', payload: 'margherita' }`                       | Flavour of the pizza ordered             |
| `{ type: 'ANIMALS_BORN', payload: { species: 'giraffe', quantity: 2 } }` | Species and quantity of the animals born |
| `{ type: 'CONTRACT_SIGNED', payload: ['Donald Trump', 'Xi Jinping'] }`   | Signatories of the contract              |

### Usage in a reducer

Building on our [motivating example](#motivation-2), to allow us to handle passengers entering our elevator and relaxing our FIFO assumption about passengers exiting:

```js
/*
  @param {object} state - An object with two properties, floorNumber and passengers
  @param {number} state.floorNumber - The current floor number being shown in the elevator
  @param {string[]} state.passengers - An array of passenger names
  @param {object} action - Represents an event, interaction or intended state change

  @returns {object} An object with two properties, floorNumber and passengers
*/
const elevatorReducer = (state, action) => {
  switch (action.type) {
    case 'ELEVATOR_FLOOR_ASCENDED':
      return { ...state, floorNumber: state.floorNumber + 1 }

    case 'ELEVATOR_FLOOR_DESCENDED':
      return { ...state, floorNumber: state.floorNumber - 1 }

    case 'ELEVATOR_CRASHED_TO_GROUND_FLOOR':
      return { ...state, floorNumber: 0 }

    case 'PASSENGER_BOARDED':
      return {
        ...state,
        passengers: [
          ...state.passengers,
          // we assume the new passenger's name will be
          //  passed inas the action's payload
          action.payload
        ]
      }

    case 'PASSENGER_EXITED':
      return {
        ...state,
        // Filter out the passenger name passed as action payload
        // (We assume here that passenger names are unique)
        passengers: passengers.filter(passenger => passenger !== action.payload)
      }

    default:
      return state
  }
}

elevatorReducer(
  { floorNumber: 11, passengers: ['Hansel', 'Gretel'] },
  { type: 'PASSENGER_BOARDED', payload: 'Evil witch' }
)
// => { floorNumber: 11, passengers: ['Hansel', 'Gretel', 'Evil witch'] }

elevatorReducer(
  { floorNumber: 11, passengers: ['Hansel', 'Gretel', 'Evil witch'] },
  { type: 'PASSENGER_EXITED', payload: 'Gretel' }
)
// => { floorNumber: 11, passengers: ['Hansel', 'Evil witch'] }
```

Note that not all of our `case` statements are making use of `action.payload`. That is fine! `payload` is an optional property of an [`action`](#definition), there to be used if there is any further information beyond action `type` that might be useful.

## Action creators

### Motivation

Following on from our [above example](#usage-in-a-reducer), suppose that a series of passengers are going to board our elevator.

```js
elevatorReducer(
  { floorNumber: 4, passengers: ['Arthur the Aardvark', 'Bugs Bunny'] },
  { type: 'PASSENGER_BOARDED', payload: 'Charlie Chaplin' }
)

elevatorReducer(
  {
    floorNumber: 4,
    passengers: ['Arthur the Aadvark', 'Bugs Bunny', 'Charlie Chaplin']
  },
  { type: 'PASSENGER_BOARDED', payload: 'Dastardly Dan' }
)

elevatorReducer(
  {
    floorNumber: 4,
    passengers: [
      'Arthur the Aadvark',
      'Bugs Bunny',
      'Charlie Chaplin',
      'Dastardly Dan'
    ]
  },
  { type: 'PASSEMGER_BOARDED', payload: 'Eddie the Eagle' }
)
```

Isn't it tedious to have to type out that object literal for 'passenger X joins the elevator' each time?

(It's also tedious to have to manually keep track of and pass in our elevator state, but we'll tackle that [later](#redux-store).)

Constructing actions using an object literal each time also means it's easy for us to make silly typos - for example, above, we've actually made a typo in what should have been the third `'PASSENGER_BOARDED'` event, hitting the `M` key instead of the `N` key - which means that our reducer's `case` statement will miss it, it'll fall through to `default`, and poor Eddie the Eagle won't actually get boarded.

We need a safer and less tedious way of constructing correctly formatted actions.

### Definition

An action creator is a function that returns an [`action`](#definition).

### Examples

```js
const startRaining = () => ({
  type: 'RAIN_STARTED'
})

const ascendFloor = () => ({
  type: 'ELEVATOR_FLOOR_ASCENDED'
})

const boardPassenger = passengerName => ({
  type: 'PASSENGER_BOARDED',
  payload: passengerName
})
```

All these functions return an [`action`](#definition) upon execution - and, so, these functions are action _creators_.

Note that an action creator does not have to take any arguments, although it might be useful for it to take an argument if you want to create actions with variable payloads:

```js
const actionToBoardCharlie = boardPassenger('Charlie Chaplin')
// => { type: 'PASSENGER_BOARDED', payload: 'Charlie Chaplin' }

const actionToBoardDan = boardPassenger('Dastardly Dan')
// => { type: 'PASSENGER_BOARDED', payload: 'Dastardly Dan' }
```

### Passing into a reducer

Now we've created those two actions, we can pass them directly into our reducer:

```js
elevatorReducer(
  { floorNumber: 4, passengers: ['Arthur the Aardvark', 'Bugs Bunny'] },
  actionToBoardCharlie
)

elevatorReducer(
  {
    floorNumber: 4,
    passengers: ['Arthur the Aadvark', 'Bugs Bunny', 'Charlie Chaplin']
  },
  actionToBoardDan
)
```

Or, more typically, we can create the action at the point that we need it, i.e. call the action creator as an argument of the reducer:

```js
elevatorReducer(
  {
    floorNumber: 4,
    passengers: [
      'Arthur the Aadvark',
      'Bugs Bunny',
      'Charlie Chaplin',
      'Dastardly Dan'
    ]
  },
  boardPassenger('Eddie the Eagle') // executing this action creator returns an action!
)
```

Isn't that much nicer?

```diff
elevatorReducer(
  { floorNumber: 4, passengers: ['Arthur the Aardvark', 'Bugs Bunny'] },
-  { type: 'PASSENGER_BOARDED', payload: 'Charlie Chaplin' }
+  boardPassenger('Charlie Chaplin')
)

elevatorReducer(
  { floorNumber: 4, passengers: ['Arthur the Aadvark', 'Bugs Bunny', 'Charlie Chaplin'] },
-  { type: 'PASSENGER_BOARDED', payload: 'Dastardly Dan' }
+  boardPassenger('Dastardly Dan')
)

elevatorReducer(
  { floorNumber: 4, passengers: ['Arthur the Aadvark', 'Bugs Bunny', 'Charlie Chaplin', 'Dastardly Dan'] },
-  { type: 'PASSEMGER_BOARDED', payload: 'Eddie the Eagle' }
+  boardPassenger('Eddie the Eagle')
)
```

## Redux store

### Motivation

In the above example using [action creators](#passing-into-a-reducer), we're manually keeping track of state and passing it in as the first argument to our [reducer](#definition-1) to form a sequence of actions:

```js
elevatorReducer(
  // pass in some first value of state
  { floorNumber: 4, passengers: ['Arthur the Aardvark', 'Bugs Bunny'] },
  boardPassenger('Charlie Chaplin')
)

elevatorReducer(
  // pass in what we think the second value of state is...
  {
    floorNumber: 4,
    passengers: ['Arthur the Aadvark', 'Bugs Bunny', 'Charlie Chaplin']
  },
  boardPassenger('Dastardly Dan')
)

elevatorReducer(
  // pass in what we think the third value of state is...
  {
    floorNumber: 4,
    passengers: [
      'Arthur the Aadvark',
      'Bugs Bunny',
      'Charlie Chaplin',
      'Dastardly Dan'
    ]
  },
  boardPassenger('Eddie the Eagle')
)
```

This is a bit silly. Remember, a call to a reducer returns us our new value of state, so we should be using that:

```js
const firstState = {
  floorNumber: 4,
  passengers: ['Arthur the Aardvark', 'Bugs Bunny']
}

const secondState = elevatorReducer(
  firstState,
  boardPassenger('Charlie Chaplin')
)
// => { floorNumber: 4, passengers: ['Arthur the Aadvark', 'Bugs Bunny', 'Charlie Chaplin'] }

const thirdState = elevatorReducer(secondState, boardPassenger('Dastardly Dan'))
// => { floorNumber: 4, passengers: ['Arthur the Aadvark', 'Bugs Bunny', 'Charlie Chaplin', 'Dastardly Dan'] }

const fourthState = elevatorReducer(
  thirdState,
  boardPassenger('Eddie the Eagle')
)
// => { floorNumber: 4, passengers: ['Arthur the Aadvark', 'Bugs Bunny', 'Charlie Chaplin', 'Dastardly Dan', 'Eddie the Eagle'] }
```

Alternatively, instead of creating a bunch of variables, we could reassign a single state variable:

```js
const initialState = {
  floorNumber: 4,
  passengers: ['Arthur the Aardvark', 'Bugs Bunny']
}

let currentState = initialState

currentState = elevatorReducer(currentState, boardPassenger('Charlie Chaplin'))
// currentState is now equal to { floorNumber: 4, passengers: ['Arthur the Aadvark', 'Bugs Bunny', 'Charlie Chaplin'] }

currentState = elevatorReducer(currentState, boardPassenger('Dastardly Dan'))
// currentState is now equal to { floorNumber: 4, passengers: ['Arthur the Aadvark', 'Bugs Bunny', 'Charlie Chaplin', 'Dastardly Dan'] }

currentState = elevatorReducer(currentState, boardPassenger('Eddie the Eagle'))
// currentState is now equal to { floorNumber: 4, passengers: ['Arthur the Aadvark', 'Bugs Bunny', 'Charlie Chaplin', 'Dastardly Dan', 'Eddie the Eagle'] }
```

Now, there's a clear pattern emerging here: every time that we 'process' an action using our reducer, we're reassigning our state variable to the return value of the reducer.

Wouldn't it be nice if something could handle that pattern for us?

### Definition

A Redux `store` is an object that holds some state through an internal variable (`currentState`), uses a `reducer` function internally and has a `dispatch` function that accepts an action.

Calling `store.dispatch(action)` triggers a reassignment of `currentState` to the return value of `reducer(currentState, action)`.

Calling `store.getState()` returns the value of `currentState`.

### Creating and using a store

Redux has a named export, `createStore`, which we can use to create a store, by passing in a `reducer` function. The reducer function that we pass in is the same one that the store will use to process actions through `reducer(currentState, action)`.

**Note that the `reducer` passed in to `createStore` should have a default value provided for its state argument**, i.e. it should have the signature `(state = initialState, action) => newState`.

```js
import { createStore } from 'redux'
import reducer from './path/to/your/reducer'
import { someActionCreator } from './path/to/your/action/creators'

const store = createStore(reducer)
store.getState() // returns the store's initial state
store.dispatch(someActionCreator())
store.getState() // return's the store's state, having processed the action created above
```

### Full example: object state

```js
import { createStore } from 'redux'

const initialElevatorState = { floorNumber: 0, passengers: [] }

const elevatorReducer = (state = initialElevatorState, action) => {
  switch (action.type) {
    case 'ELEVATOR_FLOOR_ASCENDED':
      return { ...state, floorNumber: state.floorNumber + 1 }

    case 'ELEVATOR_FLOOR_DESCENDED':
      return { ...state, floorNumber: state.floorNumber - 1 }

    case 'ELEVATOR_CRASHED_TO_GROUND_FLOOR':
      return { ...state, floorNumber: 0 }

    case 'PASSENGER_BOARDED':
      return {
        ...state,
        passengers: [...state.passengers, action.payload]
      }

    case 'PASSENGER_EXITED':
      return {
        ...state,
        passengers: passengers.filter(passenger => passenger !== action.payload)
      }

    default:
      return state
  }
}

const ascendFloor = () => ({
  type: 'ELEVATOR_FLOOR_ASCENDED'
})

const boardPassenger = passengerName => ({
  type: 'PASSENGER_BOARDED',
  payload: passengerName
})

const store = createStore(elevatorReducer)

// the store's state will be our initialElevatorState
store.getState() // => { floorNumber: 0, passengers: [] }

// now let's dispatch an action for the reducer to use
store.dispatch({ type: 'ELEVATOR_FLOOR_ASCENDED' })
store.getState() // => { floorNumber: 1, passengers: [] }

// we could also use an action creator for convenience
store.dispatch(ascendFloor())
store.getState() // => { floorNumber: 2, passengers: [] }

// let's board a couple of passengers
store.dispatch(boardPassenger('Minnie Mouse'))
store.dispatch(boardPassenger('Mickey Mouse'))
store.getState() // => { floorNumber: 2, passengers: ['Minnie Mouse', 'Mickey Mouse'] }

store.dispatch({ type: 'ELEVATOR_CRASHED_TO_GROUND_FLOOR' })
store.getState() // => { floorNumber: 0, passengers: ['Minnie Mouse', 'Mickey Mouse'] }

store.dispatch({ type: 'PASSENGER_EXITED', payload: 'Mickey Mouse' })
store.getState() // => { floorNumber: 0, passengers: ['Minnie Mouse'] }
```
