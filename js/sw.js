const cacheName = 'cv-multimedia-v2'; // Change the cache name to force update
const staticAssets = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/cv-data.js',
    '/node_modules/@mdi/font/css/materialdesignicons.min.css',
    '/node_modules/@mdi/font/fonts/materialdesignicons-webfont.woff2',
    '/node_modules/@mdi/font/fonts/materialdesignicons-webfont.woff',
    '/assets/images/ma-photo.jpg'
    // Ajoutez ici les chemins vers vos autres images, audios, vidéos que vous souhaitez mettre en cache
];

self.addEventListener('install', async event => {
    try {
        const cache = await caches.open(cacheName);
        await cache.addAll(staticAssets);
        console.log('All assets are cached');
    } catch (error) {
        console.error('Failed to cache assets:', error);
    }
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (name !== cacheName) { // Correction de la condition
                        console.log('Deleting old cache:', name);
                        return caches.delete(name);
                    }
                    return null;
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Retourne la réponse mise en cache si elle est disponible
            if (cachedResponse) {
                return cachedResponse;
            }

            // Sinon, tente de récupérer la ressource depuis le réseau
            return fetch(event.request).then(response => {
                // Vérifie si la réponse est valide
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // IMPORTANT : Clone la réponse. Un corps de réponse est un flux
                // et afin de pouvoir consommer le corps plus d'une fois, nous devons le cloner.
                const responseToCache = response.clone();

                caches.open(cacheName).then(cache => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            }).catch(() => {
                // En cas d'échec de la récupération, retourne une réponse de secours
                return new Response('Service Unavailable', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain' }
                });
            });
        })
    );
});