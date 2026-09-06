# <a href='https://redux.js.org'><img src='https://avatars.githubusercontent.com/u/13142323?s=200&v=4' height='60' alt='Redux Logo' aria-label='redux.js.org' style="display: flex;align-items: center;"/>Redux</a>

Redux is a JS library for predictable and maintainable global state management.

It helps you write applications that behave consistently, run in different environments (client, server, and native), and are easy to test. On top of that, it provides a great developer experience, such as [live code editing combined with a time traveling debugger](https://github.com/reduxjs/redux-devtools).

You can use Redux together with [React](https://react.dev), or with any other view library. The Redux core is tiny (2kB, including dependencies), and has a rich ecosystem of addons.

[**Redux Toolkit**](https://redux-toolkit.js.org) is our official recommended approach for writing Redux logic. It wraps around the Redux core, and contains packages and functions that we think are essential for building a Redux app. Redux Toolkit builds in our suggested best practices, simplifies most Redux tasks, prevents common mistakes, and makes it easier to write Redux applications.

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/reduxjs/redux/test.yaml?branch=master&event=push&style=flat-square)
[![npm version](https://img.shields.io/npm/v/redux.svg?style=flat-square)](https://www.npmjs.com/package/redux)
[![npm downloads](https://img.shields.io/npm/dm/redux.svg?style=flat-square)](https://www.npmjs.com/package/redux)
[![redux channel on discord](https://img.shields.io/badge/discord-%23redux%20%40%20reactiflux-61dafb.svg?style=flat-square)](https://discord.gg/0ZcbPKXt5bZ6au5t)

## Installation

### Create a React Redux App

The recommended way to start new apps with React and Redux Toolkit is by using [our official Redux Toolkit + TS template for Vite](https://github.com/reduxjs/redux-templates), or by creating a new Next.js project using [Next's `with-redux` template](https://github.com/vercel/next.js/tree/canary/examples/with-redux).

Both of these already have Redux Toolkit and React-Redux configured appropriately for that build tool, and come with a small example app that demonstrates how to use several of Redux Toolkit's features.

```bash
# Vite with our Redux+TS template
# (using the `degit` tool to clone and extract the template)
npx degit reduxjs/redux-templates/packages/vite-template-redux my-app

# Next.js using the `with-redux` template
npx create-next-app --example with-redux my-app
```

We do not currently have official React Native templates, but recommend these templates for standard React Native and for Expo:

- https://github.com/rahsheen/react-native-template-redux-typescript
- https://github.com/rahsheen/expo-template-redux-typescript

```
npm install @reduxjs/toolkit react-redux
```

For the Redux core library by itself:

```
npm install redux
```

For more details, see [the Installation docs page](https://redux.js.org/introduction/installation).

## Documentation

The Redux core docs are located at **https://redux.js.org**, and include the full Redux tutorials, as well usage guides on general Redux patterns:

- [Introduction](https://redux.js.org/introduction/getting-started)
- [Tutorials](https://redux.js.org/tutorials/index)
- [Usage Guides](https://redux.js.org/usage/index)
- [FAQ](https://redux.js.org/faq)
- [API Reference](https://redux.js.org/api/api-reference)

The Redux Toolkit docs are available at **https://redux-toolkit.js.org**, including API references and usage guides for all of the APIs included in Redux Toolkit.

## Learn Redux

### Redux Essentials Tutorial

The [**Redux Essentials tutorial**](https://redux.js.org/tutorials/essentials/part-1-overview-concepts) is a "top-down" tutorial that teaches "how to use Redux the right way", using our latest recommended APIs and best practices. We recommend starting there.

### Redux Fundamentals Tutorial

The [**Redux Fundamentals tutorial**](https://redux.js.org/tutorials/fundamentals/part-1-overview) is a "bottom-up" tutorial that teaches "how Redux works" from first principles and without any abstractions, and why standard Redux usage patterns exist.

### Help and Discussion

The **[#redux channel](https://discord.gg/0ZcbPKXt5bZ6au5t)** of the **[Reactiflux Discord community](https://www.reactiflux.com)** is our official resource for all questions related to learning and using Redux. Reactiflux is a great place to hang out, ask questions, and learn - please come and join us there!

## Before Proceeding Further

Redux is a valuable tool for organizing your state, but you should also consider whether it's appropriate for your situation. Please don't use Redux just because someone said you should - instead, please take some time to understand the potential benefits and tradeoffs of using it.

Here are some suggestions on when it makes sense to use Redux:

- You have reasonable amounts of data changing over time
- You need a single source of truth for your state
- You find that keeping all your state in a top-level component is no longer sufficient

Yes, these guidelines are subjective and vague, but this is for a good reason. The point at which you should integrate Redux into your application is different for every user and different for every application.

> **For more thoughts on how Redux is meant to be used, please see:**<br>
>
> - **[When (and when not) to reach for Redux](https://changelog.com/posts/when-and-when-not-to-reach-for-redux)**
> - **[You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)**<br>
> - **[The Tao of Redux, Part 1 - Implementation and Intent](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)**<br>
> - **[The Tao of Redux, Part 2 - Practice and Philosophy](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/)**
> - **[Redux FAQ](https://redux.js.org/faq)**

## Basic Example

The whole global state of your app is stored in an object tree inside a single _store_.
The only way to change the state tree is to create an _action_, an object describing what happened, and _dispatch_ it to the store.
To specify how state gets updated in response to an action, you write pure _reducer_ functions that calculate a new state based on the old state and the action.

Redux Toolkit simplifies the process of writing Redux logic and setting up the store. With Redux Toolkit, the basic app logic looks like:

```js
import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    incremented: state => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1
    },
    decremented: state => {
      state.value -= 1
    }
  }
})

export const { incremented, decremented } = counterSlice.actions

const store = configureStore({
  reducer: counterSlice.reducer
})

// Can still subscribe to the store
store.subscribe(() => console.log(store.getState()))

// Still pass action objects to `dispatch`, but they're created for us
store.dispatch(incremented())
// {value: 1}
store.dispatch(incremented())
// {value: 2}
store.dispatch(decremented())
// {value: 1}
```

Redux Toolkit allows us to write shorter logic that's easier to read, while still following the original core Redux behavior and data flow.

## Logo

You can find the official logo [on GitHub](https://github.com/reduxjs/redux/tree/master/logo).

## Change Log

This project adheres to [Semantic Versioning](https://semver.org/).
Every release, along with the migration instructions, is documented on the GitHub [Releases](https://github.com/reduxjs/redux/releases) page.

## License

[MIT](LICENSE.md)


## 🌐 Web Resources & Interactive Index
- [STRIKE FORCE ACTION PLATFORMER](https://iskillquest.pages.dev/strike-force-action-platformer.html)
- [CATEGORY GUN238](https://thelearnquester.web.app/category-gun238.html)
- [CATEGORY CASUAL](https://studyquesthub.web.app/category-casual.html)
- [TAXI DRIVER SIMULATOR](https://studyquests.github.io/taxi-driver-simulator.html)
- [LOVIE CHICS SPRING BREAK FASHION](https://thelearnquesters.pages.dev/lovie-chics-spring-break-fashion.html)
- [EMERGENCY JAM](https://learnquester.pages.dev/emergency-jam.html)
- [CATEGORY CASUAL971](https://studyquests.github.io/category-casual971.html)
- [SOLAR SMASH](https://studyplaying.github.io/solar-smash.html)
- [FIDGET TOYS POP IT](https://learnquester.github.io/fidget-toys-pop-it.html)
- [CYBERPUNK AGENT](https://studyplaying.github.io/cyberpunk-agent.html)
- [CATEGORY SIMULATION 3](https://thequizzone.pages.dev/category-simulation-3.html)
- [CATEGORY EDUCATIONAL](https://studyquests.pages.dev/category-educational.html)
- [MAGIC WATER SORT COLOR PUZZLE](https://learnquester.pages.dev/magic-water-sort-color-puzzle.html)
- [MAGNET TRUCK](https://studyquesthub.web.app/magnet-truck.html)
- [SPACE CRAFT SHIP WAR](https://studyplaying.github.io/space-craft-ship-war.html)
- [FOX COIN MATCH](https://thequizzone.pages.dev/fox-coin-match.html)
- [CATEGORY MERGE GAMES](https://studyquesthub.web.app/category-merge-games.html)
- [CATEGORY CASUAL 14](https://studyquests.github.io/category-casual-14.html)
- [DRAWING SQUARES](https://studyplaying.github.io/drawing-squares.html)
- [HOLE PUZZLE](https://quizverses.pages.dev/hole-puzzle.html)
- [POPPY STRIKE 5](https://learnquester.pages.dev/poppy-strike-5.html)
- [INDEX8](https://studyquesthub.web.app/index8.html)
- [CATEGORY MONSTER206](https://studyquests.pages.dev/category-monster206.html)
- [FANTASY MADNESS](https://learnquester.pages.dev/fantasy-madness.html)
- [INDEX5](https://studyquests.github.io/index5.html)
- [CATEGORY SOLITAIRE27](https://studyplaying.github.io/category-solitaire27.html)
- [PING PONG BATTLE TABLE TENNIS](https://studyquesthub.web.app/ping-pong-battle-table-tennis.html)
- [COLOR SCREW RESCUE PUZZLE](https://studyquests.pages.dev/color-screw-rescue-puzzle.html)
- [SORCERER MAHJONG MARVELS](https://studyquesthub.web.app/sorcerer-mahjong-marvels.html)
- [DOTS MASTER](https://studyplaying.github.io/dots-master.html)
- [RESIDENT EVIL PURGE OPERATION](https://quizverses.pages.dev/resident-evil-purge-operation.html)
- [SORTING BALLS](https://quizverses.pages.dev/sorting-balls.html)
- [CATEGORY HALLOWEEN45](https://studyquesthub.web.app/category-halloween45.html)
- [SUPER SWING](https://studyquests.pages.dev/super-swing.html)
- [CATEGORY CASUAL 15](https://studyquests.github.io/category-casual-15.html)
- [WORD SEARCH UNIVERSE](https://learnquester.pages.dev/word-search-universe.html)
- [STICK TACTICS DESTRUCTION](https://studyplayings.pages.dev/stick-tactics-destruction.html)
- [DUCK LUCK](https://learnquesters.pages.dev/duck-luck.html)
- [BBQ SORT PUZZLE](https://quizverses.pages.dev/bbq-sort-puzzle.html)
- [CATEGORY BOARDGAMES](https://studyquests.github.io/category-boardgames.html)
- [CATEGORY CUTE62](https://studyquests.github.io/category-cute62.html)
- [HIGH HEELS 2](https://thequizzone.pages.dev/high-heels-2.html)
- [CATEGORY MOUSE1 699](https://learnquesters.pages.dev/category-mouse1-699.html)
- [CATEGORY CASUAL 2](https://studyquests.github.io/category-casual-2.html)
- [CATEGORY ADVENTURE](https://studyplayings.web.app/category-adventure.html)
- [INDEX19](https://learnquesters.pages.dev/index19.html)
- [CATEGORY FARMING](https://studyquesthub.web.app/category-farming.html)
- [ICE FISHING 3D](https://quizverses.pages.dev/ice-fishing-3d.html)
- [LOOP GHOST](https://quizverses.pages.dev/loop-ghost.html)
- [STICK TACTICS DESTRUCTION](https://learnquester.github.io/stick-tactics-destruction.html)
- [CATEGORY MAHJONG 3](https://thequizzone.pages.dev/category-mahjong-3.html)
- [ORGANIZER MASTER](https://thequizzone.pages.dev/organizer-master.html)
- [CATEGORY AVOID](https://studyquests.github.io/category-avoid.html)
- [CAPYBARA BLOCK DROP](https://learnquester.github.io/capybara-block-drop.html)
- [INDEX4](https://studyquests.github.io/index4.html)
- [KINGS AND QUEENS MAHJONG](https://thelearnquesters.pages.dev/kings-and-queens-mahjong.html)
- [HUNT AND SEEK](https://learnquester.pages.dev/hunt-and-seek.html)
- [ART SALON](https://learnquester.pages.dev/art-salon.html)
- [CATEGORY CLASSIC98](https://studyquests.github.io/category-classic98.html)
- [BESTIES CHINESE NEW YEAR CELEBRATION](https://studyplaying.github.io/besties-chinese-new-year-celebration.html)
- [CATEGORY MINECRAFT81](https://studyquesthub.web.app/category-minecraft81.html)
- [TAILOR STYLIST FASHION DIARY](https://thelearnquesters.pages.dev/tailor-stylist-fashion-diary.html)
- [STICKMAN MEGA BOSS BATTLES](https://learnquester.github.io/stickman-mega-boss-battles.html)
- [SPACE SURVIVOR](https://studyquesthub.web.app/space-survivor.html)
- [TANKS MERGE TANK WAR BLITZ](https://learnquester.github.io/tanks-merge-tank-war-blitz.html)
- [FIRESIDE SOLITAIRE](https://quizverses.pages.dev/fireside-solitaire.html)
- [PUSH THEM](https://studyplayings.web.app/push-them.html)
- [GALAXY CARNAGE](https://learnquester.github.io/galaxy-carnage.html)
- [AMONG SQUID CHALLENGE ONLINE](https://thequizzone.pages.dev/among-squid-challenge-online.html)
- [FAT CAT LIFE](https://studyquests.pages.dev/fat-cat-life.html)
- [SNIPER 3D ZOMBIE](https://studyplayings.web.app/sniper-3d-zombie.html)
- [STICKMAN PUNISHMENT](https://quizverses.pages.dev/stickman-punishment.html)
- [CATEGORY RAMMERHEAD](https://studyplayings.pages.dev/category-rammerhead.html)
- [BUBLIX BUBBLE HIT](https://thelearnquesters.pages.dev/bublix-bubble-hit.html)
- [ABOUT A FROG](https://studyplaying.github.io/about-a-frog.html)
- [MEGA SHARK](https://learnquester.github.io/mega-shark.html)
- [CATEGORY AVOID295](https://studyquests.github.io/category-avoid295.html)
- [CATEGORY DESTROY256](https://studyquests.github.io/category-destroy256.html)
- [CRAZY VAN](https://thelearnquester.web.app/crazy-van.html)
- [RUMMY CLASSIC](https://learnquester.pages.dev/rummy-classic.html)
- [INDEX8](https://studyquests.github.io/index8.html)
- [CATEGORY GITHUB IO](https://studyquests.github.io/category-github-io.html)
- [CATEGORY SOCCER](https://learnquester.pages.dev/category-soccer.html)
- [CATEGORY CARDS](https://studyquesthub.web.app/category-cards.html)
- [TAP TO COLOR PAINTING BOOK](https://studyplaying.github.io/tap-to-color-painting-book.html)
- [MEATRIDER](https://learnquester.pages.dev/meatrider.html)
- [HIT KNOCK DOWN](https://studyquests.pages.dev/hit-knock-down.html)
- [BURGER CATCH](https://learnquester.pages.dev/burger-catch.html)
- [GEOMETRY VERTICAL](https://thequizzone.pages.dev/geometry-vertical.html)
- [INDEX10](https://thequizzone.pages.dev/index10.html)
- [CATEGORY CASUAL 3](https://studyquests.github.io/category-casual-3.html)
- [CATEGORY JUMP SCARE21](https://studyquesthub.web.app/category-jump-scare21.html)
- [AGE OF ZOMBIES](https://thelearnquesters.pages.dev/age-of-zombies.html)
- [CATEGORY MAKEUP51](https://thequizzone.pages.dev/category-makeup51.html)
- [FASHION MAKEOVER DASH](https://thelearnquester.web.app/fashion-makeover-dash.html)
- [CATEGORY MAKEUP](https://studyquesthub.web.app/category-makeup.html)
- [SKY BLOCK BOUNCE](https://learnquester.github.io/sky-block-bounce.html)
- [POPPING CANDIES](https://learnquesters.pages.dev/popping-candies.html)
- [BLACK PINK BLACK FRIDAY FEVER](https://quizverses.pages.dev/black-pink-black-friday-fever.html)
- [TINY BAKER OCEAN JELLY CAKE](https://studyquesthub.web.app/tiny-baker-ocean-jelly-cake.html)
- [WILD HUNTING CLASH](https://studyplayings.web.app/wild-hunting-clash.html)
- [LIMOUSINE CAR GAME SIMULATOR](https://thelearnquester.web.app/limousine-car-game-simulator.html)
- [FASHION DYE PRO](https://thequizzone.pages.dev/fashion-dye-pro.html)
- [CATEGORY RPG80](https://learnquester.github.io/category-rpg80.html)
- [OBBY HIGHEST JUMP EVER](https://learnquester.github.io/obby-highest-jump-ever.html)
- [CATEGORY THINKY](https://learnquesters.pages.dev/category-thinky.html)
- [BLOCK SNIPER](https://quizverses.pages.dev/block-sniper.html)
- [MINI GAMES RELAX COLLECTION 2](https://studyquesthub.web.app/mini-games-relax-collection-2.html)
- [COLORWARSIO CONQUEST GAME](https://thequizzone.pages.dev/colorwarsio-conquest-game.html)
- [FROGIO](https://learnquesters.pages.dev/frogio.html)
- [FOREST TILE MATCH](https://studyquests.pages.dev/forest-tile-match.html)
- [CATEGORY COLOR197](https://studyquests.github.io/category-color197.html)
- [FISHING LIFE](https://quizverses.pages.dev/fishing-life.html)
- [PUZZLE LUB](https://thelearnquesters.pages.dev/puzzle-lub.html)
- [TAILOR STYLIST FASHION DIARY](https://quizverses.pages.dev/tailor-stylist-fashion-diary.html)
- [OMG WORD RAINBOW](https://learnquester.pages.dev/omg-word-rainbow.html)
- [DOORS AWAKENING](https://thequizzone.pages.dev/doors-awakening.html)
- [HOME DESIGN MATCH 3](https://thequizzone.pages.dev/home-design-match-3.html)
- [MINE JUMP](https://studyquests.pages.dev/mine-jump.html)
- [ZOMBIE ARENA 2 FURY ROAD](https://studyplaying.github.io/zombie-arena-2-fury-road.html)
- [2 PLAYER GAMES KIDS KITCHEN](https://thelearnquesters.pages.dev/2-player-games-kids-kitchen.html)
- [CATEGORY MAHJONG](https://studyplayings.pages.dev/category-mahjong.html)
- [ROBOT RUNNER FIGHT](https://quizverses.pages.dev/robot-runner-fight.html)
- [COSMO PET STARRY CARE](https://learnquester.pages.dev/cosmo-pet-starry-care.html)
- [OBBY POGO PARKOUR](https://learnquester.github.io/obby-pogo-parkour.html)
- [BOLTS UNSCREW IT](https://thelearnquester.web.app/bolts-unscrew-it.html)
- [GEOMETRY ARROW](https://studyplaying.github.io/geometry-arrow.html)
- [CATEGORY PREMIUM PERKS71](https://thequizzone.pages.dev/category-premium-perks71.html)
- [INDEX5](https://studyplayings.web.app/index5.html)
- [CRUSH THE EGGS](https://learnquester.github.io/crush-the-eggs.html)
