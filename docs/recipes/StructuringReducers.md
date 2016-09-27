# Structuring Reducers

At its core, Redux is really a fairly simple design pattern: all your "write" logic goes into a single function, and the only way to run that logic is to give Redux a plain object that describes something that has happened.  The Redux store calls that write logic function and passes in the current state tree and the descriptive object, the write logic function returns some new state tree, and the Redux store notifies any subscribers that the state tree has changed.  

Redux puts some basic constraints on how that write logic function should work.  As described in [Reducers](../basics/Reducers.md), it has to have a signature of `(previousState, action) => newState`, is known as a ***reducer function***, and must be *pure* and predictable.

Beyond that, Redux does not really care how you actually structure your logic inside that reducer function, as long as it obeys those basic rules.  This is both a source of freedom and a source of confusion.  However, there are a number of common patterns that are widely used when writing reducers, as well as a number of related topics and concepts to be aware of.  As an application grows, these patterns play a crucial role in managing reducer code complexity, handling real-world data, and optimizing UI performance.  


### Prerequisite Concepts for Writing Reducers

Some of these concepts are already described elsewhere in the Redux documentation.  Others are generic and applicable outside of Redux itself, and there are numerous existing articles that cover these concepts in detail.  These concepts and techniques form the foundation of writing solid Redux reducer logic.

It is vital that these Prerequisite Concepts are **thoroughly understood** before moving on to more advanced and Redux-specific techniques. A recommended reading list is available at:

#### [Prerequisite Concepts](./reducers/PrerequisiteConcepts.md)  
  
It's also important to note that some of these suggestions may or may not be directly applicable based on architectural decisions in a specific application.  For example, an application using Immutable.js Maps to store data would likely have its reducer logic structured at least somewhat differently than an application using plain Javascript objects.  This documentation primarily assumes use of plain Javascript objects, but many of the principles would still apply if using other tools.
  
  
  
### Reducer Concepts and Techniques

- [Basic Reducer Structure](./reducers/BasicReducerStructure.md)
- [Splitting Reducer Logic](./reducers/SplittingReducerLogic.md)
- [Refactoring Reducers Example](./reducers/RefactoringReducersExample.md)
- [Using `combineReducers`](./reducers/UsingCombineReducers.md)
- [Beyond `combineReducers`](./reducers/BeyondCombineReducers.md)
- [Normalizing State Shape](./reducers/NormalizingStateShape.md)
- [Updating Normalized Data](./reducers/UpdatingNormalizedData.md)
- [Reusing Reducer Logic](./reducers/ReusingReducerLogic.md)
- [Immutable Update Patterns](./reducers/ImmutableUpdatePatterns.md)
- [Initializing State](./reducers/InitializingState.md)
