import { connect } from "react-redux";
import { Dispatch } from "redux";
import { setVisibilityFilter, VisibilityFilters } from "../actions";
import Link from "../components/Link";
import { State } from "../reducers";

interface OwnProps {
  filter: VisibilityFilters;
}

const mapStateToProps = (state: State, ownProps: OwnProps) => ({
  active: ownProps.filter === state.visibilityFilter
});

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) => ({
  onClick: () => {
    dispatch(setVisibilityFilter(ownProps.filter));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Link);
