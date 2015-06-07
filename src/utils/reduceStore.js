export default function reduceStore(getAtom, store) {
  return next => action =>
    next(store(getAtom(), action));
}
