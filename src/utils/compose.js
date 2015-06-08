export default function compose(...middlewares) {
  return next =>
    middlewares.reduceRight((_next, middleware) => middleware(_next), next);
}
