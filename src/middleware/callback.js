export default function callbackMiddleware(next) {
  return action =>
    typeof action === 'function'
      ? action(next)
      : next(action);
}
