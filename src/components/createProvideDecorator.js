import getDisplayName from '../utils/getDisplayName';

export default function createProvideDecorator(React, Provider) {
  const { Component } = React;

  return function provide(store) {
    return DecoratedComponent => class ProviderDecorator extends Component {
      static displayName = `Provider(${getDisplayName(DecoratedComponent)})`;
      static DecoratedComponent = DecoratedComponent;

      render() {
        return (
          <Provider store={store}>
            {() => <DecoratedComponent {...this.props} />}
          </Provider>
        );
      }
    };
  };
}
