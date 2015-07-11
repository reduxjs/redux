export default function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}
