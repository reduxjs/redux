export default function compose(...middlewares) {
  return middlewares.reduceRight((composed, m) => m(composed));
}
