
export function StateAndEffect(state, effect) {
  this.effect = effect;
  this.state = state;
}

export function withSideEffect(state, effect) {
  if(state instanceof StateAndEffect) {
    return new StateAndEffect(state.state, function() {
      state.effect.apply(null, arguments);
      effect.apply(null, arguments);
    });
  }
  return new StateAndEffect(state, effect);
}
