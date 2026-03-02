"use client";

import * as React from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.("(display-mode: standalone)")?.matches || nav.standalone === true;
}

export function InstallControls() {
  const [promptEvent, setPromptEvent] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = React.useState(false);

  React.useEffect(() => {
    setStandalone(isStandalone());

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    }

    function onAppInstalled() {
      setPromptEvent(null);
      setStandalone(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice.catch(() => null);
    setPromptEvent(null);
  }

  const ios = isIOS();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
      <div className="text-lg font-semibold text-gray-800">Installer l’application</div>
      <div className="mt-1 text-sm text-gray-500">Android, Windows et iOS via PWA.</div>

      {standalone ? (
        <div className="mt-4 rounded-xl border border-success-500/20 bg-success-500/10 px-4 py-3 text-sm font-semibold text-success-600">
          L’application est déjà installée sur cet appareil.
        </div>
      ) : promptEvent ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={install}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Installer
          </button>
          <div className="text-sm text-gray-500">Si le bouton n’apparaît pas, utilisez le menu du navigateur.</div>
        </div>
      ) : ios ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          Sur iPhone/iPad : ouvrez dans Safari, puis Partager → Ajouter à l’écran d’accueil.
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          Sur Chrome/Edge : menu → Installer l’application. Sur Android : l’option est aussi proposée via la bannière.
        </div>
      )}
    </div>
  );
}
