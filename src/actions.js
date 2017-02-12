import { fetchFromLocal, pushToLocal, clearLocal } from './local'
import Promise from 'promise-polyfill'
import firebase from 'firebase'
import throttle from 'lodash/throttle'

export const ADD_ITEMS = 'ADD_ITEMS'
export const REPLACE_PAGE_ITEMS = 'REPLACE_PAGE_ITEMS'

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

function fetchItemsFromRemote (items) {
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
  return (dispatch, getState) => {
    if (getState().local.pageItems[page].length === 0) {
      fetchFromLocal(page)
        .then(topics => {
          dispatch(replacePageItems(page, topics, 'local'))
          dispatch(fetchItemsFromLocal(topics))
        })
    }
    if (getState().remote.pageItems[page].length === 0) {
      fetchItem(page, topics => {
        (initialLoad ? clearLocal() : Promise.resolve()).then(() => {
          initialLoad = false
          pushToLocal(page, topics)
          dispatch(replacePageItems(page, topics, 'remote'))
          dispatch(fetchItemsFromRemote(topics))
        })
      })
    }
  }
}
