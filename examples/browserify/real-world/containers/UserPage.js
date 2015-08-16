import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadUser, loadStarred } from '../actions';
import User from '../components/User';
import Repo from '../components/Repo';
import List from '../components/List';
import zip from 'lodash/array/zip';

function loadData(props) {
  const { login } = props;
  props.loadUser(login, ['name']);
  props.loadStarred(login);
}

class UserPage extends Component {
  constructor(props) {
    super(props);
    this.renderRepo = this.renderRepo.bind(this);
    this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this);
  }

  componentWillMount() {
    loadData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.login !== this.props.login) {
      loadData(nextProps);
    }
  }

  render() {
    const { user, login } = this.props;
    if (!user) {
      return <h1><i>Loading {login}’s profile...</i></h1>;
    }

    const { starredRepos, starredRepoOwners, starredPagination } = this.props;
    return (
      <div>
        <User user={user} />
        <hr />
        <List renderItem={this.renderRepo}
              items={zip(starredRepos, starredRepoOwners)}
              onLoadMoreClick={this.handleLoadMoreClick}
              loadingLabel={`Loading ${login}’s starred...`}
              {...starredPagination} />
      </div>
    );
  }

  renderRepo([repo, owner]) {
    return (
      <Repo repo={repo}
            owner={owner}
            key={repo.fullName} />
    );
  }

  handleLoadMoreClick() {
    this.props.loadStarred(this.props.login, true);
  }
}

UserPage.propTypes = {
  login: PropTypes.string.isRequired,
  user: PropTypes.object,
  starredPagination: PropTypes.object,
  starredRepos: PropTypes.array.isRequired,
  starredRepoOwners: PropTypes.array.isRequired,
  loadUser: PropTypes.func.isRequired,
  loadStarred: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    entities: state.entities,
    starredByUser: state.pagination.starredByUser
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { entities, starredByUser } = stateProps;
  const { login } = ownProps.params;

  const user = entities.users[login];
  const starredPagination = starredByUser[login] || { ids: [] };
  const starredRepos = starredPagination.ids.map(id => entities.repos[id]);
  const starredRepoOwners = starredRepos.map(repo => entities.users[repo.owner]);

  return Object.assign({}, dispatchProps, {
    login,
    user,
    starredPagination,
    starredRepos,
    starredRepoOwners
  });
}

export default connect(
  mapStateToProps,
  { loadUser, loadStarred },
  mergeProps
)(UserPage);
