import type { Dispatch, Store } from 'redux'

declare module 'react-redux' {

  /*

    S = State
    A = Action
    OP = OwnProps
    SP = StateProps
    DP = DispatchProps

  */

  declare type MapStateToProps<S, OP: Object, SP: Object> = (state: S, ownProps: OP) => SP | MapStateToProps<S, OP, SP>;

  declare type MapDispatchToProps<A, OP: Object, DP: Object> = ((dispatch: Dispatch<A>, ownProps: OP) => DP) | DP;

  declare type MergeProps<SP, DP: Object, OP: Object, P: Object> = (stateProps: SP, dispatchProps: DP, ownProps: OP) => P;

  declare type StatelessComponent<P> = (props: P) => ?React$Element<any>;

  declare class ConnectedComponent<OP, P, Def, St> extends React$Component<void, OP, void> {
    static WrappedComponent: Class<React$Component<Def, P, St>>;
    getWrappedInstance(): React$Component<Def, P, St>;
    static defaultProps: void;
    props: OP;
    state: void;
  }

  declare type ConnectedComponentClass<OP, P, Def, St> = Class<ConnectedComponent<OP, P, Def, St>>;

  declare type Connector<OP, P> = {
    (component: StatelessComponent<P>): ConnectedComponentClass<OP, P, void, void>;
    <Def, St>(component: Class<React$Component<Def, P, St>>): ConnectedComponentClass<OP, P, Def, St>;
  };

  declare class Provider<S, A> extends React$Component<void, { store: Store<S, A>, children?: any }, void> { }

  declare type ConnectOptions = {
    pure?: boolean,
    withRef?: boolean
  };

  declare function connect<A, OP>(
    options?: ConnectOptions
  ): Connector<OP, { dispatch: Dispatch<A> } & OP>;

  declare function connect<S, A, OP, SP>(
    mapStateToProps: MapStateToProps<S, OP, SP>,
    options?: ConnectOptions
  ): Connector<OP, SP & { dispatch: Dispatch<A> }>;

  declare function connect<A, OP, DP>(
    mapStateToProps: null,
    mapDispatchToProps: MapDispatchToProps<A, OP, DP>,
    options?: ConnectOptions
  ): Connector<OP, DP & OP>;

  declare function connect<S, A, OP, SP, DP>(
    mapStateToProps: MapStateToProps<S, OP, SP>,
    mapDispatchToProps: MapDispatchToProps<A, OP, DP>,
    options?: ConnectOptions
  ): Connector<OP, SP & DP>;

  declare function connect<S, A, OP, SP, DP, P>(
    mapStateToProps: MapStateToProps<S, OP, SP>,
    mapDispatchToProps: MapDispatchToProps<A, OP, DP>,
    mergeProps: MergeProps<SP, DP, OP, P>,
    options?: ConnectOptions
  ): Connector<OP, P>;

}
