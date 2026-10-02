// Service worker di Cultora: riceve le notifiche push e apre l'app sulla ricorrenza
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "Cultora", {
    body: d.body || "Tocca per scoprire le curiosità di oggi",
    data: { url: d.url || "./", q: d.q || "" },
    tag: "cultora-ricorrenza"
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const { url, q } = e.notification.data || {};
  const target = new URL(url || "./", self.registration.scope).href;
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (list.length) {
      const c = list[0];
      await c.focus();
      c.postMessage({ type: "cultora-search", q });
      return;
    }
    await self.clients.openWindow(target);
  })());
});
