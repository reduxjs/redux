import React from 'react';

export default class PostDetail {

  componentWillMount() {
    this.props.fetchPost(this.props.params.postId);
  }

  componentDidUpdate (prevProps) {
    const postId = this.props.params.postId;
    if (prevProps.params.postId !== postId) {
      this.props.fetchPost(postId);
    }
  }

  render() {
    return (
      <div>
        <h1>{this.props.post.title}</h1>
        <code>{this.props.post.body}></code>
      </div>
    );
  }
}
