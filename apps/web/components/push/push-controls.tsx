"use client";

import * as React from "react";

function base64UrlToUint8Array(base64Url: string) {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

async function getVapidPublicKey() {
  const res = await fetch("/push/vapid-public-key", { cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as { key?: unknown; error?: unknown; hint?: unknown };
  if (!res.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : typeof data.hint === "string"
          ? data.hint
          : "Clé VAPID publique indisponible.";
    throw new Error(message);
  }
  return typeof data.key === "string" ? data.key : null;
}

export function PushControls({ canSendTest = false }: { canSendTest?: boolean }) {
  const [supported, setSupported] = React.useState(false);
  const [permission, setPermission] = React.useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isIos, setIsIos] = React.useState(false);
  const [isAndroid, setIsAndroid] = React.useState(false);
  const [standalone, setStandalone] = React.useState(false);
  const [isSecure, setIsSecure] = React.useState(true);
  const [origin, setOrigin] = React.useState<string | null>(null);

  React.useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setSupported(ok);
    if ("Notification" in window) setPermission(Notification.permission);
    const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
    setIsIos(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/i.test(ua));
    if (typeof window !== "undefined") {
      const nav = window.navigator as Navigator & { standalone?: boolean };
      setStandalone(window.matchMedia?.("(display-mode: standalone)")?.matches || nav.standalone === true);
      setIsSecure(window.isSecureContext);
      setOrigin(window.location.origin);
    }
  }, []);

  React.useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    (async () => {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (cancelled) return;
      setSubscribed(!!sub);
    })().catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [supported]);

  async function enable() {
    if (!supported) return;
    setBusy(true);
    setError(null);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return;

      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        setSubscribed(true);
        return;
      }

      const vapidKey = await getVapidPublicKey();
      if (!vapidKey) throw new Error("Clé VAPID publique invalide.");

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(vapidKey)
      });

      const res = await fetch("/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sub)
      });
      if (!res.ok) {
        await sub.unsubscribe().catch(() => null);
        setError(await res.text());
        return;
      }
      setSubscribed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    if (!supported) return;
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        setSubscribed(false);
        return;
      }
      await fetch("/push/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint })
      }).catch(() => null);
      await sub.unsubscribe().catch(() => null);
      setSubscribed(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/push/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "Test FRMHG",
          body: "Notification push de test",
          url: "/modules/communication"
        })
      });
      if (!res.ok) {
        setError(await res.text());
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-gray-800">Notifications push</div>
          <div className="mt-1 text-sm text-gray-500">
            Activer les notifications pour recevoir les alertes importantes.
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
          Permission: {permission}
        </div>
      </div>

      {isIos && !standalone ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          Sur iOS, installez l’application (Safari → Partager → Ajouter à l’écran d’accueil), puis relancez-la
          depuis l’icône pour activer les notifications push.
        </div>
      ) : !isSecure ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          Les notifications push nécessitent HTTPS avec un certificat valide. Sur Android, ouvrez la version HTTPS du
          site ou utilisez un tunnel (ngrok) en développement.
          {origin ? <div className="mt-1 text-xs text-gray-500">URL actuelle : {origin}</div> : null}
        </div>
      ) : isAndroid && !supported ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          Sur Android, les notifications push exigent Chrome/Edge et un service worker actif. Installez la PWA si
          possible, puis relancez l’app depuis l’icône.
        </div>
      ) : !supported ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          Les notifications push ne sont pas supportées sur ce navigateur/appareil.
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!subscribed ? (
            <button
              disabled={busy}
              onClick={enable}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              Activer
            </button>
          ) : (
            <button
              disabled={busy}
              onClick={disable}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
            >
              Désactiver
            </button>
          )}

          <button
            disabled={busy || !subscribed || !canSendTest}
            onClick={sendTest}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
          >
            Envoyer un test
          </button>
        </div>
      )}

      {error ? (
        <div className="mt-4 rounded-xl border border-error-500/20 bg-error-500/10 px-4 py-3 text-sm font-semibold text-error-500">
          {error}
        </div>
      ) : null}

      <div className="mt-4 text-xs text-gray-500">
        Sur iOS, les notifications push nécessitent une PWA installée (iOS 16.4+).
      </div>
    </div>
  );
}
