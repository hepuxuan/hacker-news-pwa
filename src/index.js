import React from 'react'
import ReactDOM from 'react-dom'
import Router from 'react-router/HashRouter'
import Match from 'react-router/Match'
import { Layout, Header, Content } from 'react-mdl'
import Topics from './components/topics'
import Comment from './components/comment'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { ADD_LOCAL_ITEMS, ADD_REMOTE_ITEMS, REPLACE_HOT_TOPICS } from './actions'
import { Provider } from 'react-redux'

const initialState = {
  hotTopics: [],
  localItems: {},
  remoteItems: {}
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_LOCAL_ITEMS:
      return {
        ...state,
        localItems: Object.assign({}, state.localItems, action.localItems)
      }
    case ADD_REMOTE_ITEMS:
      return {
        ...state,
        remoteItems: Object.assign({}, state.remoteItems, action.remoteItems)
      }
    case REPLACE_HOT_TOPICS:
      return {
        ...state,
        hotTopics: action.topics
      }
    default:
      return state
  }
}

const store = createStore(
  reducer,
  applyMiddleware(thunk)
)

window.store = store

const App = (
  <Provider store={store}>
    <Router>
      <Layout fixedHeader>
        <Header title='Hacker News' />
        <Content style={{marginLeft: '10px', marginRight: '10px'}}>
          <Match exactly pattern='/' component={Topics} />
          <Match exactly pattern='/post/:postId/comment' component={Comment} />
        </Content>
      </Layout>
    </Router>
  </Provider>
)
ReactDOM.render(App, document.getElementById('root'))
