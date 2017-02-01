import React from 'react'
import Link from 'react-router/Link'
import {connect} from 'react-redux'
import {fetchHotTopics} from '../actions'

@connect(({hotTopics, localItems, remoteItems}) => ({
  hotTopics,
  localItems,
  remoteItems
}), dispatch => ({
  fetchHotTopics: () => dispatch(fetchHotTopics())
}))
export default class Topics extends React.Component {
  componentDidMount () {
    this.props.fetchHotTopics()
  }

  render () {
    return (<ol>{
      this.props.hotTopics.map(id => {
        const post = this.props.remoteItems[id] || this.props.localItems[id]
        return post ? <li>
          <a href={post.url}>{post.title}</a>
          <p>
            {`${post.score} points by ${post.by}`}
            {
              post.descendants ? <span>
                {` | ${post.descendants} `}
                <Link to={`/post/${post.id}/comment`}>comment</Link>
              </span> : null
            }
          </p>
        </li> : null
      })
    }</ol>)
  }
}
