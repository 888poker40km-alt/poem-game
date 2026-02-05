const CACHE_NAME = "poem-game-v1"; // меняй версию при обновлении
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// Установка SW и кеширование
self.addEventListener("install", event => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("[SW] Caching app files");
        return cache.addAll(FILES_TO_CACHE);
      })
  );
  self.skipWaiting(); // активируем сразу после установки
});

// Активация и удаление старых кешей
self.addEventListener("activate", event => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Ловим все запросы и отдаём из кеша, если есть
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse; // отдаём из кеша
        }
        return fetch(event.request) // иначе с сети
          .then(response => {
            return caches.open(CACHE_NAME).then(cache => {
              // кешируем новые файлы динамически
              if (event.request.method === "GET" && response.type === "basic") {
                cache.put(event.request, response.clone());
              }
              return response;
            });
          })
          .catch(() => {
            // Можно вернуть fallback страницу или иконку если offline
            if (event.request.destination === "document") {
              return caches.match("/index.html");
            }
          });
      })
  );
});