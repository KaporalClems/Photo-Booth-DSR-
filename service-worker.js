const CACHE_NAME = 'photo-booth-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
    'https://placehold.co/600x400/FF5733/FFFFFF?text=Cadre+1',
    'https://placehold.co/600x400/33FF57/FFFFFF?text=Cadre+2',
    'https://placehold.co/600x400/3357FF/FFFFFF?text=Cadre+3',
    'https://placehold.co/192x192/4f46e5/FFFFFF?text=PB',
    'https://placehold.co/512x512/4f46e5/FFFFFF?text=PB'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache ouvert');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Répondre depuis le cache si trouvé
                }
                return fetch(event.request)
                    .then(response => {
                        // Cloner la réponse car elle est un flux et ne peut être consommée qu'une seule fois
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    });
            })
            .catch(() => {
                // Gérer les cas où le réseau est hors ligne et l'élément n'est pas dans le cache
                return new Response('<h1>Offline</h1>', {
                    headers: { 'Content-Type': 'text/html' }
                });
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
