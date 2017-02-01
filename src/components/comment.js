import React from 'react'
import {connect} from 'react-redux'
import {fetchComments} from '../actions'
import { FABButton, Icon } from 'react-mdl'

@connect(({localItems, remoteItems}) => ({
  localItems,
  remoteItems
}), dispatch => ({
  fetchComments: topicId => dispatch(fetchComments(topicId))
}))
export default class Comment extends React.Component {
  componentDidMount () {
    this.props.fetchComments(this.props.params.postId)
  }

  handleGoBack = () => window.history.back()

  render () {
    const post = this.props.remoteItems[this.props.params.postId] || this.props.localItems[this.props.params.postId] || {}

    return (
      <div>
        <h4>{post.title}</h4>
        <ul>
          {post.kids && post.kids.map(commentId => {
            const comment = this.props.remoteItems[commentId] || this.props.localItems[commentId]
            return comment ? <li>
              <div>{`${comment.by} wrote:`}</div>
              <div dangerouslySetInnerHTML={{
                __html: comment.text
              }} />
            </li> : null
          })}
        </ul>
        <FABButton mini ripple onClick={this.handleGoBack}>
          <Icon name='arrow_back' />
        </FABButton>
      </div>
    )
  }
}
