import { connect } from 'react-redux';

import { setVisibilityFilter } from '../actions/visibilityFilter';
import Link from '../components/Link';

import { State, Dispatch } from '../types';
import { VisibilityFilter } from '../types/visibilityFilter';

interface IOwnProps {
  filter: VisibilityFilter;
}

const mapStateToProps = (state: State, ownProps: IOwnProps) => ({
  active: state.visibilityFilter === ownProps.filter
});

const mapDispatchToProps = (dispatch: Dispatch, ownProps: IOwnProps) => ({
  onClick() {
    dispatch(setVisibilityFilter(ownProps.filter));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Link);
