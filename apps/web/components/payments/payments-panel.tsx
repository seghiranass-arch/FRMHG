"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type SchoolPayment = {
  id: string;
  memberId: string;
  memberName: string;
  licenseNumber?: string | null;
  seasonId?: string | null;
  amountCents: number;
  currency: string;
  subscriptionStatus: string;
  startDate: string;
  endDate: string;
  subscriptionName?: string | null;
  orgName?: string | null;
  payments: {
    id: string;
    amountCents: number;
    currency: string;
    status: string;
    paidAt?: string | null;
    method?: string | null;
    reference?: string | null;
    createdAt: string;
  }[];
};

type Season = {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
};

export function PaymentsPanel({ initial, seasons }: { initial: SchoolPayment[]; seasons: Season[] }) {
  const router = useRouter();
  const [items] = React.useState(initial);
  const [activeSeason, setActiveSeason] = React.useState<string>("all");

  const seasonsById = React.useMemo(() => new Map(seasons.map((s) => [s.id, s])), [seasons]);
  const seasonsByCode = React.useMemo(() => new Map(seasons.map((s) => [s.code, s])), [seasons]);

  const formatMoney = (amountCents: number, currency: string) =>
    `${(amountCents / 100).toFixed(2)} ${currency}`;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getSeasonInfo = (seasonId?: string | null) => {
    if (!seasonId) return null;
    return seasonsById.get(seasonId) || seasonsByCode.get(seasonId) || null;
  };

  const getPaymentState = (payments: SchoolPayment["payments"]) => {
    if (payments.some((p) => p.status === "paid")) return "paid";
    if (payments.some((p) => p.status === "pending")) return "pending";
    return "unpaid";
  };

  const getPaymentBadge = (state: string) => {
    const baseClasses = "px-3 py-1 text-xs font-bold rounded-full shadow-[0_2px_0_rgba(0,0,0,0.1)] border-t border-white/50";
    if (state === "paid") {
      return <span className={`${baseClasses} bg-[#6d9432] text-white border-[#8cb54f]`}>Payé</span>;
    }
    if (state === "pending") {
      return <span className={`${baseClasses} bg-orange-100 text-orange-700 border-orange-200`}>En attente</span>;
    }
    return <span className={`${baseClasses} bg-gray-100 text-gray-600 border-gray-200`}>Non payé</span>;
  };

  const grouped = React.useMemo(() => {
    const map = new Map<string, SchoolPayment[]>();
    items.forEach((item) => {
      const key = item.seasonId || "unknown";
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    });
    return map;
  }, [items]);

  const orderedSeasonKeys = React.useMemo(() => {
    const fromSeasons = seasons
      .slice()
      .sort((a, b) => (b.startDate || "").localeCompare(a.startDate || ""))
      .map((s) => s.id);
    const unknown = grouped.has("unknown") ? ["unknown"] : [];
    const extras = Array.from(grouped.keys()).filter((k) => !fromSeasons.includes(k) && k !== "unknown");
    return ["all", ...fromSeasons, ...extras, ...unknown];
  }, [seasons, grouped]);

  const filteredItems =
    activeSeason === "all"
      ? items
      : grouped.get(activeSeason) ?? [];

  const getSeasonLabel = (seasonId?: string | null) => {
    if (!seasonId || seasonId === "unknown") return "Sans saison";
    const info = getSeasonInfo(seasonId);
    if (!info) return `Saison ${seasonId}`;
    return info.name;
  };

  const getSeasonMeta = (seasonId?: string | null) => {
    if (!seasonId || seasonId === "unknown") return "—";
    const info = getSeasonInfo(seasonId);
    if (!info) return seasonId;
    return `${info.code}${info.isActive ? " • Active" : ""}`;
  };

  const totals = React.useMemo(() => {
    const totalAmount = filteredItems.reduce((sum, item) => sum + item.amountCents, 0);
    const paidAmount = filteredItems.reduce((sum, item) => {
      const state = getPaymentState(item.payments);
      return sum + (state === "paid" ? item.amountCents : 0);
    }, 0);
    const pendingCount = filteredItems.filter((item) => getPaymentState(item.payments) === "pending").length;
    return { totalAmount, paidAmount, pendingCount };
  }, [filteredItems]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-100 rounded-2xl border-2 border-white p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap items-center gap-2">
          {orderedSeasonKeys.map((key) => (
            <button
              key={key}
              onClick={() => setActiveSeason(key)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border-b-4 transition-all active:border-b-0 active:translate-y-[4px] ${
                activeSeason === key
                  ? "bg-[#6d9432] text-white border-[#4a6620] shadow-lg"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm"
              }`}
            >
              {key === "all" ? "Toutes saisons" : getSeasonLabel(key)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] hover:transform hover:-translate-y-1 transition-transform">
          <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Montant total</div>
          <div className="mt-2 text-3xl font-extrabold text-gray-800 tracking-tight">
            {formatMoney(totals.totalAmount, "MAD")}
          </div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-green-100 p-5 shadow-[0_4px_6px_-1px_rgba(20,83,45,0.05)] hover:transform hover:-translate-y-1 transition-transform">
          <div className="text-sm font-bold text-green-600 uppercase tracking-wider">Montant payé</div>
          <div className="mt-2 text-3xl font-extrabold text-[#6d9432] tracking-tight">
            {formatMoney(totals.paidAmount, "MAD")}
          </div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-orange-100 p-5 shadow-[0_4px_6px_-1px_rgba(194,65,12,0.05)] hover:transform hover:-translate-y-1 transition-transform">
          <div className="text-sm font-bold text-orange-600 uppercase tracking-wider">Paiements en attente</div>
          <div className="mt-2 text-3xl font-extrabold text-orange-600 tracking-tight">{totals.pendingCount}</div>
        </div>
      </div>

      <div className="bg-gray-100 rounded-3xl border-2 border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),0_4px_8px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <div>
            <div className="text-lg font-bold text-gray-800">
              {activeSeason === "all" ? "Toutes saisons" : getSeasonLabel(activeSeason)}
            </div>
            <div className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full inline-block mt-1">
              {activeSeason === "all" ? "Vue globale" : getSeasonMeta(activeSeason)}
            </div>
          </div>
          <button className="px-4 py-2 bg-white text-gray-700 text-sm font-bold rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50">
            Exporter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-separate border-spacing-y-0">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50/50">
                <th className="px-4 py-4 pl-6 border-b border-gray-200">Membre</th>
                <th className="px-4 py-4 border-b border-gray-200">Saison</th>
                <th className="px-4 py-4 border-b border-gray-200">Abonnement</th>
                <th className="px-4 py-4 border-b border-gray-200">Montant</th>
                <th className="px-4 py-4 border-b border-gray-200">Statut paiement</th>
                <th className="px-4 py-4 border-b border-gray-200">Dernier paiement</th>
                <th className="px-4 py-4 border-b border-gray-200">Méthode</th>
                <th className="px-4 py-4 border-b border-gray-200">Référence</th>
                <th className="px-4 py-4 pr-6 border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/0">
              {filteredItems.map((item) => {
                const latestPayment = item.payments[0];
                const paymentState = getPaymentState(item.payments);
                return (
                  <tr key={item.id} className="text-sm text-gray-700 group hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 bg-white first:rounded-l-lg last:rounded-r-lg shadow-sm my-2 border-b border-gray-100 group-last:border-0">
                      <div className="font-bold text-gray-800">{item.memberName}</div>
                      {item.licenseNumber && <div className="text-xs text-gray-500 font-mono">{item.licenseNumber}</div>}
                    </td>
                    <td className="px-4 py-3 bg-white border-b border-gray-100 group-last:border-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                        {getSeasonLabel(item.seasonId)}
                      </span>
                    </td>
                    <td className="px-4 py-3 bg-white border-b border-gray-100 group-last:border-0">
                      {item.subscriptionName || "—"}
                    </td>
                    <td className="px-4 py-3 bg-white border-b border-gray-100 group-last:border-0 font-mono font-semibold">
                      {formatMoney(item.amountCents, item.currency)}
                    </td>
                    <td className="px-4 py-3 bg-white border-b border-gray-100 group-last:border-0">
                      {getPaymentBadge(paymentState)}
                    </td>
                    <td className="px-4 py-3 bg-white border-b border-gray-100 group-last:border-0 text-gray-500">
                      {latestPayment?.paidAt ? formatDate(latestPayment.paidAt) : "—"}
                    </td>
                    <td className="px-4 py-3 bg-white border-b border-gray-100 group-last:border-0">
                      {latestPayment?.method ? (
                        <span className="flex items-center gap-1">
                          {latestPayment.method === 'virement' ? '🏦' : '💳'} 
                          <span className="capitalize">{latestPayment.method}</span>
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 bg-white border-b border-gray-100 group-last:border-0 font-mono text-xs text-gray-500">
                      {latestPayment?.reference || "—"}
                    </td>
                    <td className="px-4 py-3 bg-white border-b border-gray-100 group-last:border-0 last:rounded-r-lg">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/modules/membres/${item.memberId}`)}
                          className="px-3 py-1.5 rounded-lg bg-white text-gray-700 text-xs font-semibold ring-1 ring-gray-200 hover:bg-gray-50"
                        >
                          Voir fiche
                        </button>
                        <button
                          onClick={() => router.push(`/modules/membres/${item.memberId}?section=admin`)}
                          className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800"
                        >
                          Gérer paiement
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
