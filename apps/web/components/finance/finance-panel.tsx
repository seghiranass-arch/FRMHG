"use client";

import * as React from "react";

type Summary = {
  total: number;
  pending_receipt: number;
  pending_review: number;
  approved: number;
  rejected: number;
  approved_amount_cents: number;
};

type PaymentRow = {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  org_name: string;
  created_at: string;
};

export function FinancePanel({ summary, payments }: { summary: Summary | null; payments: PaymentRow[] }) {
  const approvedMad = ((summary?.approved_amount_cents ?? 0) / 100).toFixed(2);

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-5">
        <Kpi title="Total" value={summary?.total ?? 0} />
        <Kpi title="Pending receipt" value={summary?.pending_receipt ?? 0} />
        <Kpi title="Pending review" value={summary?.pending_review ?? 0} />
        <Kpi title="Approved" value={summary?.approved ?? 0} />
        <Kpi title="Approved (MAD)" value={approvedMad} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
        <div>
          <div className="text-lg font-semibold text-gray-800">Exports</div>
          <div className="mt-1 text-sm text-gray-500">Export comptable (CSV) des paiements.</div>
        </div>
        <a
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          href="/api/finance/export/payments.csv"
        >
          Télécharger payments.csv
        </a>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-800">Paiements</div>
          <div className="text-sm text-gray-500">{payments.length} lignes</div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="border-b border-gray-200 px-3 py-3">Org</th>
                <th className="border-b border-gray-200 px-3 py-3">Montant</th>
                <th className="border-b border-gray-200 px-3 py-3">Statut</th>
                <th className="border-b border-gray-200 px-3 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="text-sm text-gray-700">
                  <td className="border-b border-gray-100 px-3 py-3 font-medium text-gray-800">{p.org_name}</td>
                  <td className="border-b border-gray-100 px-3 py-3">
                    {(p.amount_cents / 100).toFixed(2)} {p.currency}
                  </td>
                  <td className="border-b border-gray-100 px-3 py-3">
                    <span className="rounded-lg bg-brand-500/10 px-2 py-1 text-xs font-semibold text-brand-700">
                      {p.status}
                    </span>
                  </td>
                  <td className="border-b border-gray-100 px-3 py-3 text-gray-600">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
}







