import { StateInfoConfig } from 'navigation'
import { SHOW_ALL } from './constants/TodoFilters'

function configureStateInfo() {
  StateInfoConfig.build([
    { key: 'todomvc', initial: 'app', states: [
      { key: 'app', route: '{filter?}', defaults: { filter: SHOW_ALL }, trackCrumbTrail: false }
    ] }   
  ])
}
export default configureStateInfo
