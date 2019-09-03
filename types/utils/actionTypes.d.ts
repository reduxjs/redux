/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
declare const ActionTypes: {
    INIT: string;
    REPLACE: string;
    PROBE_UNKNOWN_ACTION: () => string;
};
export default ActionTypes;
//# sourceMappingURL=actionTypes.d.ts.map