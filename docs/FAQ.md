# Redux FAQ

## Table of Contents

- **General**
  - <a id="general-when-to-use"></a>[When should I use Redux?](faq/General.md#general-when-to-use) 
  - <a id="general-only-react"></a>[Can Redux only be used with React?](faq/General.md#general-only-react) 
  - <a id="general-build-tools"></a>[Do I need to have a particular build tool to use Redux?](faq/General.md#general-build-tools) 
- **Reducers**
  - <a id="reducers-share-state"></a>[How do I share state between two reducers? Do I have to use combineReducers?](faq/Reducers.md#reducers-share-state) 
  - <a id="reducers-use-switch"></a>[Do I have to use the switch statement to handle actions?](faq/Reducers.md#reducers-use-switch) 
- **Organizing State**
  - <a id="organizing-state-only-redux-state"></a>[Do I have to put all my state into Redux? Should I ever use React's setState()?](faq/OrganizingState.md#organizing-state-only-redux-state) 
  - <a id="organizing-state-non-serializable"></a>[Can I put functions, promises, or other non-serializable items in my store state?](faq/OrganizingState.md#organizing-state-non-serializable) 
  - <a id="organizing-state-nested-data"></a>[How do I organize nested or duplicate data in my state?](faq/OrganizingState.md#organizing-state-nested-data) 
- **Store Setup**
  - <a id="store-setup-multiple-stores"></a>[Can or should I create multiple stores? Can I import my store directly, and use it in components myself?](faq/StoreSetup.md#store-setup-multiple-stores) 
  - <a id="store-setup-middleware-chains"></a>[Is it OK to have more than one middleware chain in my store enhancer? What is the difference between next and dispatch in a middleware function?](faq/StoreSetup.md#store-setup-middleware-chains) 
  - <a id="store-setup-subscriptions"></a>[How do I subscribe to only a portion of the state? Can I get the dispatched action as part of the subscription?](faq/StoreSetup.md#store-setup-subscriptions) 
- **Actions**
  - <a id="actions-string-constants"></a>[Why should type be a string, or at least serializable? Why should my action types be constants?](faq/Actions.md#actions-string-constants) 
  - <a id="actions-reducer-mappings"></a>[Is there always a one-to-one mapping between reducers and actions?](faq/Actions.md#actions-reducer-mappings)
  - <a id="actions-side-effects"></a>[How can I represent “side effects” such as AJAX calls? Why do we need things like “action creators”, “thunks”, and “middleware” to do async behavior?](faq/Actions.md#actions-side-effects) 
  - <a id="actions-multiple-actions"></a>[Should I dispatch multiple actions in a row from one action creator?](faq/Actions.md#actions-multiple-actions) 
- **Code Structure**  
  - <a id="structure-file-structure"></a>[What should my file structure look like? How should I group my action creators and reducers in my project? Where should my selectors go?](faq/CodeStructure.md#structure-file-structure)
  - <a id="structure-business-logic"></a>[How should I split my logic between reducers and action creators? Where should my “business logic” go?](faq/CodeStructure.md#structure-business-logic) 
- **Performance**
  - <a id="performance-scaling"></a>[How well does Redux “scale” in terms of performance and architecture?](faq/Performance.md#performance-scaling)
  - <a id="performance-all-reducers"></a>[Won't calling “all my reducers” for each action be slow?](faq/Performance.md#performance-all-reducers)
  - <a id="performance-clone-state"></a>[Do I have to deep-clone my state in a reducer? Isn't copying my state going to be slow?](faq/Performance.md#performance-clone-state)
  - <a id="performance-update-events"></a>[How can I reduce the number of store update events?](faq/Performance.md#performance-update-events)
  - <a id="performance-state-memory"></a>[Will having “one state tree” cause memory problems? Will dispatching many actions take up memory?](faq/Performance.md#performance-state-memory)
- **React Redux**
  - <a id="react-not-rerendering"></a>[Why isn't my component re-rendering, or my mapStateToProps running?](faq/ReactRedux.m#react-not-rerendering)
  - <a id="react-rendering-too-often"></a>[Why is my component re-rendering too often?](faq/ReactRedux.m#react-rendering-too-often)
  - <a id="react-mapstate-speed"></a>[How can I speed up my mapStateToProps?](faq/ReactRedux.m#react-mapstate-speed)
  - <a id="react-props-dispatch"></a>[Why don't I have this.props.dispatch available in my connected component?](faq/ReactRedux.m#react-props-dispatch)
  - <a id="react-multiple-components"></a>[Should I only connect my top component, or can I connect multiple components in my tree?](faq/ReactRedux.m#react-multiple-components)
- **Miscellaneous**
  - <a id="miscellaneous-real-projects"></a>[Are there any larger, “real” Redux projects?](faq/Miscellaneous.md#miscellaneous-real-projects)
  - <a id="miscellaneous-authentication"></a>[How can I implement authentication in Redux?](faq/Miscellaneous.md#miscellaneous-authentication)


