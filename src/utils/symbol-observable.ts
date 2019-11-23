export default (() =>
  (typeof Symbol === 'function' && Symbol.observable) || '@@observable')()
