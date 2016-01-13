import createStore from './createStore'
import combineReducers from './combineReducers'
import bindActionCreators from './bindActionCreators'
import applyMiddleware from './applyMiddleware'
import compose from './compose'

/*
* create a function so that we can check if the function name has been altered by minification
* if the function has been minified and NODE_ENV !== 'production', warn the user
*/
function isCrushed() {}

if (isCrushed.name !== 'isCrushed' && process.env.NODE_ENV !== 'production') {
  /*eslint-disable no-console */
  console.error('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 
    'This means that you are running a slower development only build of Redux. ' + 
    'Consult tools such as loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 
    'and DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 
    'to build with proper NODE_ENV') 
  /*eslint-enable */
}

export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose
}
