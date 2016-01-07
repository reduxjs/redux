import { StateInfoConfig } from 'navigation'

function configureStateInfo() {
  StateInfoConfig.build([
    { key: 'todomvc', initial: 'app', states: [
      { key: 'app', route: '{filter?}', defaults: { filter: 'all' }, trackCrumbTrail: false }
    ] }   
  ])
}
export default configureStateInfo
