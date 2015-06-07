export default function reduceActions(getAtom, store) {
  return next => action =>
    next(store(getAtom(), action));
}
