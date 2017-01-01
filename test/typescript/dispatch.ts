import {Dispatch, Action} from "../../";


declare const dispatch: Dispatch<any>;


const dispatchResult: Action = dispatch({type: 'TYPE'});

declare module "../../" {
    export interface Dispatch<S> {
        <R>(asyncAction: (dispatch: Dispatch<S>, getState: () => S) => R): R;
    }
}

const dispatchThunkResult: number = dispatch(() => 42);
