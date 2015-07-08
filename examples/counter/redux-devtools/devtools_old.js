export const StateKeys = {
  ACTIONS: '@@actions',
  DISABLED_ACTIONS: '@@disabledActions',
  STATES: '@@states',
  INITIAL_STATE: '@@initialState',
  ERROR: '@@error'
};

export const ActionTypes = {
  INIT: '@@INIT',
  ROLLBACK: '@@ROLLBACK',
  SWEEP: '@@SWEEP',
  COMMIT: '@@COMMIT',
  TOGGLE_ACTION: '@@TOGGLE_ACTION',
  JUMP_TO_STATE: '@@JUMP_TO_STATE',
  RESET: '@@RESET'
};

export default function monitor(store) {
  return function Recorder(state = {}, action) {
    let {
      [StateKeys.ACTIONS]: actions = [],
      [StateKeys.DISABLED_ACTIONS]: disabledActions = {},
      [StateKeys.STATES]: atoms = [],
      [StateKeys.INITIAL_STATE]: initialAtom = state,
      [StateKeys.ERROR]: error = null,
      ...atom
    } = state;

    switch (action.type) {
    case ActionTypes.RESET:
      return Recorder({}, { type: ActionTypes.INIT });
    case ActionTypes.COMMIT:
      actions = [];
      disabledActions = {};
      atoms = [];
      initialAtom = atom;
      break;
    case ActionTypes.ROLLBACK:
      actions = [];
      disabledActions = {};
      atoms = [];
      initialAtom = initialAtom; // sic
      break;
    case ActionTypes.SWEEP:
      actions = actions.filter((_, i) => !disabledActions[i]);
      atoms = atoms.filter((_, i) => !disabledActions[i]);
      disabledActions = {};
      break;
    case ActionTypes.TOGGLE_ACTION:
      if (action.toggleMany) {
        disabledActions = {};
        for (let i = 0; i < actions.length; i++) {
          disabledActions[i] = i > action.index;
        }
      } else {
        disabledActions = {
          ...disabledActions,
          [action.index]: !disabledActions[action.index]
        };
      }
      break;
    }

    error = null;
    actions = [...actions, action];
    atoms = actions.reduce((allAtoms, nextAction) => {
      const index = allAtoms.length;
      const prevAtom = index > 0 ?
        allAtoms[index - 1] :
        initialAtom;

      if (error || disabledActions[index] === true) {
        allAtoms.push(prevAtom);
      } else {
        try {
          allAtoms.push(store(prevAtom, nextAction));
        } catch (err) {
          error = {
            index: index,
            text: err.toString()
          };
          console.error(err);
          allAtoms.push(prevAtom);
        }
      }

      return allAtoms;
    }, []);
    const nextAtom = atoms[atoms.length - 1];

    switch (action.type) {
    case ActionTypes.INIT:
      if (atoms.length > 1) {
        atoms.pop();
        actions.pop();
      }
      break;
    case ActionTypes.TOGGLE_ACTION:
    case ActionTypes.SWEEP:
      atoms.pop();
      actions.pop();
      break;
    }

    return {
      [StateKeys.ACTIONS]: actions,
      [StateKeys.DISABLED_ACTIONS]: disabledActions,
      [StateKeys.STATES]: atoms,
      [StateKeys.INITIAL_STATE]: initialAtom,
      [StateKeys.ERROR]: error,
      ...nextAtom
    };
  };
}
