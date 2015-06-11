import getDisplayName from '../utils/getDisplayName';
import shallowEqualScalar from '../utils/shallowEqualScalar';

export default function createConnectDecorator(React, Connector) {
  return function connect(select) {
    return DecoratedComponent => class ConnectorDecorator {
      static displayName = `Connector(${getDisplayName(DecoratedComponent)})`;

      shouldComponentUpdate(nextProps) {
        return !shallowEqualScalar(this.props, nextProps);
      }

      render() {
        return (
          <Connector select={state => select(state, this.props)}>
            {this.renderChild}
          </Connector>
        );
      }

      renderChild(state) {
        return <DecoratedComponent {...state} />;
      }
    };
  };
}
