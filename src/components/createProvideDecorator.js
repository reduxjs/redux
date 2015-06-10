import getDisplayName from '../utils/getDisplayName';

export default function createProvideDecorator(React, Provider) {
  return function provide(redux) {
    return DecoratedComponent => class ProviderDecorator {
      static displayName = `Provider(${getDisplayName(DecoratedComponent)})`;

      render() {
        return (
          <Provider redux={redux}>
            {props => <DecoratedComponent {...this.props} {...props} />}
          </Provider>
        );
      }
    };
  };
}
