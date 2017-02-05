import React from 'react'
import ReactDOM from 'react-dom'
import Router from 'react-router/HashRouter'
import Match from 'react-router/Match'
import Link from 'react-router/Link'
import { Layout, Header, Content, IconButton, Navigation, Drawer } from 'react-mdl'
import {NewStories, TopStories, BestStories} from './components/topics'
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

function closeDrawer () {
  document.querySelector('.mdl-layout').MaterialLayout.toggleDrawer()
}

const App = (
  <Provider store={store}>
    <Router>
      <Layout fixedHeader>
        <Header title='Hacker News'>
          <Navigation className='hide-on-sm'>
            <Link to='/newstories'>New Stories</Link>
            <Link to='/topstories'>Top Stories</Link>
            <Link to='/beststories'>Best Stories</Link>
          </Navigation>
        </Header>
        <Drawer title="Hacker News">
          <Navigation>
            <Link to='/newstories' onClick={closeDrawer}>New Stories</Link>
            <Link to='/topstories' onClick={closeDrawer}>Top Stories</Link>
            <Link to='/beststories' onClick={closeDrawer}>Best Stories</Link>
          </Navigation>
        </Drawer>
        <Content style={{marginLeft: '10px', marginRight: '10px'}}>
          <Match exactly pattern='/' component={TopStories} />
          <Match exactly pattern='/newstories' component={NewStories} />
          <Match exactly pattern='/topstories' component={TopStories} />
          <Match exactly pattern='/beststories' component={BestStories} />
          <Match exactly pattern='/post/:postId/comment' component={Comments} />
        </Content>
      </Layout>
    </Router>
  </Provider>
)
ReactDOM.render(App, document.getElementById('root'))
