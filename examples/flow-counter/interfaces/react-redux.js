import type { Component } from 'react';
import type { Dispatch, Store } from 'redux';

declare module 'react-redux' {
  declare type MapStateToProps<State, Props> = (state: State) => Props;
  declare type MapDispatchToProps<Dispatchable, Props> = (dispatch: Dispatch<Dispatchable>) => Props;

  declare function connect<State, Dispatchable, ComponentProps, DefaultProps, ComponentState, StateProps, DispatchProps: $Diff<ComponentProps, StateProps>>(
    mapStateToProps: MapStateToProps<State, StateProps>,
    mapDispatchToProps: MapDispatchToProps<Dispatchable, DispatchProps>
  ) : (component: Component<DefaultProps, ComponentProps, ComponentState>) => Component<DefaultProps, ComponentProps, ComponentState>;

  declare type ProviderProps<S, D> = {
    // TODO: For some super weird reason I need to use this global declaration of the store,
    // otherwise this doesn't run type checks (never throws an error).
    // If I use the Store type imported from 'redux' here, it will treat it as "any"
    store: redux$Store<S, D>,
    children?: () => ReactElement<any, any, any>
  };

  declare class Provider<S, D> extends ReactComponent<{}, ProviderProps<S, D>, {}> {}
}
