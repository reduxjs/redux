import { Component, PropTypes } from 'react';
import mapValues from 'lodash/object/mapValues';
import identity from 'lodash/utility/identity';

export default class ReduxContainer extends Component {
  static contextTypes = {
    redux: PropTypes.object.isRequired
  };

  static propTypes = {
    children: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    stores: PropTypes.oneOfType([
      PropTypes.func.isRequired,
      PropTypes.arrayOf(PropTypes.func.isRequired).isRequired,
      PropTypes.object.isRequired
    ]).isRequired
  }

  static defaultProps = {
    stores: [],
    actions: {}
  };

  constructor(props, context) {
    super(props, context);
    this.handleChange = this.handleChange.bind(this);
    this.update(props);
  }

  componentWillReceiveProps(nextProps) {
    this.update(nextProps);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  update(props) {
    const { wrapActionCreator, observeStores } = this.context.redux;
    this.actions = mapValues(props.actions, wrapActionCreator);
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    let stores = props.stores;
    let mapState = identity;
    if (typeof props.stores === 'function') {
      const store = props.stores;
      stores = [store];
      mapState = state => state[store.name];
    }

    this.mapState = mapState;
    this.unsubscribe = observeStores(stores, this.handleChange);
  }

  handleChange(stateFromStores) {
    const nextState = this.mapState(stateFromStores);
    if (this.state) {
      this.setState(nextState);
    } else {
      this.state = nextState;
    }
  }

  render() {
    return this.props.children({
      ...this.actions,
      ...this.state
    });
  }
}
