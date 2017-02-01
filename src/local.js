import Promise from 'promise-polyfill'

const fetchFromLocalCB = (key, cb) => {
  const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB
  var open = indexedDB.open('HackerNews')

  open.onupgradeneeded = () => {
    var db = open.result
    db.createObjectStore('HackerNewsStore', {keyPath: 'key'})
  }
  open.onerror = e => console.log(e)
  open.onsuccess = () => {
    const store = open.result.transaction('HackerNewsStore', 'readwrite').objectStore('HackerNewsStore')
    const getReq = store.get(key)
    getReq.onsuccess = () => getReq.result && cb(getReq.result.data)
  }
}

const pushToLocalCB = (key, data, cb) => {
  const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB
  var open = indexedDB.open('HackerNews')
  open.onerror = (e) => console.error(e)

  open.onupgradeneeded = () => {
    var db = open.result
    db.createObjectStore('HackerNewsStore', {keyPath: 'key'})
  }
  open.onerror = e => console.log(e)
  open.onsuccess = () => {
    const store = open.result.transaction('HackerNewsStore', 'readwrite').objectStore('HackerNewsStore')
    store.put({
      key,
      data
    })
  }
}

export const fetchFromLocal = key => new Promise(resolve => fetchFromLocalCB(key, resolve))
export const pushToLocal = (key, data) => new Promise(resolve => pushToLocalCB(key, data, resolve))
