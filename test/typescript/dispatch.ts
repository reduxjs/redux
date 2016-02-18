import {Dispatch, Action} from "../../index.d.ts";


declare const dispatch: Dispatch;


const dispatchResult: Action<string> = dispatch({type: 'TYPE'});


type Thunk<O> = () => O;

const dispatchThunkResult: number = dispatch<Thunk<number>, number>(() => 42);
