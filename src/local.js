import Promise from 'promise-polyfill'

function operateLocal(cb) {
  const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB
  const open = indexedDB.open('HackerNews')
  open.onerror = (e) => console.error(e)
  open.onupgradeneeded = () => open.result.createObjectStore('HackerNewsStore', {keyPath: 'key'})
  open.onerror = e => console.log(e)
  open.onsuccess = () => {
    const store = open.result
      .transaction('HackerNewsStore', 'readwrite')
      .objectStore('HackerNewsStore')
    cb(store)
  }
}

function fetchFromLocalCB(key, cb) {
  operateLocal((store => {
    const getReq = store.get(key)
    getReq.onsuccess = () => getReq.result && cb(getReq.result.data)
  }))
}

function pushToLocalCB(key, data, cb) {
  operateLocal(store => store.put({
    key,
    data
  }))
}

function clearLocalCB(cb) {
  operateLocal(store => store.clear().onsuccess = cb)
}

export const fetchFromLocal = key => new Promise(resolve => fetchFromLocalCB(key, resolve))
export const pushToLocal = (key, data) => new Promise(resolve => pushToLocalCB(key, data, resolve))
export const clearLocal = () => new Promise(resolve => clearLocalCB(resolve))
