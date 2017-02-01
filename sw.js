var CACHE_NAME = 'my-site-cache-v1'
var urlsToCache = [
  '/hacker-news-pwa',
  '/hacker-news-pwa/#/',
  '/hacker-news-pwa/index.html',
  '/hacker-news-pwa/build.js',
  '/hacker-news-pwa/material.min.js',
  '/hacker-news-pwa/material.min.css'
  // '/',
  // '/#/',
  // '/index.html',
  // '/build.js',
  // '/material.min.js',
  // '/material.min.css'
]

this.addEventListener('install', function (event) {
  console.log('installing app :)')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache)
      })
  )
})

this.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request)
    })
  )
})
