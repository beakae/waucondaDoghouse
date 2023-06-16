const staticCacheName = 'site-static-v1';
const dynamicCacheName = 'site-dynamic-v1'
const assets = [
  '/',
  '/index.html',
  '/css/materialize.css',
  '/css/materialize.min.css',
  '/css/styles.css',
  '/js/app.js',
  '/js/ui.js',
  '/js/materialize.min.js',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  '/pages/whatsnew.html',
  '/pages/calendar.html',
  '/pages/socialmedia.html',
]

const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    caches.keys().then(keys => {
      if(keys.length > size){
        cache.delete(keys[0]).then(limitCacheSize(name, size))
      }
    })
  })
};

//install
self.addEventListener('install', evt => {
  //console.log('service worker has been installed');
  evt.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log('caching shell assets');
      cache.addAll(assets);
     })
  );

});

//activate
self.addEventListener('activate', evt => {
  //console.log('service worker has been activated');
  evt.waitUntil(
    caches.keys().then(keys => {
    return Promise.all(keys
      .filter(key => key !== staticCacheName && key !== dynamicCacheName)
      .map(key => caches.delete(key))
      )
    })
  )
});

//fetch
self.addEventListener('fetch', evt => {
  console.log('fetch event', evt)
    evt.respondWith(
      caches.match(evt.request).then(cacheRes => {
       return cacheRes || fetch(evt.request).then(fetchRes => {
          return caches.open(dynamicCacheName).then(cache => {
            cache.put(evt.request.url, fetchRes.clone());
            limitCacheSize(dynamicCacheName, 30) //limit size
            return fetchRes;
          })
        });
      }).catch(() => caches.match('/pages/fallback.html')) //catch if no wifi
    );
});

