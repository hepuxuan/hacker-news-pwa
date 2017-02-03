import React from 'react'
import ReactDOM from 'react-dom'
import Router from 'react-router/HashRouter'
import Match from 'react-router/Match'
import { Layout, Header, Content, IconButton } from 'react-mdl'
import Topics from './components/topics'
import Comments from './components/comment'
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

const handleGoBack = () => window.history.back()
const handleGoForward = () => window.history.go(1)

const App = (
  <Provider store={store}>
    <Router>
      <Layout fixedHeader>
        <Header style={{position: 'fixed'}} title='Hacker News'>
          <IconButton style={{position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '5px'}} name='arrow_back' onClick={handleGoBack} />
          <IconButton style={{position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '5px'}} name='arrow_forward' onClick={handleGoForward} />
        </Header>
        <Content style={{marginLeft: '10px', marginRight: '10px'}}>
          <Match exactly pattern='/' component={Topics} />
          <Match exactly pattern='/post/:postId/comment' component={Comments} />
        </Content>
      </Layout>
    </Router>
  </Provider>
)
ReactDOM.render(App, document.getElementById('root'))
