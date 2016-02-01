Redux is designed to provide predictible state management for large applications. If this doesn't describe your project needs then redux is 
probably an unecessary complication.

> Do you need predictable state when all your app displays is a list of read-only items on a couple of pages? No.

-- [https://twitter.com/dan_abramov/status/690586622656647174](https://twitter.com/dan_abramov/status/690586622656647174)

> A lot of people sit down to build an app and want to define their data model, and they think they need to use Flux to do it. This is the wrong way to adopt Flux. Flux should only be added once many components have already been built. 

> React components are arranged in a hierarchy. Most of the time, your data model also follows a hierarchy. In these situations Flux doesn’t buy you much. Sometimes, however, your data model is not hierarchical. When your React components start to receive props that feel extraneous, or you have a small number of components starting to get very complex, then you might want to look into Flux.

> **You’ll know when you need Flux. If you aren’t sure if you need it, you don’t need it.**

-- From [React Howto](https://github.com/petehunt/react-howto#learning-flux)
