export default function composeMiddleware(...middlewares) {
  return middlewares.reduceRight((composed, m) => m(composed));
}
