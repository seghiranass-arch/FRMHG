"use client";

import * as React from "react";
import { EditSettingsModal } from "../edit-settings-modal";

type Discipline = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

interface DisciplinesListProps {
  disciplines: Discipline[];
  onToggleStatus: (id: string, is_active: boolean) => Promise<void>;
  onEdit: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DisciplinesList({ disciplines, onToggleStatus, onEdit, onDelete }: DisciplinesListProps) {
  const [editingDiscipline, setEditingDiscipline] = React.useState<Discipline | null>(null);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-theme-sm">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="border-b border-gray-200 px-6 py-4">Discipline</th>
              <th className="border-b border-gray-200 px-6 py-4">Statut</th>
              <th className="border-b border-gray-200 px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {disciplines.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-gray-500 text-sm">
                  Aucune discipline configurée.
                </td>
              </tr>
            ) : (
              disciplines.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{d.name}</div>
                    {d.description && <div className="text-xs text-gray-500 mt-0.5">{d.description}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      d.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {d.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setEditingDiscipline(d)}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => onToggleStatus(d.id, !d.is_active)}
                        className={`text-sm font-medium ${
                          d.is_active ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"
                        }`}
                      >
                        {d.is_active ? "Désactiver" : "Activer"}
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = window.confirm("Supprimer cette discipline ?");
                          if (!confirmed) return;
                          await onDelete(d.id);
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
        isOpen={!!editingDiscipline}
        onClose={() => setEditingDiscipline(null)}
        title="Modifier la discipline"
        fields={[
          { name: "name", label: "Nom de la discipline", type: "text", defaultValue: editingDiscipline?.name, required: true },
          { name: "description", label: "Description", type: "textarea", defaultValue: editingDiscipline?.description || "" }
        ]}
        onSubmit={async (formData) => {
          if (editingDiscipline) {
            await onEdit(editingDiscipline.id, formData);
          }
        }}
      />
    </>
  );
}
