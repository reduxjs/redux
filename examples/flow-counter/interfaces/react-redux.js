declare module 'react-redux' {
  declare type MapStateToProps<State, Props> = (state: State) => Props;
  declare type MapDispatchToProps<Dispatchable, Props> = (dispatch: redux$Dispatch<Dispatchable>) => Props;

  declare function connect<State, Dispatchable, StateProps, ComponentProps, DispatchProps: $Diff<ComponentProps, StateProps>, ComponentDefaultProps, ComponentState>(
    mapStateToProps: MapStateToProps<State, StateProps>,
    mapDispatchToProps: MapDispatchToProps<Dispatchable, DispatchProps>
  ) : (component: ReactClass<ComponentDefaultProps, ComponentProps, ComponentState>) => ReactClass<ComponentDefaultProps, ComponentProps, ComponentState>;

  declare type ProviderProps<S, D> = {
    store: redux$Store<S, D>,
    children?: () => ReactElement<any, any, any>
  };

  declare class Provider<S, D> extends ReactComponent<{}, ProviderProps<S, D>, {}> {}
}
