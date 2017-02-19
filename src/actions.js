import { fetchFromLocal, pushToLocal, clearLocal } from './local'
import Promise from 'promise-polyfill'
import firebase from 'firebase'
import throttle from 'lodash/throttle'
import Push from 'push.js'

export const ADD_ITEMS = 'ADD_ITEMS'
export const REPLACE_PAGE_ITEMS = 'REPLACE_PAGE_ITEMS'
const PUSH_INTERVAL = 10 * 60 * 1000

firebase.initializeApp({
  databaseURL: 'hacker-news.firebaseio.com'
})

const api = firebase.database().ref('/v0')

const addItems = (items, env) => ({
  type: ADD_ITEMS,
  items,
  env
})

const replacePageItems = (page, pageItems, env) => ({
  type: REPLACE_PAGE_ITEMS,
  page,
  pageItems,
  env
})

function fetchItem (path, cb) {
  api.child(path).off()
  api.child(path)
    .on('value', (snapshot) => cb(snapshot.val()))
}

function fetchItemsFromRemote (items, cb) {
  return (dispatch, getState) => {
    let buffer = {}
    const dispatchUpdate = throttle(() => {
      dispatch(addItems(buffer, 'remote'))
      buffer = {}
    }, 300)
    items.forEach(id => {
      if (!getState().remote.items[id]) {
        fetchItem(`item/${id}`, data => {
          pushToLocal(id, data)
          buffer[id] = data
          if (cb) {
            cb(data)
          }
          dispatchUpdate()
        })
      }
    })
  }
}

function fetchItemsFromLocal (items) {
  return (dispatch, getState) => {
    let buffer = {}
    const dispatchUpdate = throttle(() => {
      dispatch(addItems(buffer, 'remote'))
      buffer = {}
    }, 150)
    Promise.all(items.map(id => {
      if (!getState().local.items[id]) {
        return fetchFromLocal(id)
          .then(data => {
            buffer[id] = data
            dispatchUpdate()
          })
      } else {
        return Promise.resolve()
      }
    })).then(() => dispatch(addItems(buffer, 'local')))
  }
}

export function fetchComments (topicId) {
  return (dispatch, getState) => {
    const promise = new Promise((resolve) => {
      const cacheRemoteTopic = getState().local.items[topicId]
      if (!cacheRemoteTopic) {
        fetchFromLocal(topicId).then(topic => resolve(topic))
      } else {
        resolve(cacheRemoteTopic)
      }
    })
    promise.then(topic => {
      dispatch(addItems({
        [topic.id]: topic
      }, 'local'))
      topic.kids && dispatch(fetchItemsFromLocal(topic.kids))
    })

    const cacheRemoteTopic = getState().remote.items[topicId]
    if (!cacheRemoteTopic) {
      fetchItem(`item/${topicId}`, topic => {
        dispatch(addItems({
          [topic.id]: topic
        }, 'remote'))
        topic.kids && dispatch(fetchItemsFromRemote(topic.kids))
      })
    } else {
      cacheRemoteTopic.kids && dispatch(fetchItemsFromRemote(cacheRemoteTopic.kids))
    }
  }
}

let initialLoad = true

export function fetchPage (page) {
  let pushItems = []
  const sentPush = throttle(() => {
    Push.create("New posts available", {
      body: pushItems
        .sort((i, j) => j.score - i.score)
        .map(i => i.title)
        .slice(0, 5)
        .join('\n'),
      icon: 'icons/icon_048.png',
      timeout: 60 * 1000,
      onClick: function (e) {
        console.log(clients)
        window.focus();
        this.close();
      }
    })
    pushItems = []
  }, PUSH_INTERVAL)
  return (dispatch, getState) => {
    if (getState().local.pageItems[page].length === 0) {
      fetchFromLocal(page)
        .then(topics => {
          dispatch(replacePageItems(page, topics, 'local'))
          dispatch(fetchItemsFromLocal(topics))
        })
    }
    const newPostCb = post => {
      if (!document.hasFocus()) {
        pushItems.push(post)
        sentPush()
      }
    }
    if (getState().remote.pageItems[page].length === 0) {
      fetchItem(page, topics => {
        (initialLoad ? clearLocal() : Promise.resolve()).then(() => {
          pushToLocal(page, topics)
          dispatch(replacePageItems(page, topics, 'remote'))
          dispatch(fetchItemsFromRemote(topics, newPostCb))
          initialLoad = false
        })
      })
    }
  }
}
