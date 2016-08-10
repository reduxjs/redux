import { StateNavigator } from 'navigation'
import { SHOW_ALL } from '../constants/TodoFilters'

export default function configureRouter() {
  return new StateNavigator([
    { key: 'todomvc', route: '', defaults: { filter: SHOW_ALL } }
  ])
}
