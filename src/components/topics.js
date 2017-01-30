import React from 'react'
import Link from 'react-router/Link'
import fetchWithCache from '../fetchWithCache'

export default class Topics extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      posts: []
    }
  }

  componentDidMount () {
    let buffer = []
    fetchWithCache('https://hacker-news.firebaseio.com/v0/topstories.json').then(data => {
      data.forEach(id => {
        fetchWithCache(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(data => {
          buffer.push(data)
          if (buffer.length >= 10) {
            this.setState({
              posts: [
                ...this.state.posts,
                ...buffer
              ]
            })
            buffer = []
          }
        })
      })
    })
  }

  render () {
    return (<ol>{
      this.state.posts.map(post => <li>
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
      </li>)
    }</ol>)
  }
}
