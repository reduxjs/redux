# Tutorial

This article serves to teach you the basics of Redux and get up and running in a React/Redux application. While Redux can be used with any view layer, it is most commonly used with React, so we’ll explore that here.

## The TLDR

Redux is a predictable state container for JavaScript apps. In essence Redux stores your state as an object tree,
and provides tooling for updating that object and ensuring that all consumers are informed of updates.

## A Friendly Warning

This page is *opinionated* more-so than most of the other documentation. This is to make your life
easier when getting started with Redux for the first time.

## Nitpicking about Names

There are a couple of terms that will be thrown around a lot that we should make sure we have a clear understanding of. These may not make sense right away, but should be at the top of this document for
quick reference.
- The **store** is the the entire Redux Store that encompasses **state, middleware, dispatch,** and **reducers**.
- A **namespace** is a top level key on both the state object and the list of reducers. A namespace maps a reducer to a slice of the Redux state.
- The state object is a plain JSON object that is separated into namespaces. When an action is fired every reducer is called with the action and it’s slice of the store. The reducers then return a new state at that namespace which is combined into the overall state object.


## Store: One Store to Rule Them All

Towards the top of your application you should have a file called `store.js`. This file is going
to be where we **create the react store.**

Most likely, you want to inforce the invariant of one store per page for multi-page app and one store total for single page apps. This is usually important when integrating with React because it allows us to use a single `<Provider />` per React tree that can use any selector from any library. Don't worry about all these other terms just yet. We'll get there.
Inside this file you'll have the following code:


    import { createStore } from 'redux'
    import rootReducer from './reducer'
    const store = createStore(rootReducer)
    export default store

That's it. There's a bunch of other stuff you might want to do: inject middleware, initial state, etc. But let's consider all that out of scope for the moment.

## Reducer: What does my Reducer Look Like?

Your reducer should be a pure function that takes an `action` and a `state` and returns a brand new state object.
What’s a pure function?
A pure function is a function that takes inputs, does not mutate them, and returns a new reference as output. They are purely synchronous. Here are a few don’ts for a reducer:

- Do Not: Dispatch a new action
- Do Not: Hit an API
- Do Not: Block or sleep
- Do Not: setTimeout
- Do Not: Mutate an object. For example: `state.foo =` `'``bar``'`

Under the hood, Redux works by checking whether or not references have changed. You should never mutate any part of the state object, always return a brand new one with properties copied over.

The average reducer file will look something like this:

    export WIZARD_REDUCER_KEY = 'WIZARD';

    const defaultState = {
      name: "Harry Potter",
      scar: true,
      parents: 'dead',
      learnedSpells: [],
    }
    export default function potterReducer(state = defaultState, action) {
      switch (action.type) {
        case "LEARN_SPELL": {
          ...state,
          learnedSpells: [...state.learnedSpells, action.payload.spell]
        }
        default: {
          return state
        }
      }
    }

You'll notice that we have a defaultState default parameter. This is because when the store is instantiated it calls potterReducer with `null` and an `INIT` action.

Your reducer should not handle this `INIT` action directly but rather return the previous state. We actually make this very difficult to do but that’s another topic.


## **Namespaces**

We know about our store and the reducer, but what if we want more than one reducer? We actually do that quite a bit. To do this you’ll use `combineReducers`. Here’s what that code usually looks like


    import muggleReducer, {MUGGLE_NAMESPACE_KEY} from './muggle-reducer';
    import wizardReducer, {WIZARD_NAMESPACE_KEY} from './wizard-reducer';

    export default rootReducer = combineReducers({
      [MUGGLE_NAMESPACE_KEY]: muggleReducer,
      [WIZARD_NAMESPACE_KEY]: wizardReducer,
    });

When using `combineReducers` every dispatched action on the store will cause the reducer to be called with it’s slice (namespace) of the state and the action.


## **Selectors:** Getting Your Data Out Of the Store

Your selectors should also be pure functions that take state and an (optional) object of options as parameters and return data form the store.

Selectors will often be small and each drill down throughout the store. The average `selectors.js` file will look like this:


    import {WIZARD_NAMESPACE_KEY} from './wizard-reducer';

    /*
    state = {
      name: "Harry Potter",
      scar: true,
      parents: 'dead',
      learnedSpells: [],
    }
    * /

    const getWizardState = (state) => state[WIZARD_NAMESPACE_KEY];

    export const getName = (state) => getWizardState(state).name;
    export const getSpells = (state) => getWizardState(state).learnedSpells;


## **Actions:** Changing State

Actions are payloads of information that send data from your application to your store. They are **the only source of new information** for the store. Actions should always be encapsulated by a function or **action creator**.

Here’s what an `actions.js` file might look like.


    export function learnSpell(spell) {
      return {
        type: "LEARN_SPELL",
        payload: { spell },
      }
    }

The only invariant on actions inside of redux is that their exists a key called `type`. However `type` is most commonly a string and `payload` is often an object that is present as well. Many people follow the [FluxStandardAction](https://github.com/redux-utilities/flux-standard-action) paradigm.


## **Action Creators**

Action creators can also be used to dispatch multiple actions. They are also commonly used for To do this we use a [**thunk**](https://github.com/gaearon/redux-thunk)**.** In the context of Redux, a ****thunk is an action creator that returns a function. We’re going to skip these for now but for more information check out THE SECTION ON THUNKS.


## **Integrating with React:** Tying it all together with `connect`

We just covered a lot. Stores, reducers, actions, selectors, but how do we get these things into our application? Enter `connect`,  a function exported by the library `react-redux`. Connect is a Higher Order Component (LINK) that ensures your component receives **always up to date** selected data from redux. It also calls `[bindActionCreators](https://redux.js.org/docs/api/bindActionCreators.html)` on all of your action creators so they can be called without passing them to `dispatch`.

Let’s look at some sample code then discuss it.


    import {getName, getSpells} 'data/selectors';

    function Wizard({name, spells, learnSpell}) {
      return (
        <div>
         <h1>{name}</h1>
         <h2>Learned Spells</h2>
         <ul>
           {spells.map((spell) => (
            <li>{spell}</li>
         </ul>
         <button onClick={() => learnSpell("Expelliarmous")}>Learn Expelliarmous</button>
         <button onClick={() => learnSpell("Expecto Patronum")}>
           Learn Expecto Patronum
          </button>
        </div>
      );
    }

    const mapStateToProps = (state) => {
      return {
        name: getName(state),
        spells: getSpells(state),
      };
    };

    const mapDispatchToProps = {
      learnSpell,
    };

    export default connect(mapStateToProps, mapDispatchToProps)(Wizard);

**Whats going on here?**
There’s a few parts happening here

First, we have a functional stateless component that takes some props. These props are a name (string), spells (array<string>), and learnSpell (function). The internal component should have no idea it’s connected to Redux. It simply takes data and functions that can change that data.

Second, we have `connect`. This is a higher order component that abstracts away the internal publish/subscribe pattern with Redux. It takes two parameters `mapStateToProps` and `mapDispatchToProps`.

`mapStateToProps` is a function that get’s passed the redux state and returns an object that will have it’s keys passed as props to the internal component. Connect guarantees that the component is always rendered with the newest state whenever state changes.

`mapDispatchToProps` can be either a function or an object. In this tutorial we will only discuss the object syntax. `mapDispatchToProps` takes a list of action creators and calls `bindActionCreators` before passing them to the component. This is the magic that allows you to call the prop internally and have it dispatch an object to Redux.


## **Provider:** Connect isn’t magic.

Connect gets access to the redux store over [context](https://reactjs.org/docs/context.html). This is an advanced React API that allows you to pass through data without props. The `<Provider />` component takes a store and ensures that components wrapped in a `connect` function get access.

Somewhere towards the top of your application you’ll have some code that looks like this:


    import store from 'store';
    import MyApp from 'MyApp';
    export default function() {
      return (
        <Provider store={store}>
          <MyApp />
        </Provider>
      );
    }


## You should never access the redux store directly in a component. Always use `<Provider />` and `connect`.

Your components should ideally have no idea that they’re connected to Redux. This provides a clear separation of concerns between view logic and business logic. By using `connect` we abstract Redux away from the component. The only things the component needs to know is “What data do I need to receive” and “What functions should I call to change something.”

This abstraction layer protects you both from changes in our Redux layer code and changes in the Redux API itself.

