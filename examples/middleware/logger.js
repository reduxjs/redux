export default function loggerMiddleware(next) {
  return action => {
    console.log(action);
    next(action);
  };
}
