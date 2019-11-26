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
- [Payloads](#action-payloads)
- [Action creators](#action-creators)

Once we've covered those, we'll see how the [Redux store](#redux-store) handily pulls them all together for convenient state management.

## Actions

### Motivation

The purpose of an *action* is to represent an event, interaction or intended state change.

### Definition

An action satisfies two conditions:

1. An action is a plain object
2. An action has a `type` property

A more precise specification of an action is the '[Flux Standard Action](https://github.com/redux-utilities/flux-standard-action)', which adds some further conditions. **Redux does not *require* actions to be Flux Standard Actions**, but you might be interested in reading more about them.

#### `type`

The `type` property is typically a string that describes the event, interaction or intended state change.

The `type` property does *not* have to have any particular casing or tensing, although `SCREAMING_SNAKE_CASE` is common, and it is recommended to describe some event in the past tense (i.e. `PIZZA_ORDERED`, or `pizza_ordered`, instead of `ORDER_PIZZA`).

### Examples

| Data | Is this an action? |
 --- | --- |
| `'PIZZA_ORDERED'` | [No](#not-an-action-pizza_ordered) |
| `{ event: 'PIZZA_ORDERED' }` | [No](#not-an-action-event-pizza_ordered) |
| `{ type: 'PIZZA_ORDERED' }` | [**Yes!**](#is-an-action-type-pizza_ordered) |
| `{ type: 'pizza/count/add' }` | [**Yes!**](#is-an-action-type-pizza-count-add) |
| `{ type: 'pizza/count/add', otherProp: true }` | [**Yes!**](#is-an-action-type-pizza-count-add-otherprop-true) (but not FSA) |
| `() => ({ type: 'pizza/count/add' })` | [No](#is-not-an-action-type-pizza-count-add) |

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
This is not an action, because it is not a plain object. Actions must be plain objects. (However, since this is a function that *returns* an action, it is an [*action creator*](#action-creators).)

## Reducers

### Motivation

The purpose of a *reducer* is to predictably generate the new value for some state, in response to an [action](#actions), subject to a restriction: there should be no mutations or side-effects (i.e., a reducer should be a *pure function*).

This restriction is important because it enables Redux to support features like 'hot reloading' and 'time travel'.

### Definition

Reducer functions have the following signature: `(state, action) => newState`.

Given the same `state` and `action`, a reducer should always return the same value of `newState`.

The value of `newState` might well be the same as `state`, depending on the action. That's up to you!

A useful reducer is likely to have a return value that depends on the action's [`type`](#type).

### Examples

#### Building a simple counter reducer

Let's suppose that we're modelling the floor number shown inside of an elevator.

In this example, we will build a simple reducer that returns the state value for a counter that represents that floor number displayed digitally inside the loft. It should be able to handle both increases and decreases, since our elevator can travel both upwards and downwards.

##### Desired outcome

Let's sketch out what we're aiming for in our function, `floorNumberReducer`.

Every time we make a call to `floorNumberReducer`, it should return a number that represents the floor number to be shown on our lift's digital display, based on: (i) the previous floor number state passed in; and (ii) the action passed in.

What do you think would be sensible return values for the following calls to the reducer, based on the actions being dispatched?

```js
// What floor number should be returned if we are at floor three, and the elevator doors are opened?
const afterDoorsOpenedAtFloorThree = floorNumberReducer(3, { type: 'ELEVATOR_DOORS_OPENED' })

// What floor number should be returned if we are at floor seven, and somebody gets into the elevator?
const afterPersonBoardedAtFloorSeven = floorNumberReducer(7, { type: 'PERSON_BOARDED' })

// What floor number should be returned if we are at floor 5, and the elevator ascends one floor?
const afterAscendingAtFloorFive = floorNumberReducer(5, { type: 'ELEVATOR_FLOOR_ASCENDED' })

// What floor number should be returned if we are at floor 23, and it starts raining outside?
const afterRainingAtFloorTwentyThree = floorNumberReducer(23, { type: 'RAIN_STARTED' })

// What floor number should be returned if we are at floor 11, and the elevator descends one floor?
const afterDescendingAtFloorEleven = floorNumberReducer(11, { type: 'ELEVATOR_FLOOR_DESCENDED' })
```

###### `afterDoorsOpenedAtFloorThree` should be `3`
The elevator doors opening shouldn't by itself make any difference to 'what floor number the elevator display shows'. The reducer should return the same value as before.

###### `afterPersonBoardedAtFloorSeven` should be `7`
A person boarding the elevator shouldn't by itself make any difference to 'what floor number the elevator display shows'. The reducer should return the same value as before.

###### `afterAscendingAtFloorFive` should be `6`
The elevator *was* at floor five, but has now ascended a floor. The reducer should return an incremented value to reflect this.

###### `afterRainingAtFloorTwentyThree` should be `23`
Rain starting outside the building shouldn't by itself make any difference to 'what floor number the elevator display shows'. The reducer should return the same value as before.

###### `afterDescendingAtFloorEleven` should be `10`
The elevator *was* at floor ten, but has now descended a floor. The reducer should return a decremented value to reflect this.


This fits our [definition](#definition-1) of a reducer, so it *is* a reducer function, but it's not a very useful one: the state that gets returned is always going to be the same state passed in, so it's not making any meaningful updates.

What about this?

```js
// take 2
const counterReducer
```

```js
const newCounterState = counterReducer(0, { type: '' })

```

The below reducer is intended to manage the state of a counter.

```js
/*
  @param {number} state - The current state value of the counter
*/
const counterReducer = (state, action) => {
  if (counter.type === 'COUNTER_INCREASED') {
    return 
  }
}

```



## Action `payload`s

## Action creators

## Redux store