"use client";

import * as React from "react";

type VisitRow = {
  id: string;
  member_id: string;
  visit_date: string;
  kind: string;
  status: string;
  first_name: string;
  last_name: string;
};

type InjuryRow = {
  id: string;
  member_id: string;
  occurred_on?: string | null;
  body_part?: string | null;
  severity: string;
  status: string;
  first_name: string;
  last_name: string;
};

export function MedicalPanel({ initialVisits, initialInjuries }: { initialVisits: VisitRow[]; initialInjuries: InjuryRow[] }) {
  const [visits, setVisits] = React.useState(initialVisits);
  const [injuries, setInjuries] = React.useState(initialInjuries);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [memberId, setMemberId] = React.useState("");
  const [visitKind, setVisitKind] = React.useState<"checkup" | "injury" | "test" | "other">("checkup");
  const [visitStatus, setVisitStatus] = React.useState<"draft" | "final">("draft");
  const [notes, setNotes] = React.useState("");

  async function refresh() {
    const [v, i] = await Promise.all([
      fetch("/api/medical/visits", { cache: "no-store" }),
      fetch("/api/medical/injuries", { cache: "no-store" })
    ]);
    if (v.ok) setVisits(await v.json());
    if (i.ok) setInjuries(await i.json());
  }

  async function createVisit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/medical/visits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ memberId, kind: visitKind, status: visitStatus, notes: notes || undefined })
      });
      if (!res.ok) {
        setError(await res.text());
        return;
      }
      await refresh();
      setNotes("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
        <div className="text-lg font-semibold text-gray-800">Créer une visite médicale</div>
        <div className="mt-1 text-sm text-gray-500">
          Accès restreint (rôle <span className="font-semibold">medical</span> ou <span className="font-semibold">federation_admin</span>).
        </div>

        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={createVisit}>
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-gray-600">Member ID</span>
            <input
              className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="uuid du membre"
              required
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-gray-600">Type</span>
            <select
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              value={visitKind}
              onChange={(e) => setVisitKind(e.target.value as any)}
            >
              <option value="checkup">checkup</option>
              <option value="injury">injury</option>
              <option value="test">test</option>
              <option value="other">other</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-gray-600">Statut</span>
            <select
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              value={visitStatus}
              onChange={(e) => setVisitStatus(e.target.value as any)}
            >
              <option value="draft">draft</option>
              <option value="final">final</option>
            </select>
          </label>

          <label className="grid gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-gray-600">Notes</span>
            <textarea
              className="min-h-[88px] rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="(optionnel)"
            />
          </label>

          <div className="md:col-span-2">
            <button
              disabled={busy}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? "Création..." : "Créer"}
            </button>
          </div>
        </form>

        {error ? (
          <div className="mt-3 rounded-lg bg-error-500/10 px-3 py-2 text-sm font-medium text-error-500">{error}</div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-800">Visites</div>
            <div className="text-sm text-gray-500">{visits.length}</div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="border-b border-gray-200 px-3 py-3">Membre</th>
                  <th className="border-b border-gray-200 px-3 py-3">Date</th>
                  <th className="border-b border-gray-200 px-3 py-3">Type</th>
                  <th className="border-b border-gray-200 px-3 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id} className="text-sm text-gray-700">
                    <td className="border-b border-gray-100 px-3 py-3 font-medium text-gray-800">
                      {v.first_name} {v.last_name}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-3 text-gray-600">
                      {new Date(v.visit_date).toLocaleDateString()}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-3">{v.kind}</td>
                    <td className="border-b border-gray-100 px-3 py-3">
                      <span className="rounded-lg bg-brand-500/10 px-2 py-1 text-xs font-semibold text-brand-700">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-800">Blessures</div>
            <div className="text-sm text-gray-500">{injuries.length}</div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="border-b border-gray-200 px-3 py-3">Membre</th>
                  <th className="border-b border-gray-200 px-3 py-3">Sévérité</th>
                  <th className="border-b border-gray-200 px-3 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {injuries.map((i) => (
                  <tr key={i.id} className="text-sm text-gray-700">
                    <td className="border-b border-gray-100 px-3 py-3 font-medium text-gray-800">
                      {i.first_name} {i.last_name}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-3">{i.severity}</td>
                    <td className="border-b border-gray-100 px-3 py-3">
                      <span className="rounded-lg bg-brand-500/10 px-2 py-1 text-xs font-semibold text-brand-700">
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            MVP : création blessures via API (UI détaillée à venir).
          </div>
        </div>
      </div>
    </div>
  );
}







