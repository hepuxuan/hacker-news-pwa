import React from 'react'
import {connect} from 'react-redux'
import {fetchTopic} from '../actions'
import { Icon } from 'react-mdl'
import Spinner from './Spinner'

class Comment extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isVisible: true
    }
  }

  toggleComment = e => {
    e.preventDefault()
    this.setState({
      isVisible: !this.state.isVisible
    })
  }

  render () {
    const comment = this.props.items[this.props.commentId]
    return comment ? (
      <div>
        <div>
          <Icon style={{fontSize: '1em'}} name="person" />
          <span style={{color: '#828282'}}>
            {`${comment.by}`}&nbsp;
            <a style={{textDecoration: 'none'}} onClick={this.toggleComment} href="#">{this.state.isVisible
              ? '[-]' : '[+]'}</a>
          </span>
        </div>
        <div style={ this.state.isVisible ? {} : {display: 'none'}}>
          <div dangerouslySetInnerHTML={{
            __html: comment.text
          }} />
          {
            comment.kids ? <ul className='comment-list'>
              {comment.kids.map(commentId => <li key={commentId}><Comment
                commentId={commentId}
                items={this.props.items} /></li>)}
            </ul> : null
          }
        </div>
      </div>) : <Spinner />
  }
}

@connect(
  ({entities, ui}) => ({
    items: entities.items,
    ui: ui.topic
  }), dispatch => ({
    fetchTopic (postId) {
      dispatch(fetchTopic(postId))
    }
  })
)
export default class Topic extends React.Component {
  componentDidMount () {
    this.props.fetchTopic(this.props.params.postId)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !nextProps.ui.isLoading
  }

  render () {
    const post = this.props.items[this.props.params.postId]
    return post ? <div>
      <h4>{post.title}</h4>
      <ul className='comment-list'>
        {post.kids && post.kids.map(commentId => <li><Comment commentId={commentId}
          items={this.props.items} /></li>)}
      </ul>
    </div> : null
  }
}
