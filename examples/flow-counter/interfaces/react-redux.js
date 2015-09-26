import type { Dispatch } from 'redux';
import type { Component } from 'react';

declare module 'react-redux' {
  declare type MapStateToProps<State, Props> = (state: State) => Props;
  declare type MapDispatchToProps<Dispatchable, Props> = (dispatch: Dispatch<Dispatchable>) => Props;

  declare function connect<State, Dispatchable, ComponentProps, DefaultProps, ComponentState, StateProps, DispatchProps: $Diff<ComponentProps, StateProps>>(
    mapStateToProps: MapStateToProps<State, StateProps>,
    mapDispatchToProps: MapDispatchToProps<Dispatchable, DispatchProps>
  ) : (component: Component<DefaultProps, ComponentProps, ComponentState>) => Component<DefaultProps, ComponentProps, ComponentState>;
}
