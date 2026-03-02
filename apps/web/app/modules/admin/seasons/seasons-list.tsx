"use client";

import * as React from "react";
import { EditSettingsModal } from "../edit-settings-modal";

type Season = {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

interface SeasonsListProps {
  seasons: Season[];
  onToggleStatus: (id: string, isActive: boolean) => Promise<void>;
  onEdit: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function SeasonsList({ seasons, onToggleStatus, onEdit, onDelete }: SeasonsListProps) {
  const [editingSeason, setEditingSeason] = React.useState<Season | null>(null);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-theme-sm">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="border-b border-gray-200 px-6 py-4">Saison</th>
              <th className="border-b border-gray-200 px-6 py-4">Période</th>
              <th className="border-b border-gray-200 px-6 py-4">Statut</th>
              <th className="border-b border-gray-200 px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {seasons.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">
                  Aucune saison configurée.
                </td>
              </tr>
            ) : (
              seasons.map((season) => (
                <tr key={season.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{season.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{season.code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{season.startDate} → {season.endDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${season.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {season.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setEditingSeason(season)}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => onToggleStatus(season.id, !season.isActive)}
                        className={`text-sm font-medium ${season.isActive ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}`}
                      >
                        {season.isActive ? "Désactiver" : "Activer"}
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = window.confirm("Supprimer cette saison ?");
                          if (!confirmed) return;
                          await onDelete(season.id);
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
        isOpen={!!editingSeason}
        onClose={() => setEditingSeason(null)}
        title="Modifier la saison"
        fields={[
          { name: "code", label: "Code", type: "text", defaultValue: editingSeason?.code, required: true },
          { name: "name", label: "Nom", type: "text", defaultValue: editingSeason?.name, required: true },
          { name: "startDate", label: "Date de début", type: "text", defaultValue: editingSeason?.startDate, required: true },
          { name: "endDate", label: "Date de fin", type: "text", defaultValue: editingSeason?.endDate, required: true },
          { 
            name: "isActive", 
            label: "Statut", 
            type: "select", 
            defaultValue: editingSeason?.isActive ? "true" : "false",
            options: [
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" }
            ] 
          }
        ]}
        onSubmit={async (formData) => {
          if (editingSeason) {
            await onEdit(editingSeason.id, formData);
          }
        }}
      />
    </>
  );
}
