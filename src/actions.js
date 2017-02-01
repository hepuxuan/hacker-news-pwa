import { fetchFromLocal, pushToLocal } from './local'
import Promise from 'promise-polyfill'

export const ADD_REMOTE_ITEMS = 'ADD_REMOTE_ITEMS'
export const ADD_LOCAL_ITEMS = 'ADD_LOCAL_ITEMS'
export const REPLACE_HOT_TOPICS = 'REPLACE_HOT_TOPICS'

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

const fetchItemsFromRemote = items => dispatch => {
  let buffer = {}
  Promise.all(items.map(id => {
    return fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      .then(res => res.json())
      .then(data => {
        pushToLocal(id, data)
        buffer[id] = data
        if (Object.keys(buffer).length >= 10) {
          dispatch(addRemoteItems(buffer))
          buffer = {}
        }
      })
  })).then(() => dispatch(addRemoteItems(buffer)))
}

const fetchItemsFromLocal = items => dispatch => {
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

export const fetchComments = topicId => dispatch => {
  fetchFromLocal(topicId)
    .then(topic => {
      dispatch(addRemoteItems({
        [topic.id]: topic
      }))
      dispatch(fetchItemsFromLocal(topic.kids))
    })
  fetch(`https://hacker-news.firebaseio.com/v0/item/${topicId}.json`)
    .then(res => res.json())
    .then(topic => {
      dispatch(addRemoteItems({
        [topic.id]: topic
      }))
      dispatch(fetchItemsFromRemote(topic.kids))
    })
}

export const fetchHotTopics = () => dispatch => {
  fetchFromLocal('hot-topics')
    .then(topics => {
      dispatch(replaceHotTopics(topics))
      dispatch(fetchItemsFromLocal(topics))
    })
  fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    .then(res => res.json())
    .then(topics => {
      pushToLocal('hot-topics', topics)
      dispatch(replaceHotTopics(topics))
      dispatch(fetchItemsFromRemote(topics))
    })
}
