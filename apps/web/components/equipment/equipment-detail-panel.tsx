'use client';

import { useState } from "react";

type EquipmentItemDetail = {
  id: string;
  name: string;
  reference: string | null;
  description: string | null;
  serial_number: string | null;
  quantity: number;
  min_quantity: number;
  condition: string;
  unit_value: string | null;
  category_name: string;
  category_code: string;
  owner_org_name: string | null;
  owner_org_id: string | null;
  location: string | null;
  acquisition_date: string | null;
  warranty_expiry: string | null;
  photo_object_key: string | null;
  created_at: string;
  updated_at: string;
};

type EquipmentHistory = {
  id: string;
  equipment_id: string;
  action: 'created' | 'updated' | 'moved' | 'repaired' | 'disposed';
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  performed_by: string;
  notes: string | null;
  created_at: string;
};

type MaintenanceRecord = {
  id: string;
  equipment_id: string;
  maintenance_type: 'preventive' | 'corrective' | 'inspection';
  description: string;
  performed_by: string;
  cost: number | null;
  scheduled_date: string | null;
  completed_date: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
};

const CONDITION_COLORS: Record<string, string> = {
  'new': 'bg-green-100 text-green-800',
  'excellent': 'bg-blue-100 text-blue-800',
  'good': 'bg-blue-100 text-blue-800',
  'used': 'bg-yellow-100 text-yellow-800',
  'fair': 'bg-orange-100 text-orange-800',
  'poor': 'bg-red-100 text-red-800',
  'damaged': 'bg-red-100 text-red-800',
  'out_of_service': 'bg-gray-100 text-gray-800'
};

const CONDITION_LABELS: Record<string, string> = {
  'new': 'Neuf',
  'excellent': 'Excellent',
  'good': 'Bon',
  'used': 'Usé',
  'fair': 'Passable',
  'poor': 'Mauvais',
  'damaged': 'Endommagé',
  'out_of_service': 'Hors service'
};

const ACTION_LABELS: Record<string, string> = {
  'created': 'Créé',
  'updated': 'Mis à jour',
  'moved': 'Déplacé',
  'repaired': 'Réparé',
  'disposed': 'Mis au rebut'
};

export function EquipmentDetailPanel({ 
  item,
  history,
  maintenanceRecords
}: { 
  item: EquipmentItemDetail; 
  history: EquipmentHistory[];
  maintenanceRecords: MaintenanceRecord[];
}) {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'maintenance'>('details');

  const getCategoryName = () => item.category_name;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'details'
              ? 'bg-brand-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Détails
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
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'maintenance'
              ? 'bg-brand-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Maintenance ({maintenanceRecords.length})
        </button>
      </div>

      {activeTab === 'details' ? (
        /* Details Tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{item.name}</h2>
              
              {item.description && (
                <p className="text-gray-600 mb-6">{item.description}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Référence</span>
                  <p className="mt-1 text-gray-800">{item.reference || '—'}</p>
                </div>
                
                {item.serial_number && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Numéro de série</span>
                    <p className="mt-1 text-gray-800">{item.serial_number}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Catégorie</span>
                  <p className="mt-1 text-gray-800">{getCategoryName()}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Propriétaire</span>
                  <p className="mt-1 text-gray-800">{item.owner_org_name || 'Fédération Royale'}</p>
                </div>
                
                {item.location && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Emplacement</span>
                    <p className="mt-1 text-gray-800">{item.location}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-medium text-gray-500">État</span>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${CONDITION_COLORS[item.condition]}`}>
                      {CONDITION_LABELS[item.condition]}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations financières</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Valeur unitaire</span>
                  <p className="mt-1 text-gray-800">
                    {item.unit_value ? `${parseFloat(item.unit_value).toLocaleString()} MAD` : '—'}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Quantité</span>
                  <p className="mt-1 text-gray-800">{item.quantity}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Valeur totale</span>
                  <p className="mt-1 text-gray-800 font-semibold">
                    {item.unit_value ? `${(parseFloat(item.unit_value) * item.quantity).toLocaleString()} MAD` : '—'}
                  </p>
                </div>
              </div>
              
              {item.min_quantity > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Stock minimum</span>
                    <span className={`text-sm font-semibold ${item.quantity <= item.min_quantity ? 'text-red-600' : 'text-green-600'}`}>
                      {item.quantity} / {item.min_quantity}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.quantity <= item.min_quantity ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(100, (item.quantity / Math.max(item.min_quantity, 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dates */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Dates importantes</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Acquisition</span>
                  <p className="mt-1 text-gray-800">
                    {item.acquisition_date 
                      ? new Date(item.acquisition_date).toLocaleDateString('fr-FR')
                      : '—'}
                  </p>
                </div>
                
                {item.warranty_expiry && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Fin de garantie</span>
                    <p className="mt-1 text-gray-800">
                      {new Date(item.warranty_expiry).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Dernière mise à jour</span>
                  <p className="mt-1 text-gray-800">
                    {new Date(item.updated_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
              
              <div className="space-y-2">
                <button className="w-full px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors">
                  Modifier l'article
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  Déplacer
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  Planifier maintenance
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  Historique complet
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'history' ? (
        /* History Tab */
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Historique de l'article</h2>
          
          {history.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun historique</h3>
              <p className="mt-1 text-sm text-gray-500">Aucune activité enregistrée pour cet article.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map(entry => (
                <div key={entry.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-brand-500 mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-800">{entry.performed_by}</span>
                      <span className="text-sm text-gray-600">{ACTION_LABELS[entry.action]}</span>
                      {entry.field_changed && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {entry.field_changed}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(entry.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    
                    {(entry.old_value || entry.new_value) && (
                      <div className="mt-2 text-sm text-gray-600">
                        {entry.old_value && (
                          <span>De: <span className="font-medium">{entry.old_value}</span></span>
                        )}
                        {entry.old_value && entry.new_value && <span> → </span>}
                        {entry.new_value && (
                          <span>À: <span className="font-medium">{entry.new_value}</span></span>
                        )}
                      </div>
                    )}
                    
                    {entry.notes && (
                      <p className="mt-2 text-sm text-gray-600">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Maintenance Tab */
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Maintenance</h2>
            <button className="px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors">
              Nouvelle maintenance
            </button>
          </div>
          
          {maintenanceRecords.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.548-.99 3.192-.99 4.741 0 1.549.99 1.549 2.607.001 3.606-1.548.99-3.192.99-4.741 0-1.549-.99-1.549-2.607 0-3.606a1.724 1.724 0 00-2.573-1.066zM19.982 19.982c-1.549.99-3.192.99-4.741 0-1.549-.99-1.549-2.607 0-3.606 1.548-.99 3.192-.99 4.741 0 1.549.99 1.549 2.607 0 3.606zM5.018 5.018c1.549-.99 3.192-.99 4.741 0 1.549.99 1.549 2.607 0 3.606-1.548.99-3.192.99-4.741 0-1.549-.99-1.549-2.607 0-3.606z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune maintenance prévue</h3>
              <p className="mt-1 text-sm text-gray-500">Planifiez une maintenance pour cet équipement.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceRecords.map(record => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{record.description}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Effectué par: {record.performed_by}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      record.status === 'completed' ? 'bg-green-100 text-green-800' :
                      record.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      record.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status === 'completed' ? 'Terminé' :
                       record.status === 'in_progress' ? 'En cours' :
                       record.status === 'scheduled' ? 'Programmé' : 'Annulé'}
                    </span>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <div className="font-medium text-gray-800 capitalize">{record.maintenance_type}</div>
                    </div>
                    {record.cost && (
                      <div>
                        <span className="text-gray-500">Coût:</span>
                        <div className="font-medium text-gray-800">{record.cost.toLocaleString()} MAD</div>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <div className="font-medium text-gray-800">
                        {record.completed_date 
                          ? new Date(record.completed_date).toLocaleDateString('fr-FR')
                          : record.scheduled_date 
                            ? new Date(record.scheduled_date).toLocaleDateString('fr-FR')
                            : '—'}
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