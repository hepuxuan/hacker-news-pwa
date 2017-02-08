import { fetchFromLocal, pushToLocal } from './local'
import Promise from 'promise-polyfill'
import firebase from 'firebase'

export const ADD_REMOTE_ITEMS = 'ADD_REMOTE_ITEMS'
export const ADD_LOCAL_ITEMS = 'ADD_LOCAL_ITEMS'
export const REPLACE_HOT_TOPICS = 'REPLACE_HOT_TOPICS'

firebase.initializeApp({
  databaseURL: 'hacker-news.firebaseio.com'
})

const api = firebase.database().ref('/v0')

const addRemoteItems = remoteItems => ({
  type: ADD_REMOTE_ITEMS,
  remoteItems
})

const addLocalItems = localItems => ({
  type: ADD_LOCAL_ITEMS,
  localItems
})

const replaceHotTopics = topics => ({
  type: REPLACE_HOT_TOPICS,
  topics
})

function fetchItem (path, cb) {
  api.child(path).off()
  api.child(path)
    .on('value', (snapshot) => cb(snapshot.val()))
}

function fetchItemsFromRemote (items) {
  return (dispatch, getState) => {
    let buffer = {}
    let pushedItems = 0
    items.forEach(id => {
      if (!getState().remoteItems[id]) {
        fetchItem(`item/${id}`, data => {
          pushToLocal(id, data)
          buffer[id] = data
          if (Object.keys(buffer).length >= 10 || items.length === pushedItems) {
            dispatch(addRemoteItems(buffer))
            pushedItems += 10
            buffer = {}
          }
        })
      }
    })
  }
}

function fetchItemsFromLocal (items) {
  return dispatch => {
    let buffer = {}
    let bufferSize = 0
    Promise.all(items.map(id => {
      return fetchFromLocal(id)
        .then(data => {
          buffer[id] = data
          bufferSize++
          if (bufferSize >= 10) {
            dispatch(addLocalItems(buffer))
            buffer = {}
            bufferSize = 0
          }
        })
    })).then(() => dispatch(addRemoteItems(buffer)))
  }
}

export function fetchComments (topicId) {
  return dispatch => {
    fetchFromLocal(topicId)
      .then(topic => {
        dispatch(addRemoteItems({
          [topic.id]: topic
        }))
        topic.kids && dispatch(fetchItemsFromLocal(topic.kids))
      })
    fetchItem(`item/${topicId}`, topic => {
      dispatch(addRemoteItems({
        [topic.id]: topic
      }))
      topic.kids && dispatch(fetchItemsFromRemote(topic.kids))
    })
  }
}

export function fetchPage (page) {
  return dispatch => {
    fetchFromLocal(page)
      .then(topics => {
        dispatch(replaceHotTopics(topics))
        dispatch(fetchItemsFromLocal(topics))
      })
    fetchItem(page, topics => {
      pushToLocal(page, topics)
      dispatch(replaceHotTopics(topics))
      dispatch(fetchItemsFromRemote(topics))
    })
  }
}
