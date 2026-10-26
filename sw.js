// Offline-Speicher des Atem-Timers (erzeugt von build-app.py, nicht von Hand ändern)
const VERSION = "atem-timer-88d8eb9a53";
const FILES = ["./", "manifest.json", "icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];

// Neue Fassung: alle Dateien frisch vom Server holen (nicht aus dem Zwischenspeicher des Browsers,
// GitHub erlaubt bis zu 10 Minuten), auf dem Gerät speichern und sofort übernehmen
self.addEventListener("install", event => {
  const fresh = FILES.map(file => new Request(file, { cache: "reload" }));
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(fresh)).then(() => self.skipWaiting()));
});

// Alte Fassungen aufräumen, aber nur die eigenen: Unter derselben GitHub-Adresse liegen auch andere Apps
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("atem-timer-") && key !== VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Zuerst aus dem Gerätespeicher, damit die App auch ohne Verbindung sofort startet
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)));
});
