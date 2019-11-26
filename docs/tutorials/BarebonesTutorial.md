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

The `type` property is typically a string that describes the event, interaction or intended state change.

The `type` property does *not* have to have any particular casing or tensing, although `SCREAMING_SNAKE_CASE` is common, and it is recommended to describe some event in the past tense (i.e. `PIZZA_ORDERED`, or `pizza_ordered`, instead of `ORDER_PIZZA`).

A more precise specification of an action is the '[Flux Standard Action](https://github.com/redux-utilities/flux-standard-action)', which adds some further conditions. **Redux does not *require* actions to be Flux Standard Actions**, but you might be interested in reading more about them.

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

## Action `payload`s

## Action creators

## Redux store