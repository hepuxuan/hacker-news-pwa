import React from 'react'
import ReactDOM from 'react-dom'
import Router from 'react-router/HashRouter'
import Match from 'react-router/Match'
import { Layout, Header, Content } from 'react-mdl'
import Topics from './components/topics'
import Comment from './components/comment'

const App = (
  <Router>
    <Layout>
      <Header title='Hacker News Top Topics' />
      <Content>
        <Match exactly pattern='/' component={Topics} />
        <Match exactly pattern='/post/:postId/comment' component={Comment} />
      </Content>
    </Layout>
  </Router>
)
ReactDOM.render(App, document.getElementById('root'))
