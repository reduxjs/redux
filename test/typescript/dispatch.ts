import {Dispatch, Action} from "../../index.d.ts";


declare const dispatch: Dispatch;


const dispatchResult: Action = dispatch({type: 'TYPE'});


type Thunk<O> = () => O;

const dispatchThunkResult: number = dispatch(() => 42);
