/**
 * Given a React component, return its name to be displayed.
 *
 * @param  {React} Component
 * @return {String} the name of the component
 */
export default function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}
