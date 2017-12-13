import {Dispatch, Action} from "redux"


declare const dispatch: Dispatch<any>;

const dispatchResult: Action = dispatch({type: 'TYPE'});

// thunk
declare module "redux" {
    export interface Dispatch<D> {
        <R>(asyncAction: (dispatch: Dispatch<D>, getState: () => any) => R): R;
    }
}

const dispatchThunkResult: number = dispatch(() => 42);
const dispatchedTimerId: number = dispatch(d => setTimeout(() => d({type: 'TYPE'}), 1000));
