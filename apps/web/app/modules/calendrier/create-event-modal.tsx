"use client";

import { useState } from "react";
import { createEvent } from "./actions";

type CreateEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  users: any[];
};

const ROLES = [
  { value: "admin", label: "Administrateur" },
  { value: "federation_admin", label: "Admin Fédération" },
  { value: "club_admin", label: "Admin Club" },
  { value: "player", label: "Joueur" },
  { value: "coach", label: "Entraîneur" },
  { value: "referee", label: "Arbitre" },
];

export function CreateEventModal({ isOpen, onClose, users }: CreateEventModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    type: "event",
    targetRoles: [] as string[],
    participantIds: [] as string[],
  });

  const [userSearch, setUserSearch] = useState("");

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const toggleParticipant = (userId: string) => {
    setFormData(prev => {
      const current = prev.participantIds;
      const next = current.includes(userId)
        ? current.filter(id => id !== userId)
        : [...current, userId];
      return { ...prev, participantIds: next };
    });
  };

  const removeParticipant = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      participantIds: prev.participantIds.filter(id => id !== userId)
    }));
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    setFormData(prev => {
      const newRoles = checked 
        ? [...prev.targetRoles, role]
        : prev.targetRoles.filter(r => r !== role);
      return { ...prev, targetRoles: newRoles };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        setError("Dates invalides.");
        setIsLoading(false);
        return;
      }

      if (end.getTime() < start.getTime()) {
        setError("La date de fin doit être après la date de début.");
        setIsLoading(false);
        return;
      }

      const result = await createEvent({
        ...formData,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
        // Reset form
        setFormData({
          title: "",
          description: "",
          startDate: "",
          endDate: "",
          location: "",
          type: "event",
          targetRoles: [],
          participantIds: [],
        });
      }
    } catch (err) {
      setError("Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-800">Créer un nouvel événement</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-grow">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre</label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Réunion mensuelle"
                  className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                <select 
                  id="type"
                  name="type"
                  value={formData.type} 
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="event">Événement</option>
                  <option value="meeting">Réunion</option>
                  <option value="stage">Stage</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Début</label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Fin</label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lieu</label>
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Salle de conférence / Stade..."
                  className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Rôles cibles</label>
                <div className="grid grid-cols-2 gap-2 border border-gray-200 p-3 rounded-lg bg-gray-50/50">
                  {ROLES.map((role) => (
                    <div key={role.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`role-${role.value}`} 
                        checked={formData.targetRoles.includes(role.value)}
                        onChange={(e) => handleRoleChange(role.value, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <label 
                        htmlFor={`role-${role.value}`}
                        className="text-sm text-gray-700 cursor-pointer select-none"
                      >
                        {role.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Participants spécifiques</label>
                
                {/* Selected Participants Chips */}
                {formData.participantIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                    {formData.participantIds.map(id => {
                      const user = users.find(u => u.id === id);
                      if (!user) return null;
                      return (
                        <div key={id} className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-md text-xs shadow-sm">
                          <span>{user.displayName}</span>
                          <button 
                            type="button" 
                            onClick={() => removeParticipant(id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* User Search and List */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-2 border-b border-gray-100 bg-gray-50">
                    <input
                      type="text"
                      placeholder="Rechercher un utilisateur..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full h-8 px-2 text-sm bg-white border border-gray-200 rounded outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto p-2 space-y-1">
                    {filteredUsers.length === 0 ? (
                      <div className="text-xs text-gray-500 text-center py-2">Aucun utilisateur trouvé</div>
                    ) : (
                      filteredUsers.map(user => (
                        <div key={user.id} className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            id={`user-${user.id}`}
                            checked={formData.participantIds.includes(user.id)}
                            onChange={() => toggleParticipant(user.id)}
                            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          />
                          <label htmlFor={`user-${user.id}`} className="text-sm text-gray-700 cursor-pointer flex-grow">
                            <span className="font-medium">{user.displayName}</span>
                            <span className="text-gray-400 text-xs ml-2">{user.email}</span>
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Les utilisateurs sélectionnés verront cet événement même s'ils n'ont pas le rôle requis.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 h-10 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors text-sm shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Création..." : "Créer l'événement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
