const CACHE = "create-v2";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-512.png"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isHTML(req) {
  return req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (isHTML(e.request)) {
    e.respondWith(
      fetch(e.request)
        .then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); return r; })
        .catch(() => caches.match(e.request).then((c) => c || caches.match("./index.html")))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request).then((r) => {
        const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); return r;
      }).catch(() => cached))
    );
  }
});
