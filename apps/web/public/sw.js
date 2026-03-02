self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = null;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "FRMHG", body: event.data.text() };
  }

  const title = payload?.title || "FRMHG";
  const options = {
    body: payload?.body || "",
    icon: "/logo_frmhg.png",
    badge: "/logo_frmhg.png",
    data: {
      url: payload?.url || "/",
      ...payload
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

