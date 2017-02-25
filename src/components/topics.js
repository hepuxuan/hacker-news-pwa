import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import {fetchTopics} from '../actions'

@connect(
  ({entities, ui}) => ({
    byIds: entities.byIds,
    items: entities.items,
    ui
  }), dispatch => ({
    fetchTopics (page) {
      dispatch(fetchTopics(page))
    }
  })
)
export default class Topics extends React.Component {
  componentDidMount () {
    this.props.fetchTopics(this.props.params.page)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.params.page !== nextProps.params.page) {
      this.props.fetchTopics(nextProps.params.page)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !nextProps.ui[nextProps.params.page].isLoading
  }

  render () {
    return (<ol>{
      this.props.byIds[this.props.params.page].map(id => {
        const post = this.props.items[id]
        return post ? <li key={id}>
          <a href={post.url}>{post.title}</a>
          <p>
            {`${post.score} points by ${post.by}`}
            {
              post.descendants ? <span>
                {` | ${post.descendants} `}
                <Link to={`/topic/${post.id}`}>comment</Link>
              </span> : null
            }
          </p>
        </li> : null
      })
    }</ol>)
  }
}
