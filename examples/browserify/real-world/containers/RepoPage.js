import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadRepo, loadStargazers } from '../actions';
import Repo from '../components/Repo';
import User from '../components/User';
import List from '../components/List';

function loadData(props) {
  const { fullName } = props;
  props.loadRepo(fullName, ['description']);
  props.loadStargazers(fullName);
}

class RepoPage extends Component {
  constructor(props) {
    super(props);
    this.renderUser = this.renderUser.bind(this);
    this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this);
  }

  componentWillMount() {
    loadData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fullName !== this.props.fullName) {
      loadData(nextProps);
    }
  }

  render() {
    const { repo, owner, name } = this.props;
    if (!repo || !owner) {
      return <h1><i>Loading {name} details...</i></h1>;
    }

    const { stargazers, stargazersPagination } = this.props;
    return (
      <div>
        <Repo repo={repo}
                    owner={owner} />
        <hr />
        <List renderItem={this.renderUser}
              items={stargazers}
              onLoadMoreClick={this.handleLoadMoreClick}
              loadingLabel={`Loading stargazers of ${name}...`}
              {...stargazersPagination} />
      </div>
    );
  }

  renderUser(user) {
    return (
      <User user={user}
            key={user.login} />
    );
  }

  handleLoadMoreClick() {
    this.props.loadStargazers(this.props.fullName, true);
  }
}

RepoPage.propTypes = {
  repo: PropTypes.object,
  fullName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  stargazers: PropTypes.array.isRequired,
  stargazersPagination: PropTypes.object,
  loadRepo: PropTypes.func.isRequired,
  loadStargazers: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    entities: state.entities,
    stargazersByRepo: state.pagination.stargazersByRepo
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { entities, stargazersByRepo } = stateProps;
  const { login, name } = ownProps.params;

  const fullName = `${login}/${name}`;
  const repo = entities.repos[fullName];
  const owner = entities.users[login];

  const stargazersPagination = stargazersByRepo[fullName] || { ids: [] };
  const stargazers = stargazersPagination.ids.map(id => entities.users[id]);

  return Object.assign({}, dispatchProps, {
    fullName,
    name,
    repo,
    owner,
    stargazers,
    stargazersPagination
  });
}

export default connect(
  mapStateToProps,
  { loadRepo, loadStargazers },
  mergeProps
)(RepoPage);
