// importScripts('/src/js/idb.js')

const cache_static_name = 'static-v8'
const cache_dynamic_name = 'dynamic-v8'
let staticAssets = ['/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/idb.js',
    '/src/js/feed.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
]

// let trimCache = (cacheName, maxItems) => {
//     caches.open(cacheName)
//         .then(cache => {
//             return cache.keys()
//         })
//         .then(keys => {
//             if (keys.length > maxItems) {
//                 cache.delete(key[0])
//                     .then(trimCache(cacheName, maxItems))
//             }
//         })
// }

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(cache_static_name)
        .then((cache) => {
            cache.addAll(staticAssets)
        })
    )
})

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
        .then((keyList) => {
            return Promise.all(keyList.map(key => {
                if (key !== cache_static_name && key !== cache_dynamic_name) {
                    return caches.delete(key)
                }
            }))
        })
    )
    return self.clients.claim()
})

let isInArray = (string, array) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i] == string)
            return true
    }
    return false
}

//cache then network strategy
self.addEventListener('fetch', function(event) {
    let url = 'https://pwa-course-29d3b.firebaseio.com/posts.json'
    console.log('fetchin')
    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(
            caches.open(cache_dynamic_name)
            .then(function(cache) {
                return fetch(event.request)
                    .then(function(res) {
                        // trimCache(CACHE_DYNAMIC_NAME, 3);
                        cache.put(event.request, res.clone());
                        return res;
                    });
            })
        )
    } else if (isInArray(event.request.url, staticAssets)) {
        event.respondWith(caches.match(event.request))
    } else {
        event.respondWith(
            caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response
                } else {
                    return fetch(event.request)
                        .then(res => {
                            return caches.open(cache_dynamic_name)
                                .then((cache) => {
                                    console.log('put ibn alwahba 2')
                                    cache.put(event.request.url, res.clone())
                                    return res
                                })
                        }).catch(err =>
                            caches.open(cache_static_name)
                            .then(cache => {
                                if (event.request.headers.get('accept').includes('text/html'))
                                    return cache.match('/offline.html')
                            })
                        )
                }
            }))
    }

})

// self.addEventListener('fetch', function(event) {
//     event.respondWith( //src/js/app.js
//         caches.match(event.request)
//         .then((response) => {
//             if (response) {
//                 return response
//             } else {
//                 return fetch(event.request)
//                     .then(res => {
//                         return caches.open(cache_dynamic_name)
//                             .then((cache) => {
//                                 cache.put(event.request.url, res.clone())
//                                 return res
//                             })
//                     }).catch(err =>
//                         caches.open(cache_static_name)
//                         .then(cache => cache.match('/offline.html'))
//                     )
//             }
//         })
//     )
// })