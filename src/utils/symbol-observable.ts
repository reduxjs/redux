declare global {
  interface SymbolConstructor {
    readonly observable: symbol
  }
}

export const $$observable = /* #__PURE__ */ (() =>
  (typeof Symbol === 'function' && Symbol.observable) || '@@observable')()
