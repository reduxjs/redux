import type { Action } from '../types/actions'
import { isPlainObject } from './isPlainObject'

export function isAction(action: unknown): action is Action<string> {
  return (
    isPlainObject(action) &&
    'type' in action &&
    typeof (action as Record<'type', unknown>).type === 'string'
  )
}
