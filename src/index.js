import adaptEnhancer, { adaptEnhancerCreator } from './adaptEnhancer'
import applyMiddleware from './applyMiddleware'
import bindActionCreators from './bindActionCreators'
import combineReducers from './combineReducers'
import compose from './compose'
import createEvent from './createEvent'
import createStore  from './createStore'
import warning from './utils/warning'

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if (
  typeof process !== 'undefined' &&
  process.env.NODE_ENV !== 'production' &&
  typeof isCrushed.name === 'string' &&
  isCrushed.name !== 'isCrushed'
) {
  warning(
    'You are currently using minified code outside of NODE_ENV === \'production\'. ' +
    'This means that you are running a slower development build of Redux. ' +
    'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' +
    'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' +
    'to ensure you have the correct code for your production build.'
  )
}

export {
  adaptEnhancer,
  adaptEnhancerCreator,
  applyMiddleware,
  bindActionCreators,
  combineReducers,
  compose,
  createEvent,
  createStore,
}
