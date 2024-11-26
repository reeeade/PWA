const CACHE_NAME = 'pwa-cache-v1';
const cacheAssets = [
  '/',
  '/static/styles.css',
  '/static/app.js',
  '/static/manifest.json',
  '/static/icons/ico.png',
  '/static/icons/ico512.png',
  '/static/screenshots/jackpot_center.png',
  '/static/screenshots/jackpot_left.png',
  '/static/screenshots/jackpot_right.png',
];

// Установка Service Worker
self.addEventListener('install', (e) => {
  console.log('Service Worker: Установлен');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Кэширование файлов');
      return cache.addAll(cacheAssets);
    })
  );
});

// Активация Service Worker
self.addEventListener('activate', (e) => {
  console.log('Service Worker: Активирован');
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Очистка старого кэша');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Обработка запросов
self.addEventListener('fetch', (e) => {
  console.log('Service Worker: Обработка запроса');
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
