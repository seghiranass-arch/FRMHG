"use client";

import * as React from "react";
import { 
  Building2, MapPin, Phone, Mail, Globe, Users, Calendar, 
  CheckCircle, Clock, XCircle, FileText, CreditCard, Trophy, Settings,
  Facebook, Instagram, Twitter, Youtube, Eye, Edit, Trash2
} from "lucide-react";

type Club = {
  id: string;
  name: string;
  acronym?: string;
  type: "club" | "national_team";
  status: "pending" | "active" | "suspended" | "archived";
  region?: string;
  city?: string;
  fullAddress?: string;
  primaryPhone?: string;
  officialEmail?: string;
  website?: string;
  presidentName?: string;
  secretaryGeneralName?: string;
  treasurerName?: string;
  primaryContactName?: string;
  primaryContactPhone?: string;
  establishmentDate?: string;
  federalRegistrationNumber?: string;
  suspensionReason?: string;
  organizationType?: string;
  referenceSeason?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  activeCategories?: string[];
  practicedDisciplines?: string[];
  clubColors?: { primary?: string; secondary?: string };
  ribIban?: string;
  logoDocumentId?: string;
  _count?: { members: number };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  archived?: boolean;
  validationDate?: string;
  validatedBy?: string;
  rejectionReason?: string;
};

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  category?: string;
  licenseStatus?: string;
};

const STATUS_CONFIG = {
  active: { label: "Actif", color: "bg-green-100 text-green-700", icon: CheckCircle },
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  suspended: { label: "Suspendu", color: "bg-red-100 text-red-700", icon: XCircle },
  archived: { label: "Archivé", color: "bg-gray-100 text-gray-600", icon: XCircle },
};

const TABS = [
  { id: "general", label: "Informations", icon: Building2 },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "financial", label: "Finances", icon: CreditCard },
  { id: "teams", label: "Équipes", icon: Users },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "system", label: "Système", icon: Settings },
];

interface ClubProfileViewProps {
  club: Club;
  members: Member[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ClubProfileView({ club, members, onEdit, onDelete }: ClubProfileViewProps) {
  const [activeTab, setActiveTab] = React.useState("general");
  const StatusIcon = STATUS_CONFIG[club.status]?.icon || CheckCircle;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Non spécifié";
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR');
    } catch {
      return "Date invalide";
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "Non spécifié";
    try {
      return new Date(dateStr).toLocaleString('fr-FR');
    } catch {
      return "Date invalide";
    }
  };

  const SocialMediaIcon = ({ platform }: { platform: string }) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {club.logoDocumentId ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                <img 
                  src={`/api/documents/view?id=${club.logoDocumentId}`} 
                  alt={`${club.name} logo`} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // If logo fails to load, show fallback
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className = 'w-16 h-16 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-xl';
                      fallbackDiv.textContent = club.acronym?.substring(0, 2) || club.name.substring(0, 2);
                      parent.appendChild(fallbackDiv);
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-xl">
                {club.acronym?.substring(0, 2) || club.name.substring(0, 2)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{club.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                {club.city && (
                  <span className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {club.city}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_CONFIG[club.status]?.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {STATUS_CONFIG[club.status]?.label}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.()}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </button>
            <button
              onClick={() => onDelete?.()}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 shadow-sm transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 border-t border-gray-100 pt-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "general" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Informations générales</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Type d'organisation</dt>
                <dd className="text-sm font-medium text-gray-900">{club.organizationType || "Non spécifié"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Type</dt>
                <dd className="text-sm font-medium text-gray-900">{club.type === "club" ? "Club" : "Équipe nationale"}</dd>
              </div>
              {club.federalRegistrationNumber && (
                <div>
                  <dt className="text-sm text-gray-500">N° d'agrément fédéral</dt>
                  <dd className="text-sm font-medium text-gray-900">{club.federalRegistrationNumber}</dd>
                </div>
              )}
              {club.referenceSeason && (
                <div>
                  <dt className="text-sm text-gray-500">Saison de référence</dt>
                  <dd className="text-sm font-medium text-gray-900">{club.referenceSeason}</dd>
                </div>
              )}
              {club.establishmentDate && (
                <div>
                  <dt className="text-sm text-gray-500">Date de création</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatDate(club.establishmentDate)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-gray-500">Membres</dt>
                <dd className="text-sm font-medium text-gray-900">{club._count?.members || 0}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Coordonnées</h3>
            <dl className="space-y-3">
              {club.fullAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-900">{club.fullAddress}</span>
                </div>
              )}
              {club.primaryPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{club.primaryPhone}</span>
                </div>
              )}
              {club.officialEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{club.officialEmail}</span>
                </div>
              )}
              {club.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline">
                    {club.website}
                  </a>
                </div>
              )}
            </dl>
            
            {/* Social Media Links */}
            {club.socialMedia && Object.values(club.socialMedia).some(v => v) && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Réseaux sociaux</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(club.socialMedia).map(([platform, url]) => 
                    url && (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <SocialMediaIcon platform={platform} />
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </a>
                    )
                  )}
                </div>
              </div>
            )}
            
            {/* Club Colors */}
            {club.clubColors && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Couleurs du club</h4>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Primaire:</span>
                    <div 
                      className="w-8 h-8 rounded border border-gray-200" 
                      style={{ backgroundColor: club.clubColors.primary }}
                    />
                    <span className="text-xs font-mono text-gray-500">{club.clubColors.primary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Secondaire:</span>
                    <div 
                      className="w-8 h-8 rounded border border-gray-200" 
                      style={{ backgroundColor: club.clubColors.secondary }}
                    />
                    <span className="text-xs font-mono text-gray-500">{club.clubColors.secondary}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {(club.activeCategories?.length || club.practicedDisciplines?.length) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4">Activités sportives</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {(club.activeCategories?.length ?? 0) > 0 && (
                  <div>
                    <dt className="text-sm text-gray-500 mb-2">Catégories</dt>
                    <dd className="flex flex-wrap gap-2">
                      {club.activeCategories!.map((cat) => (
                        <span key={cat} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                          {cat}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {(club.practicedDisciplines?.length ?? 0) > 0 && (
                  <div>
                    <dt className="text-sm text-gray-500 mb-2">Disciplines</dt>
                    <dd className="flex flex-wrap gap-2">
                      {club.practicedDisciplines!.map((disc) => (
                        <span key={disc} className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                          {disc}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          )}

          {club.suspensionReason && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-6 md:col-span-2">
              <h3 className="font-semibold text-red-800 mb-2">Motif de suspension</h3>
              <p className="text-sm text-red-700">{club.suspensionReason}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "contacts" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Responsables du club</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Président", name: club.presidentName },
              { label: "Secrétaire Général", name: club.secretaryGeneralName },
              { label: "Trésorier", name: club.treasurerName },
            ].map((contact) => contact.name && (
              <div key={contact.label} className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{contact.label}</p>
                <p className="font-semibold text-gray-900">{contact.name}</p>
              </div>
            ))}
          </div>
          {club.primaryContactName && (
            <div className="mt-6 p-4 bg-brand-50 rounded-xl">
              <p className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">Contact principal</p>
              <p className="font-semibold text-gray-900">{club.primaryContactName}</p>
              {club.primaryContactPhone && (
                <p className="text-sm text-gray-600 mt-1">{club.primaryContactPhone}</p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "financial" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Informations financières</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Coordonnées bancaires</h4>
              {club.ribIban ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-mono text-sm break-all">{club.ribIban}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucun RIB/IBAN enregistré</p>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Validation financière</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">Compte vérifié</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-700">À jour cotisations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "teams" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Équipes</h2>
              <p className="text-gray-600 mt-1">Équipes générées automatiquement par catégorie d'âge et sexe</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Sénior Féminine</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Seniors</span>
                      <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">Féminine</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Membres:</span>
                    <span className="font-semibold text-gray-900">0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-brand-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">U17 Masculine</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">U17</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Masculine</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Membres:</span>
                    <span className="font-semibold text-gray-900">0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-brand-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">🏒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune équipe créée</h3>
            <p className="text-gray-600">Les équipes sont créées automatiquement à la création du club.</p>
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Documents du Club</h2>
              <p className="text-gray-600 mt-1">Gérez les documents administratifs et légaux du club</p>
            </div>
            <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2">
              <span>+</span>
              Ajouter un document
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">Statuts du club.pdf</h3>
                    <p className="text-sm text-gray-600 mt-1">Statuts du club</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">Approuvé</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Taille:</span>
                    <span className="font-medium">2.4 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">15/01/2024</span>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                  <button className="text-brand-600 hover:text-brand-800 text-sm font-medium px-3 py-1 rounded hover:bg-brand-50 transition-colors">
                    Télécharger
                  </button>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">Recepisse legal.pdf</h3>
                    <p className="text-sm text-gray-600 mt-1">Recepisse legal</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="px-2 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800">En attente</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Taille:</span>
                    <span className="font-medium">1.1 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">10/01/2024</span>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                  <button className="text-brand-600 hover:text-brand-800 text-sm font-medium px-3 py-1 rounded hover:bg-brand-50 transition-colors">
                    Télécharger
                  </button>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun document</h3>
            <p className="text-gray-600 mb-6">Commencez par ajouter des documents administratifs pour votre club</p>
            <button className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
              Ajouter un document
            </button>
          </div>
        </div>
      )}

      {activeTab === "system" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Informations système</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-500 mb-1">Date de création</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDateTime(club.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 mb-1">Dernière mise à jour</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDateTime(club.updatedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 mb-1">Créé par</dt>
              <dd className="text-sm font-medium text-gray-900">{club.createdBy || 'Inconnu'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 mb-1">Mis à jour par</dt>
              <dd className="text-sm font-medium text-gray-900">{club.updatedBy || 'Personne'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 mb-1">Archivé</dt>
              <dd className="text-sm font-medium text-gray-900">
                <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                  club.archived ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {club.archived ? 'Oui' : 'Non'}
                </span>
              </dd>
            </div>
            {club.validationDate && (
              <div>
                <dt className="text-sm text-gray-500 mb-1">Date de validation</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDateTime(club.validationDate)}
                </dd>
              </div>
            )}
            {club.validatedBy && (
              <div>
                <dt className="text-sm text-gray-500 mb-1">Validé par</dt>
                <dd className="text-sm font-medium text-gray-900">{club.validatedBy}</dd>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
