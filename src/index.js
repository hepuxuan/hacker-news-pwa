import React from 'react'
import ReactDOM from 'react-dom'
import Router from 'react-router/HashRouter'
import Match from 'react-router/Match'
import Redirect from 'react-router/Redirect'
import Link from 'react-router/Link'
import { Layout, Header, Content, Navigation, Drawer } from 'react-mdl'
import Topics from './components/topics'
import Topic from './components/topic'
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './reducer'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import keyBy from 'lodash/keyBy'
import {save} from './local'
import throttle from 'lodash/throttle'
import flatten from 'lodash/flatten'

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
)

let currentEntities
const persistState = throttle(() => {
  const previousEntities = currentEntities
  currentEntities = store.getState().entities

  if (previousEntities !== currentEntities) {
    // only persist items that are accessible from home page to keep localStorage under 5mb
    const {byIds, items} = currentEntities
    const allTopics = byIds.topstories.concat(byIds.beststories).concat(byIds.newstories)
    // only persist comments 1 level deep to avoid an recursive algorithm to find all comments
    const allComents = flatten(allTopics.map(id => items[id]).map(item => item.kids || []))
    save('hn_state', {
      byIds,
      items: keyBy(allTopics.concat(allComents).map(id => items[id]), 'id')
    })
  }
}, 2500)

store.subscribe(persistState)

function closeDrawer () {
  document.querySelector('.mdl-layout').MaterialLayout.toggleDrawer()
}

const App = (
  <Provider store={store}>
    <Router>
      <Layout fixedHeader>
        <Header title='Hacker News PWA'>
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
          <Match exactly pattern='/' render={() => <Redirect to='/topstories' />} />
          <Match exactly pattern='/:page' component={Topics} />
          <Match exactly pattern='/topic/:postId' component={Topic} />
        </Content>
      </Layout>
    </Router>
  </Provider>
)
ReactDOM.render(App, document.getElementById('root'))
