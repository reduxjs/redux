import React from 'react';
import Provider from './Provider';
import getDisplayName from '../utils/getDisplayName';

export default function provide(store) {
  return DecoratedComponent => class ProviderDecorator {
    static displayName = `Provider(${getDisplayName(DecoratedComponent)})`;

    render() {
      return (
        <Provider store={store}>
          {props => <DecoratedComponent {...this.props} {...props} />}
        </Provider>
      );
    }
  };
}
