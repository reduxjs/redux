import React, { Component, PropTypes } from 'react';
import pick from 'lodash/object/pick';
import identity from 'lodash/utility/identity';

const contextTypes = {
  getActions: PropTypes.func.isRequired
};

export default function performs(...actionKeys) {
  let mapActions = identity;

  // Last argument may be a custom mapState function
  const lastIndex = actionKeys.length - 1;
  if (typeof actionKeys[lastIndex] === 'function') {
    [mapActions] = actionKeys.splice(lastIndex, 1);
  }

  return function (DecoratedComponent) {
    const wrappedDisplayName =
      DecoratedComponent.displayName ||
      DecoratedComponent.name ||
      'Component';

    return class extends Component {
      static displayName = `ReduxPerforms(${wrappedDisplayName})`;
      static contextTypes = contextTypes;

      constructor(props, context) {
        super(props, context);
        this.updateActions(props);
      }

      componentWillReceiveProps(nextProps) {
        this.updateActions(nextProps);
      }

      updateActions(props) {
        this.actions = mapActions(
          pick(this.context.getActions(), actionKeys),
          props
        );
      }

      render() {
        return (
          <DecoratedComponent {...this.actions} />
        );
      }
    };
  };
}
