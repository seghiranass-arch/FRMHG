"use client";

import * as React from "react";

export function RegisterServiceWorker() {
  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => null);
  }, []);

  return null;
}
