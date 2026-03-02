"use client";

import * as React from "react";
import { InstallControls } from "../pwa/install-controls";
import { PushControls } from "../push/push-controls";

type NewsRow = {
  id: string;
  title: string;
  body: string;
  status: string;
  published_at?: string | null;
  created_at: string;
};

type MessageRow = {
  id: string;
  subject: string;
  body: string;
  created_at: string;
  from_org_name?: string | null;
  to_org_name?: string | null;
};

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  read_at?: string | null;
  created_at: string;
};

export function CommunicationPanel({
  initialNews,
  initialMessages,
  initialNotifications,
  canSendPushTest
}: {
  initialNews: NewsRow[];
  initialMessages: MessageRow[];
  initialNotifications: NotificationRow[];
  canSendPushTest?: boolean;
}) {
  const [tab, setTab] = React.useState<"news" | "messages" | "notifications" | "app">("news");
  const [news, setNews] = React.useState(initialNews);
  const [messages, setMessages] = React.useState(initialMessages);
  const [notifications, setNotifications] = React.useState(initialNotifications);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [newsTitle, setNewsTitle] = React.useState("Annonce");
  const [newsBody, setNewsBody] = React.useState("Contenu...");
  const [newsStatus, setNewsStatus] = React.useState<"draft" | "published" | "archived">("draft");

  const [msgSubject, setMsgSubject] = React.useState("Question");
  const [msgBody, setMsgBody] = React.useState("Bonjour...");

  async function refreshAll() {
    const [n, m, no] = await Promise.all([
      fetch("/api/communication/news", { cache: "no-store" }),
      fetch("/api/communication/messages", { cache: "no-store" }),
      fetch("/api/communication/notifications", { cache: "no-store" })
    ]);
    if (n.ok) setNews(await n.json());
    if (m.ok) setMessages(await m.json());
    if (no.ok) setNotifications(await no.json());
  }

  async function createNews(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/communication/news", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: newsTitle, body: newsBody, status: newsStatus })
      });
      if (!res.ok) {
        setError(await res.text());
        return;
      }
      await refreshAll();
    } finally {
      setBusy(false);
    }
  }

  async function createMessage(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/communication/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subject: msgSubject, body: msgBody })
      });
      if (!res.ok) {
        setError(await res.text());
        return;
      }
      await refreshAll();
      setMsgBody("");
    } finally {
      setBusy(false);
    }
  }

  async function markRead(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/communication/notifications/${id}/read`, { method: "POST" });
      if (!res.ok) {
        setError(await res.text());
        return;
      }
      await refreshAll();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-sm">
        <TabButton active={tab === "news"} onClick={() => setTab("news")}>
          News
        </TabButton>
        <TabButton active={tab === "messages"} onClick={() => setTab("messages")}>
          Messages
        </TabButton>
        <TabButton active={tab === "notifications"} onClick={() => setTab("notifications")}>
          Notifications
        </TabButton>
        <TabButton active={tab === "app"} onClick={() => setTab("app")}>
          App
        </TabButton>
      </div>

      {error ? (
        <div className="rounded-2xl border border-error-500/20 bg-error-500/10 px-4 py-3 text-sm font-semibold text-error-500">
          {error}
        </div>
      ) : null}

      {tab === "news" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
            <div className="text-lg font-semibold text-gray-800">Publier une news</div>
            <div className="mt-1 text-sm text-gray-500">Réservé à la fédération (MVP).</div>
            <form className="mt-4 grid gap-3" onSubmit={createNews}>
              <input
                className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
              />
              <select
                className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                value={newsStatus}
                onChange={(e) => setNewsStatus(e.target.value as any)}
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
              <textarea
                className="min-h-[140px] rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                value={newsBody}
                onChange={(e) => setNewsBody(e.target.value)}
              />
              <button
                disabled={busy}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {busy ? "..." : "Créer"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-800">Liste</div>
              <div className="text-sm text-gray-500">{news.length}</div>
            </div>
            <div className="mt-4 grid gap-3">
              {news.map((n) => (
                <div key={n.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-gray-800">{n.title}</div>
                    <span className="rounded-lg bg-brand-500/10 px-2 py-1 text-xs font-semibold text-brand-700">
                      {n.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">{n.body}</div>
                  <div className="mt-2 text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {tab === "messages" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
            <div className="text-lg font-semibold text-gray-800">Envoyer un message</div>
            <div className="mt-1 text-sm text-gray-500">MVP : club → fédération (ou fédération → org via API).</div>
            <form className="mt-4 grid gap-3" onSubmit={createMessage}>
              <input
                className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                value={msgSubject}
                onChange={(e) => setMsgSubject(e.target.value)}
              />
              <textarea
                className="min-h-[140px] rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
              />
              <button
                disabled={busy}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {busy ? "..." : "Envoyer"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-800">Inbox</div>
              <div className="text-sm text-gray-500">{messages.length}</div>
            </div>
            <div className="mt-4 grid gap-3">
              {messages.map((m) => (
                <div key={m.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="font-semibold text-gray-800">{m.subject}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {m.from_org_name ? `De: ${m.from_org_name}` : "De: Fédération"}{" "}
                    {m.to_org_name ? `→ À: ${m.to_org_name}` : ""}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">{m.body}</div>
                  <div className="mt-2 text-xs text-gray-500">{new Date(m.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {tab === "notifications" ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-800">Notifications</div>
            <div className="text-sm text-gray-500">{notifications.length}</div>
          </div>
          <div className="mt-4 grid gap-3">
            {notifications.map((n) => (
              <div key={n.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-gray-800">{n.title}</div>
                  {n.read_at ? (
                    <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                      read
                    </span>
                  ) : (
                    <button
                      disabled={busy}
                      onClick={() => markRead(n.id)}
                      className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                      Marquer lu
                    </button>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600">{n.body}</div>
                <div className="mt-2 text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">MVP : notifications alimentées par des jobs/événements plus tard.</div>
        </div>
      ) : null}

      {tab === "app" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <InstallControls />
          <PushControls canSendTest={canSendPushTest} />
        </div>
      ) : null}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-brand-500 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}







