'use client';

import { useState } from "react";
import { MovementRequestModal } from "./movement-request-modal";

type EquipmentItem = {
  id: string;
  name: string;
  reference: string | null;
  description: string | null;
  quantity: number;
  min_quantity: number;
  condition: string;
  owner_org_name: string | null;
  photo_document_id: string | null;
  created_at: string;
};

type Organization = {
  id: string;
  name: string;
  acronym: string | null;
};

const CONDITION_COLORS: Record<string, string> = {
  'new': 'bg-green-100 text-green-800',
  'good': 'bg-blue-100 text-blue-800',
  'used': 'bg-yellow-100 text-yellow-800',
  'damaged': 'bg-orange-100 text-orange-800',
  'out_of_service': 'bg-red-100 text-red-800'
};

const CONDITION_LABELS: Record<string, string> = {
  'new': 'Neuf',
  'good': 'Bon',
  'used': 'Usé',
  'damaged': 'Endommagé',
  'out_of_service': 'Hors service'
};

export function EquipmentPanel({ 
  initialItems, 
  organizations,
  canManageMovements
}: { 
  initialItems: EquipmentItem[]; 
  organizations: Organization[];
  canManageMovements: boolean;
}) {
  const [items] = useState<EquipmentItem[]>(initialItems);
  const canMove = organizations.length > 0 && canManageMovements;
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
  const getPhotoUrl = (item: EquipmentItem) => {
    if (!item.photo_document_id) return null;
    return `/api/documents/view?id=${item.photo_document_id}`;
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.reference && item.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCondition = conditionFilter === 'all' || item.condition === conditionFilter;
    
    return matchesSearch && matchesCondition;
  });

  return (
    <div className="grid gap-4">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
            <input
              type="text"
              placeholder="Nom ou référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">État</label>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="all">Tous les états</option>
              <option value="new">Neuf</option>
              <option value="good">Bon</option>
              <option value="used">Usé</option>
              <option value="damaged">Endommagé</option>
              <option value="out_of_service">Hors service</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Articles ({filteredItems.length})
          </h2>
          <div className="text-sm text-gray-500">
            {searchTerm || conditionFilter !== 'all' 
              ? `${items.length} au total` 
              : ''}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun article trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || conditionFilter !== 'all'
                ? 'Aucun article ne correspond à vos filtres.'
                : 'Commencez par ajouter votre premier article.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-gray-400">
                      {getPhotoUrl(item) ? (
                        <img src={getPhotoUrl(item)!} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h3l2-3h8l2 3h3v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a3 3 0 100 6 3 3 0 000-6z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      {item.reference && (
                        <p className="text-sm text-gray-500 mt-1">Ref: {item.reference}</p>
                      )}
                    </div>
                  </div>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${CONDITION_COLORS[item.condition]}`}>
                    {CONDITION_LABELS[item.condition]}
                  </span>
                </div>
                
                {item.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                )}
                
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Quantité:</span>
                    <div className="font-medium text-gray-800">
                      {item.quantity}
                      {item.min_quantity > 0 && (
                        <span className={`ml-1 text-xs ${item.quantity <= item.min_quantity ? 'text-red-600' : 'text-green-600'}`}>
                          (min: {item.min_quantity})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {item.owner_org_name && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-sm">
                      <span className="text-gray-500">Propriétaire:</span>
                      <div className="font-medium text-gray-800">{item.owner_org_name}</div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    Créé le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <div className="flex gap-2">
                    <button className="text-sm font-medium text-brand-600 hover:text-brand-700">
                      Détails
                    </button>
                    {canManageMovements && (
                      <button 
                        onClick={() => {
                          setSelectedEquipment(item);
                          setIsMoveModalOpen(true);
                        }}
                        disabled={!canMove}
                        className={`text-sm font-medium ${canMove ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400 cursor-not-allowed'}`}
                      >
                        Déplacer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {canManageMovements && (
        <MovementRequestModal
          isOpen={isMoveModalOpen}
          onClose={() => {
            setIsMoveModalOpen(false);
            setSelectedEquipment(null);
          }}
          equipment={selectedEquipment || { id: '', name: '', reference: null, quantity: 0 }}
          organizations={organizations}
        />
      )}
    </div>
  );
}
