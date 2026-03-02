'use client';

import { useEffect, useState } from "react";

type EquipmentItem = {
  id: string;
  name: string;
  reference: string | null;
  quantity: number;
};

type Organization = {
  id: string;
  name: string;
  acronym: string | null;
};

type Member = {
  id: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  member_status?: string | null;
  memberStatus?: string | null;
  org?: {
    id: string;
    name: string;
    acronym: string | null;
  } | null;
  org_name?: string | null;
};

export function MovementRequestModal({ 
  isOpen, 
  onClose, 
  equipment,
  organizations
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  equipment: EquipmentItem;
  organizations: Organization[];
}) {
  const [movementType, setMovementType] = useState<'transfer' | 'loan' | 'repair' | 'disposal'>('transfer');
  const [destinationType, setDestinationType] = useState<'organization' | 'member'>('organization');
  const [memberType, setMemberType] = useState<'club_player' | 'adherent'>('club_player');
  const [toOrgId, setToOrgId] = useState<string>('');
  const [toMemberId, setToMemberId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const hasOrganizations = organizations.length > 0;
  const hasMembers = members.length > 0;
  const requiresDestination = movementType !== 'disposal';
  const isDestinationValid = !requiresDestination || (
    destinationType === 'organization' ? !!toOrgId : !!toMemberId
  );
  const filteredMembers = members.filter(member => {
    const status = member.member_status ?? member.memberStatus;
    return status === memberType;
  });

  useEffect(() => {
    if (!isOpen) return;
    if (!hasOrganizations) {
      setDestinationType('member');
    }
  }, [isOpen, hasOrganizations]);

  useEffect(() => {
    if (!isOpen) return;
    const loadMembers = async () => {
      setIsMembersLoading(true);
      setMembersError(null);
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('frmhg_token='))
          ?.split('=')[1];
        const res = await fetch("/api/members", {
          cache: "no-store",
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) {
          throw new Error("Impossible de charger les membres");
        }
        const data = await res.json();
        setMembers(Array.isArray(data) ? data : []);
      } catch (error) {
        setMembersError(error instanceof Error ? error.message : "Erreur lors du chargement");
      } finally {
        setIsMembersLoading(false);
      }
    };
    loadMembers();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('frmhg_token='))
        ?.split('=')[1];
      const payload = {
        equipment_id: equipment.id,
        movement_type: movementType,
        destination_type: destinationType,
        to_org_id: destinationType === 'organization' ? toOrgId : null,
        to_member_id: destinationType === 'member' ? toMemberId : null,
        quantity,
        reason
      };

      const response = await fetch('/api/equipment/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur lors de la création de la demande');
      }
      
      // Reset form and close modal
      setToOrgId('');
      setToMemberId('');
      setQuantity(1);
      setReason('');
      onClose();
      
      window.dispatchEvent(new CustomEvent('equipment-movement-created'));
      alert('Demande de déplacement envoyée avec succès!');
      
    } catch (error) {
      console.error('Error creating movement request:', error);
      alert('Erreur lors de la création de la demande');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Déplacer l'équipement</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800">{equipment.name}</h3>
            {equipment.reference && (
              <p className="text-sm text-gray-600">Réf: {equipment.reference}</p>
            )}
            <p className="text-sm text-gray-600">Stock disponible: {equipment.quantity}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de mouvement
              </label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as 'transfer' | 'loan' | 'repair' | 'disposal')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              >
                <option value="transfer">Transfert</option>
                <option value="loan">Prêt</option>
                <option value="repair">Réparation</option>
                <option value="disposal">Mise au rebut</option>
              </select>
            </div>

            {movementType !== 'disposal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <select
                  value={destinationType}
                  onChange={(e) => {
                    const value = e.target.value as 'organization' | 'member';
                    setDestinationType(value);
                    setToOrgId('');
                    setToMemberId('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  required
                >
                  <option value="organization">Organisation</option>
                  <option value="member">Individu (joueur ou adhérent)</option>
                </select>

                {destinationType === 'organization' && (
                  <div className="mt-3">
                    <select
                      value={toOrgId}
                      onChange={(e) => setToOrgId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                      required
                      disabled={!hasOrganizations}
                    >
                      <option value="">Sélectionner une organisation</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>
                          {org.name} {org.acronym ? `(${org.acronym})` : ''}
                        </option>
                      ))}
                    </select>
                    {!hasOrganizations && (
                      <p className="mt-2 text-xs text-gray-500">
                        Aucune organisation disponible pour le moment.
                      </p>
                    )}
                  </div>
                )}

                {destinationType === 'member' && (
                  <div className="mt-3 space-y-3">
                    <select
                      value={memberType}
                      onChange={(e) => {
                        setMemberType(e.target.value as 'club_player' | 'adherent');
                        setToMemberId('');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      required
                    >
                      <option value="club_player">Joueur de club</option>
                      <option value="adherent">Adhérent école hockey</option>
                    </select>

                    <select
                      value={toMemberId}
                      onChange={(e) => setToMemberId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                      required
                      disabled={isMembersLoading || filteredMembers.length === 0}
                    >
                      <option value="">
                        {isMembersLoading ? 'Chargement...' : 'Sélectionner un individu'}
                      </option>
                      {filteredMembers.map(member => {
                        const firstName = member.first_name ?? member.firstName ?? '';
                        const lastName = member.last_name ?? member.lastName ?? '';
                        const orgName = member.org?.name ?? member.org_name ?? '';
                        const label = `${lastName} ${firstName}`.trim() || 'Sans nom';
                        return (
                          <option key={member.id} value={member.id}>
                            {label}{orgName ? ` • ${orgName}` : ''}
                          </option>
                        );
                      })}
                    </select>

                    {membersError && (
                      <p className="text-xs text-red-600">{membersError}</p>
                    )}
                    {!membersError && !isMembersLoading && filteredMembers.length === 0 && (
                      <p className="text-xs text-gray-500">
                        Aucun individu disponible pour cette catégorie.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité
              </label>
              <input
                type="number"
                min="1"
                max={equipment.quantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), equipment.quantity))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {equipment.quantity} unités disponibles
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison du déplacement
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Expliquez pourquoi cet équipement doit être déplacé..."
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={
                  isLoading ||
                  (requiresDestination && destinationType === 'organization' && !hasOrganizations) ||
                  (requiresDestination && destinationType === 'member' && !hasMembers) ||
                  !isDestinationValid
                }
                className="flex-1 px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Envoi...' : 'Envoyer la demande'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
