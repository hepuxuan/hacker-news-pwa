import React from 'react'
import {connect} from 'react-redux'
import {fetchComments} from '../actions'
import { Icon } from 'react-mdl'

class Comment extends React.Component {
  componentDidMount () {
    this.props.fetchComments(this.props.commentId)
  }

  render () {
    const comment = this.props.remoteItems[this.props.commentId] || this.props.localItems[this.props.commentId]
    return comment ? (
      <div>
        <div><Icon name="person" /><span>{`${comment.by} wrote:`}</span></div>
        <div dangerouslySetInnerHTML={{
          __html: comment.text
        }} />
        {
          comment.kids ? <ul>
            {comment.kids.map(commentId => <li><Comment 
              commentId={commentId}
              fetchComments={this.props.fetchComments}
              localItems={this.props.localItems}
              remoteItems={this.props.remoteItems} /></li>)}
          </ul> : null
        }
      </div>) : null
  }
}

@connect(({localItems, remoteItems}) => ({
  localItems,
  remoteItems
}), dispatch => ({
  fetchComments: postId => dispatch(fetchComments(postId))
}))
export default class Comments extends React.Component {
  componentDidMount () {
    this.props.fetchComments(this.props.params.postId)
  }

  render () {
    const post = this.props.remoteItems[this.props.params.postId] || this.props.localItems[this.props.params.postId] || {}
    return (
      <div>
        <h4>{post.title}</h4>
        <ul>
          {post.kids && post.kids.map(commentId => <li><Comment commentId={commentId}
            fetchComments={this.props.fetchComments}
            localItems={this.props.localItems}
            remoteItems={this.props.remoteItems} /></li>)}
        </ul>
      </div>
    )
  }
}
