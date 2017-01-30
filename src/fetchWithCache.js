function fetchCB (requestUrl, params, cb) {
  const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB
  var open = indexedDB.open('HackerNews', 1)

  open.onupgradeneeded = function () {
    var db = open.result
    db.createObjectStore('ItemStore', {keyPath: 'requestUrl'})
  }
  open.onsuccess = function () {
    if (navigator.onLine) {
      fetch(requestUrl, params).then(res => res.json()).then(data => {
        const store = open.result.transaction('ItemStore', 'readwrite').objectStore('ItemStore')
        store.put({
          requestUrl,
          data
        })
        cb(data)
      })
    } else {
      const store = open.result.transaction('ItemStore', 'readwrite').objectStore('ItemStore')
      const getReq = store.get(requestUrl)
      getReq.onsuccess = () => cb(getReq.result.data)
    }
  }
}

export default function fetchWithCache (requestUrl, params) {
  return new Promise(resolve => fetchCB(requestUrl, params, resolve))
}
