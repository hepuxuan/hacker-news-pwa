import Promise from 'promise-polyfill'
import firebase from 'firebase'
import keyBy from 'lodash/keyBy'

export const REPLACE_PAGE = 'REPLACE_PAGE'
export const REPLACE_ITEM = 'REPLACE_ITEM'
export const START_LOADING = 'START_LOADING'
export const FINISH_LOADING = 'FINISH_LOADING'

firebase.initializeApp({
  databaseURL: 'hacker-news.firebaseio.com'
})

const api = firebase.database().ref('/v0')

function startLoading (page) {
  return {
    type: START_LOADING,
    page
  }
}

function finishLoading (page) {
  return {
    type: FINISH_LOADING,
    page
  }
}

function replacePage (items, page) {
  return {
    type: REPLACE_PAGE,
    items,
    page
  }
}

function replaceItem (item) {
  return {
    type: REPLACE_ITEM,
    item
  }
}

function fetchItem (path, cb) {
  api.child(path).off()
  api.child(path)
    .on('value', (snapshot) => cb(snapshot.val()))
}

function connectItem (id, state, cb) {
  if (!state.connectedItems[`item/${id}`]) {
    return new Promise(resolve => {
      fetchItem(`item/${id}`, (val) => {
        val.source = 'remote'
        cb(val)
        resolve(val)
      })
    })
  } else {
    return Promise.resolve(state.entities.items[id])
  }
}

function connectPage (page, state, cb) {
  if (!state.connectedItems[page]) {
    return new Promise(resolve => {
      fetchItem(page, (val) => {
        cb(val)
        resolve(val)
      })
    })
  } else {
    return Promise.resolve(state.entities.byIds[page])
  }
}

function connectItems (ids, state, cb) {
  return Promise.all(ids.map(id => {
    return connectItem(id, state, cb)
  }))
}

function fetchCommentRec (id, state, cb) {
  return connectItem(id, state, cb).then(comment => {
    const promise = comment.kids
      ? Promise.all(comment.kids.map(id => fetchCommentRec(id, state, cb))) : Promise.resolve()

    return promise.then(() => {
      cb(comment)
    }).catch(console.warn.bind(console))
  })
}

export function fetchTopic (topicId) {
  return (dispatch, getState) => {
    dispatch(startLoading('topic'))
    new Promise(resolve => {
      connectItem(topicId, getState(), topic => {
        dispatch(replaceItem(topic))
      }).then(topic => {
        const promise = topic.kids ? Promise.all(topic.kids.map(id => fetchCommentRec(id, getState(), item => {
          dispatch(replaceItem(item))
        }))) : Promise.resolve()

        return promise.then(() => {
          dispatch(replaceItem(topic))
        }).then(resolve).catch(console.warn.bind(console))
      })
    }).then(() => {
      dispatch(finishLoading('topic'))
    }).catch((e) => {
      console.warn(e)
      dispatch(finishLoading('topic'))
    })
  }
}

export function fetchTopics (page) {
  return (dispatch, getState) => {
    dispatch(startLoading(page))
    new Promise(resolve => {
      connectPage(page, getState(), ids => {
        connectItems(ids, getState(), topic => {
          dispatch(replaceItem(topic))
        }).then(() => {
          resolve()
          dispatch(replacePage(ids, page))
        })
      })
    }).then(() => {
      dispatch(finishLoading(page))
    }).catch((e) => {
      console.warn(e)
      dispatch(finishLoading(page))
    })
  }
}
