export default function composeMiddleware(...middlewares) {
  return next =>
    middlewares.reduceRight((_next, middleware) => middleware(_next), next);
}
