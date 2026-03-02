"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import api from "../lib/api-client";

// Test accounts for different roles
const TEST_ACCOUNTS = [
  {
    role: "federation_admin",
    label: "Administrateur Fédération",
    email: "admin@frmhg.ma",
    password: "Admin123!",
    color: "bg-red-100 hover:bg-red-200 text-red-800"
  },
  {
    role: "club_admin",
    label: "Administrateur Club",
    email: "club@frmhg.ma",
    password: "Club123!",
    color: "bg-blue-100 hover:bg-blue-200 text-blue-800"
  },
  {
    role: "dtn",
    label: "Direction Technique Nationale",
    email: "national@frmhg.ma",
    password: "National123!",
    color: "bg-purple-100 hover:bg-purple-200 text-purple-800"
  },
  {
    role: "finance",
    label: "Responsable Financier",
    email: "finance@frmhg.ma",
    password: "Finance123!",
    color: "bg-green-100 hover:bg-green-200 text-green-800"
  },
  {
    role: "stock",
    label: "Gestionnaire Matériel",
    email: "stock@frmhg.ma",
    password: "Stock123!",
    color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
  },
  {
    role: "medecin",
    label: "Médecin",
    email: "medecin@frmhg.ma",
    password: "Medecin123!",
    color: "bg-pink-100 hover:bg-pink-200 text-pink-800"
  },
  {
    role: "arbitre",
    label: "Arbitre",
    email: "arbitre@frmhg.ma",
    password: "Arbitre123!",
    color: "bg-orange-100 hover:bg-orange-200 text-orange-800"
  }
];

export function LoginCard() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [notice, setNotice] = React.useState<string | null>(null);
  const [isError, setIsError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

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
    const data = (await res.json().catch(() => ({}))) as { key?: unknown };
    if (!res.ok) return null;
    return typeof data.key === "string" ? data.key : null;
  }

  async function tryEnablePush() {
    const ok =
      typeof window !== "undefined" &&
      window.isSecureContext &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    if (!ok) return;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) return;
    const vapidKey = await getVapidPublicKey();
    if (!vapidKey) return;
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
    }
  }

  function getRedirectPath(roles?: string[]) {
    if (!roles || roles.length === 0) return "/dashboard";
    if (roles.includes("federation_admin")) return "/dashboard/federation";
    if (roles.includes("club_admin")) return "/dashboard/club";
    if (roles.includes("dtn")) return "/dashboard/national";
    if (roles.includes("finance")) return "/modules/finance";
    if (roles.includes("medecin")) return "/modules/medical";
    if (roles.includes("stock")) return "/modules/materiel";
    if (roles.includes("arbitre")) return "/modules/sport/competition";
    return "/dashboard";
  }

  async function handleLogin(loginEmail: string, loginPassword: string, label?: string) {
    setIsLoading(true);
    setIsError(false);
    setNotice(label ? `Connexion en tant que ${label}...` : "Connexion en cours...");

    const response = await api.post('/auth/login', { 
      email: loginEmail, 
      password: loginPassword 
    });

    setIsLoading(false);

    if (response.data) {
      const redirectPath = getRedirectPath((response.data as { roles?: string[] }).roles);
      setNotice("Connexion réussie ! Redirection...");
      tryEnablePush().catch(() => null);
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 500);
    } else {
      setIsError(true);
      setNotice(response.error || "Erreur de connexion");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleLogin(email, password);
  }

  // Quick login function
  function quickLogin(account: typeof TEST_ACCOUNTS[0]) {
    setEmail(account.email);
    setPassword(account.password);
    handleLogin(account.email, account.password, account.label);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-b from-gray-50 to-gray-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="absolute inset-0 bg-white/40 mix-blend-overlay pointer-events-none" />
      <div className="relative">
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.8
            }}
            className="relative"
          >
            <div className="relative w-32 h-32 flex items-center justify-center">
              <Image
                src="/logo_frmhg.png"
                alt="Logo FRMHG"
                width={128}
                height={128}
                className="w-full h-full object-contain drop-shadow-sm"
                priority
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="font-display text-2xl font-bold text-gray-900 drop-shadow-sm text-center">Connexion</div>
          <p className="mt-2 text-sm text-gray-600 font-medium text-center max-w-[280px] mx-auto leading-relaxed">
            Accédez au dashboard adapté à votre rôle (fédération, club, sélection).
          </p>
        </motion.div>

        <form className="mt-8 grid gap-5" onSubmit={onSubmit}>
          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email</span>
            <div className="relative">
              <input
                className="w-full h-11 rounded-xl border border-gray-300 bg-gray-50 px-4 text-gray-900 shadow-inner outline-none transition-all focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="ex: admin@frmhg.ma"
                autoComplete="email"
              />
            </div>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Mot de passe</span>
            <div className="relative">
              <input
                className="w-full h-11 rounded-xl border border-gray-300 bg-gray-50 px-4 text-gray-900 shadow-inner outline-none transition-all focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </label>

          {notice ? (
            <div className={`rounded-xl px-4 py-3 text-sm font-bold shadow-sm border ${isError ? 'bg-red-50 text-red-700 border-red-200' : 'bg-brand-50 text-brand-700 border-brand-200'}`}>
              {notice}
            </div>
          ) : null}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 text-white font-bold shadow-[0_4px_0_#123a32] active:shadow-none active:translate-y-[4px] transition-all border-t border-brand-400 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        {/* Quick Login Buttons */}
        <div className="mt-8">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center border-b border-gray-200 pb-2">Accès rapides par rôle</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEST_ACCOUNTS.map((account) => (
              <button
                key={account.role}
                onClick={() => quickLogin(account)}
                className={`group relative overflow-hidden text-left p-3 rounded-xl border-b-4 active:border-b-0 active:translate-y-[4px] transition-all duration-150 ${account.color.replace('bg-', 'bg-gradient-to-b from-').replace('100', '50').replace('hover:', 'hover:from-').replace('200', '100')} border-black/10 shadow-sm hover:shadow-md`}
              >
                <div className="relative z-10">
                  <div className="font-bold text-sm text-gray-800 group-hover:text-black">{account.label}</div>
                  <div className="text-[10px] font-medium opacity-70 mt-0.5">{account.email}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-brand-200/60 bg-gradient-to-br from-brand-50 to-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-brand-100 p-1 text-brand-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-xs text-brand-900/80">
              <div className="font-bold text-brand-900">Comptes de test</div>
              <div className="mt-1 leading-relaxed">
                Utilisez les boutons d'accès rapide ci-dessus pour vous connecter instantanément avec les différents rôles disponibles.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
