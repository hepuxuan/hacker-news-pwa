import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import {fetchPage} from '../actions'

@connect(({hotTopics, localItems, remoteItems}) => ({
  hotTopics,
  localItems,
  remoteItems
}), dispatch => ({
  fetchPage: page => dispatch(fetchPage(page))
}))
class Topics extends React.Component {
  componentDidMount () {
    this.props.fetchPage(this.props.page)
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

export const NewStories = () => <Topics page='newstories' />
export const TopStories = () => <Topics page='topstories' />
export const BestStories = () => <Topics page='beststories' />
