import createStore from './createStore'
import combineReducers from './combineReducers'
import bindActionCreators from './bindActionCreators'
import applyMiddleware from './applyMiddleware'
import compose from './compose'

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if (isCrushed.name !== 'isCrushed' && process.env.NODE_ENV !== 'production') {
  /*eslint-disable no-console */
  console.error(
    'You are currently using minified code outside of NODE_ENV === \'production\'. ' + 
    'This means that you are running a slower development build of Redux. ' + 
    'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 
    'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 
    'to ensure you have the correct code for your production build.'
  ) 
  /*eslint-enable */
}

export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose
}
