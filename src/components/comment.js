import React from 'react'
import fetchWithCache from '../fetchWithCache'

export default class Comment extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      comments: [],
      post: {}
    }
  }

  componentDidMount () {
    fetchWithCache(`https://hacker-news.firebaseio.com/v0/item/${this.props.params.postId}.json`).then(data => {
      this.setState({
        post: data
      })
      data.kids.forEach(id => {
        fetchWithCache(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(data => {
          this.setState({
            comments: [
              ...this.state.comments,
              data
            ]
          })
        })
      })
    })
  }

  render () {
    return (
      <div>
        <h4>{this.state.post.title}</h4>
        <ul>
          {this.state.comments.map(comment => <li>
            <div>{`${comment.by} wrote:`}</div>
            <div dangerouslySetInnerHTML={{
              __html: comment.text
            }} />
          </li>)}
        </ul>
      </div>
    )
  }
}
