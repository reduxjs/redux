export default function composeMiddleware(...middlewares) {
  return next =>
    middlewares.reduce((_next, middleware) => middleware(_next), next);
}
