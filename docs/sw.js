var CACHE_NAME = 'hacker-news-cache'
var urlsToCache = [
  '/hacker-news-pwa',
  '/hacker-news-pwa/#/',
  // // Uncomment when running locally
  // '/docs',
  // '/docs/#/',
  'index.html',
  'build.js',
  'material.min.js',
  'material.min.css',
  'font.css',
  'index.css'
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
