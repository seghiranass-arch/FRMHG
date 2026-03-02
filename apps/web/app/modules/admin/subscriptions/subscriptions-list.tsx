"use client";

import * as React from "react";
import { EditSettingsModal } from "../edit-settings-modal";

type SubscriptionType = {
  id: string;
  name: string;
  description: string | null;
  amount_cents: number;
  currency: string;
  duration_months: number | null;
  is_active: boolean;
};

interface SubscriptionsListProps {
  subscriptions: SubscriptionType[];
  onToggleStatus: (id: string, is_active: boolean) => Promise<void>;
  onEdit: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function SubscriptionsList({ subscriptions, onToggleStatus, onEdit, onDelete }: SubscriptionsListProps) {
  const [editingSubscription, setEditingSubscription] = React.useState<SubscriptionType | null>(null);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-theme-sm">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="border-b border-gray-200 px-6 py-4">Type</th>
              <th className="border-b border-gray-200 px-6 py-4">Tarif</th>
              <th className="border-b border-gray-200 px-6 py-4">Durée</th>
              <th className="border-b border-gray-200 px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">
                  Aucun type d'abonnement configuré.
                </td>
              </tr>
            ) : (
              subscriptions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{s.name}</div>
                    {s.description && <div className="text-xs text-gray-500 mt-0.5">{s.description}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-brand-600">{(s.amount_cents / 100).toFixed(2)} {s.currency}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {s.duration_months ? `${s.duration_months} mois` : "Illimité / Custom"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setEditingSubscription(s)}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => onToggleStatus(s.id, !s.is_active)}
                        className={`text-sm font-medium ${
                          s.is_active ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"
                        }`}
                      >
                        {s.is_active ? "Désactiver" : "Activer"}
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = window.confirm("Supprimer cet abonnement ?");
                          if (!confirmed) return;
                          await onDelete(s.id);
                        }}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EditSettingsModal
        isOpen={!!editingSubscription}
        onClose={() => setEditingSubscription(null)}
        title="Modifier le type d'abonnement"
        fields={[
          { name: "name", label: "Nom", type: "text", defaultValue: editingSubscription?.name, required: true },
          { name: "amount", label: "Montant (MAD)", type: "number", step: "0.01", defaultValue: editingSubscription ? (editingSubscription.amount_cents / 100) : 0, required: true },
          { name: "duration", label: "Durée (mois)", type: "number", defaultValue: editingSubscription?.duration_months || "" },
          { name: "description", label: "Description", type: "textarea", defaultValue: editingSubscription?.description || "" }
        ]}
        onSubmit={async (formData) => {
          if (editingSubscription) {
            await onEdit(editingSubscription.id, formData);
          }
        }}
      />
    </>
  );
}
