import React from 'react'
import {connect} from 'react-redux'
import {fetchComments} from '../actions'

class Comment extends React.Component {
  componentDidMount () {
    this.props.fetchComments(this.props.commentId)
  }

  render () {
    const comment = this.props.items[this.props.commentId]
    return comment ? (
      <div>
        <div><span>{`${comment.by} wrote:`}</span></div>
        <div dangerouslySetInnerHTML={{
          __html: comment.text
        }} />
        {
          comment.kids ? <ul className='comment-list'>
            {comment.kids.map(commentId => <li key={commentId}><Comment
              commentId={commentId}
              fetchComments={this.props.fetchComments}
              items={this.props.items} /></li>)}
          </ul> : null
        }
      </div>) : null
  }
}

@connect(
  ({local, remote}) => ({
    items: {
      ...local.items,
      ...remote.items
    }
  }), dispatch => ({
    fetchComments (postId) {
      dispatch(fetchComments(postId))
    }
  })
)
export default class Comments extends React.Component {
  componentDidMount () {
    this.props.fetchComments(this.props.params.postId)
  }

  render () {
    const post = this.props.items[this.props.params.postId]
    return post ? <div>
      <h4>{post.title}</h4>
      <ul className='comment-list'>
        {post.kids && post.kids.map(commentId => <li><Comment commentId={commentId}
          fetchComments={this.props.fetchComments}
          items={this.props.items} /></li>)}
      </ul>
    </div> : null
  }
}
