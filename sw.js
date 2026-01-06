const CACHE_NAME = 'parasite-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/schemes.html',
  '/psychology.html',
  '/tests.html',
  '/gallery.html',
  '/contact.html',
  '/css/style.css',
  '/css/animations.css',
  '/css/responsive.css',
  '/css/button-styles.css',
  '/js/main.js',
  '/js/navigation.js',
  '/js/api-core.js',
  '/js/supabase.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Don't cache certain API requests or specific file types
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('supabase') ||
      event.request.url.includes('emailjs')) {
    // Handle API requests with network-first strategy
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If response is valid, clone it and store in cache
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
  } else {
    // For static assets and pages, use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached version if available
          if (response) {
            return response;
          }
          
          // Otherwise fetch from network
          return fetch(event.request)
            .then(response => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response to put in cache
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            })
            .catch(() => {
              // Fallback for articles - redirect to schemes.html when offline
              if (event.request.url.includes('/articles/')) {
                return caches.match('/schemes.html');
              }
              
              // For other requests, try to return basic fallback
              return caches.match('/index.html');
            });
        })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});