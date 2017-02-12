import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import {fetchPage} from '../actions'

@connect(
  ({local, remote}) => ({
    pageItems: {
      ...local.pageItems,
      ...remote.pageItems
    },
    items: {
      ...local.items,
      ...remote.items
    }
  }), dispatch => ({
    fetchPage (page) {
      dispatch(fetchPage(page))
    }
  })
)
export default class Topics extends React.Component {
  componentDidMount () {
    this.props.fetchPage(this.props.params.page)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.params.page !== nextProps.params.page) {
      this.props.fetchPage(nextProps.params.page)
    }
  }

  render () {
    return (<ol>{
      this.props.pageItems[this.props.params.page].map(id => {
        const post = this.props.items[id]
        return post ? <li key={id}>
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
