import React from 'react'
import ReactDOM from 'react-dom'
import Router from 'react-router/HashRouter'
import Match from 'react-router/Match'
import Link from 'react-router/Link'
import { Layout, Header, Content, Navigation, Drawer } from 'react-mdl'
import Topics from './components/topics'
import Comments from './components/comment'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { ADD_ITEMS, REPLACE_PAGE_ITEMS } from './actions'
import { Provider } from 'react-redux'

const initialState = {
  local: {
    pageItems: {
      topstories: [],
      beststories: [],
      newstories: []
    },
    items: {}
  },
  remote: {
    pageItems: {
      topstories: [],
      beststories: [],
      newstories: []
    },
    items: {}
  }
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ITEMS:
      return {
        ...state,
        [action.env]: {
          ...state[action.env],
          items: {
            ...state[action.env].items,
            ...action.items
          }
        }
      }
    case REPLACE_PAGE_ITEMS:
      return {
        ...state,
        [action.env]: {
          ...state[action.env],
          pageItems: {
            ...state[action.env].pageItems,
            [action.page]: action.pageItems
          }
        }
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
        <Drawer title='Hacker News'>
          <Navigation>
            <Link to='/newstories' onClick={closeDrawer}>New Stories</Link>
            <Link to='/topstories' onClick={closeDrawer}>Top Stories</Link>
            <Link to='/beststories' onClick={closeDrawer}>Best Stories</Link>
          </Navigation>
        </Drawer>
        <Content style={{marginLeft: '10px', marginRight: '10px'}}>
          <Match exactly pattern='/' component={Topics} />
          <Match exactly pattern='/:page' component={Topics} />
          <Match exactly pattern='/post/:postId/comment' component={Comments} />
        </Content>
      </Layout>
    </Router>
  </Provider>
)
ReactDOM.render(App, document.getElementById('root'))
