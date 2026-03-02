"use client";

import * as React from "react";
import { useParams } from "next/navigation";

export default function SubscriptionVerifyPage() {
  const params = useParams();
  const subscriptionId = params.subscriptionId as string;
  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/members/subscriptions/${subscriptionId}/verify`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setError(await res.text());
          return;
        }
        setData(await res.json());
      } catch (err) {
        setError("Erreur lors de la vérification.");
      } finally {
        setIsLoading(false);
      }
    }
    if (subscriptionId) fetchData();
  }, [subscriptionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Vérification</div>
          <div className="text-lg font-bold text-gray-900">Abonnement adhérent</div>
        </div>
        <div className="p-6">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                data?.isValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {data?.isValid ? "Abonnement valide" : "Abonnement expiré"}
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">Membre</div>
                  <div className="text-sm font-bold text-gray-900">{data?.memberName || "—"}</div>
                  <div className="text-xs text-gray-500 mt-1">N° {data?.memberNumber || "—"}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-gray-100 p-4 bg-white">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">Abonnement</div>
                    <div className="text-sm font-bold text-gray-900">{data?.subscriptionName || "—"}</div>
                  </div>
                  <div className="rounded-2xl border border-gray-100 p-4 bg-white">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">Saison</div>
                    <div className="text-sm font-bold text-gray-900">{data?.seasonId || "—"}</div>
                  </div>
                  <div className="rounded-2xl border border-gray-100 p-4 bg-white">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">Début</div>
                    <div className="text-sm font-bold text-gray-900">
                      {data?.startDate ? new Date(data.startDate).toLocaleDateString("fr-FR") : "—"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-100 p-4 bg-white">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">Expiration</div>
                    <div className="text-sm font-bold text-gray-900">
                      {data?.endDate ? new Date(data.endDate).toLocaleDateString("fr-FR") : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
