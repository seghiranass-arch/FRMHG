'use client';

import { useEffect, useState } from "react";

type EquipmentMovement = {
  id: string;
  equipment_id: string;
  equipment_name: string;
  equipment_reference: string | null;
  equipment_photo_document_id?: string | null;
  from_org_id: string | null;
  from_org_name: string | null;
  to_org_id: string | null;
  to_org_name: string | null;
  movement_type: 'transfer' | 'loan' | 'repair' | 'disposal';
  quantity: number;
  reason: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  requested_by: string;
  approved_by: string | null;
  requested_at: string;
  approved_at: string | null;
  completed_at: string | null;
};

type MovementHistory = {
  id: string;
  movement_id: string;
  action: 'created' | 'approved' | 'completed' | 'cancelled';
  performed_by: string;
  notes: string | null;
  created_at: string;
  movement_status: 'pending' | 'approved' | 'completed' | 'cancelled';
  equipment_id: string;
  equipment_name: string;
  equipment_reference: string | null;
  equipment_photo_document_id?: string | null;
  from_org_id: string | null;
  from_org_name: string | null;
  to_org_id: string | null;
  to_org_name: string | null;
  movement_type: 'transfer' | 'loan' | 'repair' | 'disposal';
  quantity: number;
  reason: string;
  requested_by: string;
  requested_at: string;
  completed_at: string | null;
};

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  'transfer': 'Transfert',
  'loan': 'Prêt',
  'repair': 'Réparation',
  'disposal': 'Mise au rebut'
};

const MOVEMENT_TYPE_COLORS: Record<string, string> = {
  'transfer': 'bg-blue-100 text-blue-800',
  'loan': 'bg-purple-100 text-purple-800',
  'repair': 'bg-yellow-100 text-yellow-800',
  'disposal': 'bg-red-100 text-red-800'
};

const STATUS_LABELS: Record<string, string> = {
  'pending': 'En attente',
  'approved': 'Approuvé',
  'completed': 'Terminé',
  'cancelled': 'Annulé'
};

const STATUS_COLORS: Record<string, string> = {
  'pending': 'bg-orange-100 text-orange-800',
  'approved': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-gray-100 text-gray-800'
};

export function EquipmentMovementsPanel({ 
  initialMovements,
  initialHistory,
  canManageMovements
}: { 
  initialMovements: EquipmentMovement[]; 
  initialHistory: MovementHistory[];
  canManageMovements: boolean;
}) {
  const [movements, setMovements] = useState<EquipmentMovement[]>(initialMovements);
  const [history, setHistory] = useState<MovementHistory[]>(initialHistory);
  const [activeTab, setActiveTab] = useState<'movements' | 'history'>('movements');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('all');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all');
  const [historyDateFrom, setHistoryDateFrom] = useState<string>('');
  const [historyDateTo, setHistoryDateTo] = useState<string>('');
  const [actionMovementId, setActionMovementId] = useState<string | null>(null);
  const getPhotoUrl = (movement: { equipment_photo_document_id?: string | null }) => {
    if (!movement.equipment_photo_document_id) return null;
    return `/api/documents/view?id=${movement.equipment_photo_document_id}`;
  };

  const loadMovements = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('frmhg_token='))
        ?.split('=')[1];
      const res = await fetch('/api/equipment/movements', {
        cache: 'no-store',
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMovements(Array.isArray(data) ? data : []);
      }
    } catch {
      setMovements([]);
    }
  };

  const loadHistory = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('frmhg_token='))
        ?.split('=')[1];
      const res = await fetch('/api/equipment/movements/history', {
        cache: 'no-store',
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch {
      setHistory([]);
    }
  };

  const completeMovement = async (movementId: string) => {
    setActionMovementId(movementId);
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('frmhg_token='))
        ?.split('=')[1];
      const res = await fetch(`/api/equipment/movements/${movementId}/complete`, {
        method: 'PATCH',
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Erreur lors de la clôture');
      }
      await loadMovements();
      await loadHistory();
    } finally {
      setActionMovementId(null);
    }
  };

  useEffect(() => {
    if (initialMovements.length === 0) {
      loadMovements();
    }
    if (initialHistory.length === 0) {
      loadHistory();
    }
    const handler = () => {
      loadMovements();
      loadHistory();
    };
    window.addEventListener('equipment-movement-created', handler);
    return () => window.removeEventListener('equipment-movement-created', handler);
  }, []);

  const activeMovements = movements.filter(movement => (
    movement.status !== 'completed' && movement.status !== 'cancelled'
  ));
  const filteredMovements = activeMovements.filter(movement => {
    const matchesStatus = statusFilter === 'all' || movement.status === statusFilter;
    const matchesType = typeFilter === 'all' || movement.movement_type === typeFilter;
    return matchesStatus && matchesType;
  });
  const filteredHistory = history.filter(entry => {
    const matchesStatus = historyStatusFilter === 'all' || entry.movement_status === historyStatusFilter;
    const matchesType = historyTypeFilter === 'all' || entry.movement_type === historyTypeFilter;
    const entryDate = new Date(entry.requested_at);
    const fromDate = historyDateFrom ? new Date(historyDateFrom) : null;
    const toDate = historyDateTo ? new Date(historyDateTo) : null;
    const matchesFrom = !fromDate || entryDate >= new Date(fromDate.setHours(0, 0, 0, 0));
    const matchesTo = !toDate || entryDate <= new Date(toDate.setHours(23, 59, 59, 999));
    return matchesStatus && matchesType && matchesFrom && matchesTo;
  });

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'movements'
              ? 'bg-brand-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Mouvements ({activeMovements.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-brand-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Historique ({history.length})
        </button>
      </div>

      {activeTab === 'movements' ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvé</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de mouvement</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="all">Tous les types</option>
                  <option value="transfer">Transfert</option>
                  <option value="loan">Prêt</option>
                  <option value="repair">Réparation</option>
                  <option value="disposal">Mise au rebut</option>
                </select>
              </div>
            </div>
          </div>

          {/* Movements List */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Mouvements d'équipement
              </h2>
              <div className="text-sm text-gray-500">
                {filteredMovements.length} mouvements
              </div>
            </div>

            {filteredMovements.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun mouvement trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Aucun mouvement ne correspond à vos filtres.'
                    : 'Aucun mouvement d\'équipement enregistré.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMovements.map(movement => (
                  <div key={movement.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-gray-400">
                            {getPhotoUrl(movement) ? (
                              <img src={getPhotoUrl(movement)!} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h3l2-3h8l2 3h3v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a3 3 0 100 6 3 3 0 000-6z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{movement.equipment_name}</h3>
                            {movement.equipment_reference && (
                              <span className="text-sm text-gray-500">({movement.equipment_reference})</span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{movement.reason}</p>
                        {canManageMovements && movement.status !== 'completed' && movement.status !== 'cancelled' && (
                          <div className="mt-3">
                            <button
                              onClick={() => completeMovement(movement.id)}
                              disabled={actionMovementId === movement.id}
                              className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionMovementId === movement.id ? 'Clôture...' : 'Mettre fin au déplacement'}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${MOVEMENT_TYPE_COLORS[movement.movement_type]}`}>
                          {MOVEMENT_TYPE_LABELS[movement.movement_type]}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[movement.status]}`}>
                          {STATUS_LABELS[movement.status]}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">De:</span>
                        <div className="font-medium text-gray-800">
                          {movement.from_org_name || 'Fédération Royale'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Vers:</span>
                        <div className="font-medium text-gray-800">
                          {movement.to_org_name || 'Non renseigné'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Quantité:</span>
                        <div className="font-medium text-gray-800">{movement.quantity}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        {movement.requested_by !== 'Administrateur Fédération' && (
                          <div>
                            <span className="text-gray-500">Demandé par:</span>
                            <div className="font-medium text-gray-800">{movement.requested_by}</div>
                          </div>
                        )}
                        {movement.approved_by && (
                          <div>
                            <span className="text-gray-500">Approuvé par:</span>
                            <div className="font-medium text-gray-800">{movement.approved_by}</div>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <div className="font-medium text-gray-800">
                            {new Date(movement.requested_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Historique des mouvements</h2>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de mouvement</label>
                <select
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="all">Tous les types</option>
                  <option value="transfer">Transfert</option>
                  <option value="loan">Prêt</option>
                  <option value="repair">Réparation</option>
                  <option value="disposal">Mise au rebut</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
                <input
                  type="date"
                  value={historyDateFrom}
                  onChange={(e) => setHistoryDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
                <input
                  type="date"
                  value={historyDateTo}
                  onChange={(e) => setHistoryDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun historique</h3>
              <p className="mt-1 text-sm text-gray-500">Aucune activité d'équipement enregistrée.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map(entry => (
                <div key={entry.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-gray-400">
                          {getPhotoUrl(entry) ? (
                            <img src={getPhotoUrl(entry)!} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h3l2-3h8l2 3h3v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a3 3 0 100 6 3 3 0 000-6z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{entry.equipment_name}</h3>
                          {entry.equipment_reference && (
                            <span className="text-sm text-gray-500">({entry.equipment_reference})</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{entry.reason}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${MOVEMENT_TYPE_COLORS[entry.movement_type]}`}>
                        {MOVEMENT_TYPE_LABELS[entry.movement_type]}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[entry.movement_status]}`}>
                        {STATUS_LABELS[entry.movement_status]}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">De:</span>
                      <div className="font-medium text-gray-800">
                        {entry.from_org_name || 'Fédération Royale'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Vers:</span>
                      <div className="font-medium text-gray-800">
                        {entry.to_org_name || 'Non renseigné'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Quantité:</span>
                      <div className="font-medium text-gray-800">{entry.quantity}</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      {entry.requested_by !== 'Administrateur Fédération' && (
                        <div>
                          <span className="text-gray-500">Demandé par:</span>
                          <div className="font-medium text-gray-800">{entry.requested_by}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Action:</span>
                        <div className="font-medium text-gray-800 capitalize">{entry.action}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <div className="font-medium text-gray-800">
                          Début: {new Date(entry.requested_at).toLocaleString('fr-FR')}
                        </div>
                        <div className="font-medium text-gray-800">
                          Fin: {entry.completed_at ? new Date(entry.completed_at).toLocaleString('fr-FR') : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
