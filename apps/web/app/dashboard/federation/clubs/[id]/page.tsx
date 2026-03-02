"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, XCircle, MapPin, Edit, Trash2, X, Building2, Users, CreditCard, Users2, FileText, Settings } from "lucide-react";
import DocumentUploadModal from "./document-upload-modal";

// ClubProfileView component with document management
const ClubProfileView = ({ club, members, documents, teams, onEdit, onDelete, onBack, 
  showUploadModal, setShowUploadModal, documentToDelete, documentToDeleteData, handleDeleteDocument, 
  confirmDeleteDocument, cancelDeleteDocument, getDocumentTypeName, getStatusBadge, getDocumentStatus, handleUploadDocument,
  showManageTeamModal, setShowManageTeamModal, handleManageTeam,
  selectedTeam, setSelectedTeam, selectedMembersForAssignment, setSelectedMembersForAssignment, handleAssignMembers,
  showViewPlayersModal, setShowViewPlayersModal, handleSuspend, handleUnsuspend }: { 
  club: Club; 
  members: Member[];
  documents: Document[];
  teams: Team[];
  onEdit?: () => void; 
  onDelete?: () => void; 
  onBack?: () => void;
  showUploadModal: boolean;
  setShowUploadModal: (show: boolean) => void;
  documentToDelete: string | null;
  documentToDeleteData: Document | undefined;
  handleDeleteDocument: (docId: string) => void;
  confirmDeleteDocument: () => void;
  cancelDeleteDocument: () => void;
  getDocumentTypeName: (type: string) => string;
  getStatusBadge: (status: string) => React.ReactElement;
  getDocumentStatus: (doc: Document) => string;
  handleUploadDocument: (docData: any) => void;
  showManageTeamModal: boolean;
  setShowManageTeamModal: (show: boolean) => void;
  handleManageTeam: (teamId: string) => void;
  selectedTeam: string | null;
  setSelectedTeam: (teamId: string | null) => void;
  selectedMembersForAssignment: string[];
  setSelectedMembersForAssignment: (memberIds: string[]) => void;
  handleAssignMembers: () => void;
  showViewPlayersModal: boolean;
  setShowViewPlayersModal: (show: boolean) => void;
  handleSuspend: () => void;
  handleUnsuspend: () => void;
}) => {
  const [activeTab, setActiveTab] = React.useState("general");
  const [photoErrorById, setPhotoErrorById] = React.useState<Record<string, boolean>>({});
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  
  // Calculate selected team data and members
  const selectedTeamData = teams.find(t => t.id === selectedTeam) || null;
  const getMemberFirstName = (member: Member) => member.firstName || member.first_name || "";
  const getMemberLastName = (member: Member) => member.lastName || member.last_name || "";
  const getMemberLicenseNumber = (member: Member) => member.licenseNumber || member.license_number || "";
  const getMemberTeamId = (member: Member) => member.teamId || member.team_id;
  const getTeamCategoryText = (team: Team) => `${team.category ?? ""} ${team.name ?? ""}`.toLowerCase();
  const isSeniorTeam = (team: Team) => getTeamCategoryText(team).includes("senior");
  const getTeamGenderSort = (team: Team) => {
    if (team.gender === "male") return 0;
    if (team.gender === "female") return 1;
    if (team.gender === "mixed") return 2;
    return 3;
  };
  const getTeamCategoryWeight = (team: Team) => {
    const categoryText = getTeamCategoryText(team);
    const match = categoryText.match(/\d+/);
    if (match) return Number(match[0]);
    return 0;
  };
  const getTeamGenderLabel = (gender?: string | null) => {
    if (!gender) return "Genre non défini";
    if (gender === "male") return "Masculine";
    if (gender === "female") return "Féminine";
    if (gender === "mixed") return "Mixte";
    return gender;
  };

  const teamMembers = selectedTeamData
    ? members.filter(member => getMemberTeamId(member) === selectedTeamData.id)
    : [];
  const membersByTeamId = new Map<string, Member[]>();
  members.forEach((member) => {
    const teamId = getMemberTeamId(member);
    if (!teamId) return;
    if (!membersByTeamId.has(teamId)) {
      membersByTeamId.set(teamId, []);
    }
    membersByTeamId.get(teamId)!.push(member);
  });
  const membersWithoutTeam = members.filter((member) => !getMemberTeamId(member));
  const sortedTeams = [...teams].sort((a, b) => {
    const aIsSenior = isSeniorTeam(a);
    const bIsSenior = isSeniorTeam(b);
    if (aIsSenior && bIsSenior) {
      const genderOrder = getTeamGenderSort(a) - getTeamGenderSort(b);
      if (genderOrder !== 0) return genderOrder;
      return a.name.localeCompare(b.name, "fr");
    }
    if (aIsSenior) return -1;
    if (bIsSenior) return 1;
    const weightDiff = getTeamCategoryWeight(b) - getTeamCategoryWeight(a);
    if (weightDiff !== 0) return weightDiff;
    const genderOrder = getTeamGenderSort(a) - getTeamGenderSort(b);
    if (genderOrder !== 0) return genderOrder;
    return a.name.localeCompare(b.name, "fr");
  });
  
  const TABS = [
    { id: "general", label: "Informations", icon: Building2 },
    { id: "contacts", label: "Contacts", icon: Users },
    { id: "financial", label: "Finances", icon: CreditCard },
    { id: "teams", label: "Équipes", icon: Users2 },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "system", label: "Système", icon: Settings },
  ];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Non spécifié";
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR');
    } catch {
      return "Date invalide";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex flex-col gap-4">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la liste
              </button>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {club.logoDocumentId ? (
                    <img 
                      src={`http://localhost:3001/documents/view?id=${club.logoDocumentId}`}
                      alt={`${club.name} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400 bg-gray-100';
                        fallbackDiv.textContent = club.acronym?.substring(0, 2) || club.name.substring(0, 2);
                        target.parentNode?.appendChild(fallbackDiv);
                      }}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-400">
                      {club.acronym?.substring(0, 2) || club.name.substring(0, 2)}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{club.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{club.city}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                      club.status === 'active' ? 'bg-green-100 text-green-700' :
                      club.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      club.status === 'suspended' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {club.status === 'active' ? 'Actif' :
                       club.status === 'pending' ? 'En attente' :
                       club.status === 'suspended' ? 'Suspendu' : 'Archivé'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </button>
              
              {club.status !== 'suspended' ? (
                <button
                  onClick={handleSuspend}
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 shadow-sm transition-colors border border-orange-200"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Suspendre
                </button>
              ) : (
                <button
                  onClick={handleUnsuspend}
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 shadow-sm transition-colors border border-green-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Réactiver
                </button>
              )}
              
              <button
                onClick={onDelete}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 shadow-sm transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all border ${
                  isActive
                    ? "bg-brand-50 text-brand-700 border-brand-100 shadow-sm"
                    : "text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isActive ? "bg-white text-brand-600" : "bg-gray-50 text-gray-500"
                }`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "general" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">Identité</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">N° agrément</p>
                <p className="font-medium text-gray-900">{club.federalRegistrationNumber || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Saison</p>
                <p className="font-medium text-gray-900">{club.referenceSeason || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Date de création</p>
                <p className="font-medium text-gray-900">{formatDate(club.establishmentDate)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Type</p>
                <p className="font-medium text-gray-900">{club.type === "club" ? "Club" : "Équipe nationale"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">Adresse</p>
                <p className="font-medium text-gray-900">{club.fullAddress || "—"}</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Coordonnées</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{club.city || "—"}{club.region ? `, ${club.region}` : ""}</span>
                </div>
                <div className="text-sm text-gray-700">{club.primaryPhone || "—"}</div>
                <div className="text-sm text-gray-700">{club.officialEmail || "—"}</div>
                {club.website ? (
                  <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-600 hover:underline">
                    {club.website}
                  </a>
                ) : (
                  <span className="text-sm text-gray-500">Site web —</span>
                )}
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Couleurs du club</h3>
              {club.clubColors ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Primaire:</span>
                    <div className="h-8 w-8 rounded border border-gray-200" style={{ backgroundColor: club.clubColors.primary || "#000000" }} />
                    <span className="text-xs font-mono text-gray-500">{club.clubColors.primary || "—"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Secondaire:</span>
                    <div className="h-8 w-8 rounded border border-gray-200" style={{ backgroundColor: club.clubColors.secondary || "#FFFFFF" }} />
                    <span className="text-xs font-mono text-gray-500">{club.clubColors.secondary || "—"}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucune couleur renseignée</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "contacts" && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Responsables du club</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Président", name: club.presidentName },
              { label: "Secrétaire Général", name: club.secretaryGeneralName },
              { label: "Trésorier", name: club.treasurerName },
            ].map((contact) => contact.name && (
              <div key={contact.label} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{contact.label}</p>
                <p className="font-semibold text-gray-900">{contact.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "financial" && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Coordonnées bancaires</h3>
          <p className="text-sm text-gray-700">{club.ribIban || "—"}</p>
        </div>
      )}

      {activeTab === "teams" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Équipes ({teams.length})</h2>
              <p className="text-gray-600 mt-1">Affectation des joueurs aux équipes du club</p>
            </div>
          </div>

          {teams.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune équipe</h3>
              <p className="text-gray-600">Les équipes sont créées automatiquement à la création du club.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTeams.map((team) => {
                const teamMembers = membersByTeamId.get(team.id) || [];
                return (
                  <div key={team.id} className="border border-gray-200 rounded-xl p-4 bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-base font-semibold text-gray-900">{team.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {team.category || "Catégorie non définie"} · {getTeamGenderLabel(team.gender)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-semibold text-gray-600 bg-gray-100 rounded-full px-2.5 py-1">
                          {teamMembers.length} membre{teamMembers.length > 1 ? "s" : ""}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTeam(team.id);
                            setShowViewPlayersModal(true);
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Voir joueurs
                        </button>
                        <button
                          onClick={() => handleManageTeam(team.id)}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          Affecter
                        </button>
                      </div>
                    </div>
                    {teamMembers.length === 0 ? (
                      <div className="mt-3 text-sm text-gray-500">Aucun membre affecté</div>
                    ) : (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                        {teamMembers.map((member) => (
                          <Link
                            key={member.id}
                            href={`/modules/membres/${member.id}`}
                            className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 hover:bg-gray-100 transition-colors"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-gray-800 uppercase truncate">
                                {getMemberLastName(member)}
                              </div>
                              <div className="text-xs text-gray-500 capitalize truncate">
                                {getMemberFirstName(member)}
                              </div>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {getMemberLicenseNumber(member) || "—"}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {membersWithoutTeam.length > 0 && (
                <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold text-gray-700">Sans équipe</div>
                    <div className="text-xs font-semibold text-gray-600 bg-gray-100 rounded-full px-2.5 py-1">
                      {membersWithoutTeam.length} membre{membersWithoutTeam.length > 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    {membersWithoutTeam.map((member) => (
                      <Link
                        key={member.id}
                        href={`/modules/membres/${member.id}`}
                        className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-gray-800 uppercase truncate">
                            {getMemberLastName(member)}
                          </div>
                          <div className="text-xs text-gray-500 capitalize truncate">
                            {getMemberFirstName(member)}
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {getMemberLicenseNumber(member) || "—"}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-6">
          {/* Header with Upload Button */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Documents du Club</h2>
              <p className="text-gray-600 mt-1">Gérez les documents administratifs et légaux du club</p>
            </div>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2"
            >
              <span>+</span>
              Ajouter un document
            </button>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg truncate">{doc.originalName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{getDocumentTypeName(doc.type)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {getStatusBadge(getDocumentStatus(doc))}
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Taille:</span>
                      <span className="font-medium">{(doc.size / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">{formatDate(doc.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                    <a
                      href={`http://localhost:3001/documents/view?id=${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:text-brand-800 text-sm font-medium px-3 py-1 rounded hover:bg-brand-50 transition-colors"
                    >
                      Télécharger
                    </a>
                    <button 
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {documents.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun document</h3>
              <p className="text-gray-600 mb-6">Commencez par ajouter des documents administratifs pour votre club</p>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                Ajouter un document
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "system" && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Informations système</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Créé le</p>
              <p className="font-medium text-gray-900">{formatDate(club.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Mis à jour</p>
              <p className="font-medium text-gray-900">{formatDate(club.updatedAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Créé par</p>
              <p className="font-medium text-gray-900">{club.createdBy || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Modifié par</p>
              <p className="font-medium text-gray-900">{club.updatedBy || "—"}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Document Upload Modal */}
      {showUploadModal && (
        <DocumentUploadModal 
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadDocument}
        />
      )}
      
      {/* Team Management Modal */}
      {showManageTeamModal && selectedTeamData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Gérer l'équipe: {selectedTeamData.name}</h3>
                <button 
                  onClick={() => {
                    setShowManageTeamModal(false);
                    setSelectedTeam(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informations de l'équipe</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Nom</p>
                        <p className="font-medium">{selectedTeamData.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Catégorie</p>
                        <p className="font-medium">{selectedTeamData.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Genre</p>
                        <p className="font-medium">
                          {selectedTeamData.gender === 'male' ? 'Masculine' : 
                           selectedTeamData.gender === 'female' ? 'Féminine' : 'Mixte'}
                        </p>
                      </div>
                      {selectedTeamData.description && (
                        <div>
                          <p className="text-sm text-gray-500">Description</p>
                          <p className="font-medium">{selectedTeamData.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Membres de l'équipe</h4>
                      {selectedMembersForAssignment.length > 0 && (
                        <button
                          onClick={handleAssignMembers}
                          className="px-3 py-1 bg-brand-500 text-white text-sm rounded-lg hover:bg-brand-600 transition-colors"
                        >
                          Assigner ({selectedMembersForAssignment.length})
                        </button>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                      {teamMembers.length > 0 ? (
                        <div className="space-y-2">
                          {teamMembers.map((member) => (
                            <div key={member.id} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-medium">
                                {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{member.firstName} {member.lastName}</p>
                                <p className="text-xs text-gray-500">{member.email || 'Pas d\'email'}</p>
                              </div>
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                Assigné
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">Aucun membre dans cette équipe</p>
                      )}
                    </div>
                    
                    {/* Available members for assignment */}
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">Membres du club disponibles</h5>
                      <div className="bg-white border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                        {members.filter(m => m.teamId !== selectedTeam).length > 0 ? (
                          <div className="space-y-2">
                            {members
                              .filter(m => m.teamId !== selectedTeam)
                              .map((member) => (
                                <label key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedMembersForAssignment.includes(member.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedMembersForAssignment([...selectedMembersForAssignment, member.id]);
                                      } else {
                                        setSelectedMembersForAssignment(selectedMembersForAssignment.filter(id => id !== member.id));
                                      }
                                    }}
                                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                  />
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-medium">
                                      {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{member.firstName} {member.lastName}</p>
                                      <p className="text-xs text-gray-500">{member.email || 'Pas d\'email'}</p>
                                    </div>
                                  </div>
                                </label>
                              ))
                            }
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-2">Tous les membres sont déjà assignés</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowManageTeamModal(false);
                      setSelectedTeam(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* View Players Modal */}
      {showViewPlayersModal && selectedTeamData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Joueurs de l'équipe: {selectedTeamData.name}</h3>
                <button 
                  onClick={() => {
                    setShowViewPlayersModal(false);
                    setSelectedTeam(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {teamMembers.length > 0 ? (
                  <div className="space-y-3">
                    {teamMembers.map((member) => {
                      const photoId = member.profilePhotoId ?? member.profile_photo_id;
                      const showPhoto = Boolean(photoId) && !photoErrorById[member.id];
                      return (
                      <div key={member.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-800 font-semibold overflow-hidden">
                          {showPhoto ? (
                            <img
                              src={`${apiUrl}/documents/view?id=${photoId}`}
                              alt={`${member.firstName} ${member.lastName}`}
                              className="w-full h-full object-cover"
                              onError={() => {
                                setPhotoErrorById((prev) => ({ ...prev, [member.id]: true }));
                              }}
                            />
                          ) : (
                            <span>{member.firstName?.charAt(0)}{member.lastName?.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{member.firstName} {member.lastName}</h4>
                          <p className="text-sm text-gray-600">{member.email || 'Pas d\'email'}</p>
                          {member.phone && (
                            <p className="text-sm text-gray-600">{member.phone}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Assigné
                          </span>
                          <div className="mt-2">
                            <Link
                              href={`/modules/membres/${member.id}`}
                              className="text-brand-600 hover:text-brand-800 text-xs font-medium"
                            >
                              Voir le profil
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">👥</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Aucun joueur</h4>
                    <p className="text-gray-600">Cette équipe n'a pas encore de joueurs assignés</p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Total: {teamMembers.length} joueur{teamMembers.length !== 1 ? 's' : ''}</span>
                    <button
                      onClick={() => {
                        setShowViewPlayersModal(false);
                        setSelectedTeam(null);
                        // Optionally open full management modal
                        setTimeout(() => {
                          setSelectedTeam(selectedTeamData.id);
                          setShowManageTeamModal(true);
                        }, 300);
                      }}
                      className="text-brand-600 hover:text-brand-800 font-medium"
                    >
                      Gérer l'équipe →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Document Delete Confirmation Modal */}
      {documentToDeleteData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Supprimer le document</h3>
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir supprimer le document <span className="font-semibold">"{documentToDeleteData.originalName}"</span> ?
                  <br /><br />
                  <span className="text-sm text-red-600 font-medium">Cette action est irréversible.</span>
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={cancelDeleteDocument}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmDeleteDocument}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  category?: string;
  licenseStatus?: string;
  licenseNumber?: string;
  license_number?: string;
  teamId?: string;
  team_id?: string;
  profilePhotoId?: string | null;
  profile_photo_id?: string | null;
};

type Document = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

type Team = {
  id: string;
  name: string;
  category: string;
  gender: string;
  description?: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
};

// Error handler for missing club
const handleMissingClub = (id: string) => {
  console.error(`Club with ID ${id} not found`);
  return null;
};

export default function ClubDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clubId = params.id as string;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const apiFetch = (path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return fetch(`${apiUrl}${path}`, {
      ...options,
      credentials: "include",
      headers,
    });
  };

  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Document management state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  
  // Team management state
  const [showManageTeamModal, setShowManageTeamModal] = useState(false);
  const [showViewPlayersModal, setShowViewPlayersModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedMembersForAssignment, setSelectedMembersForAssignment] = useState<string[]>([]);
  
  // Document management handlers
  const handleUploadDocument = async (docData: any) => {
    try {
      // Upload the file - this automatically creates the document record
      const formData = new FormData();
      formData.append('file', docData.file);
      formData.append('type', docData.type);
      formData.append('description', docData.description || docData.name || '');
      formData.append('orgId', clubId);
      
      const uploadResponse = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Failed to upload document: ${errorText}`);
      }
      
      const newDocument = await uploadResponse.json();
      setDocuments([...documents, newDocument]);
      alert('Document ajouté avec succès!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Erreur lors de l\'ajout du document');
    }
  };
  
  const handleDeleteDocument = async (docId: string) => {
    try {
      const response = await apiFetch(`/documents/${docId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      setDocumentToDelete(docId);
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Erreur lors de la suppression du document');
    }
  };
  
  const confirmDeleteDocument = () => {
    if (documentToDelete) {
      setDocuments(documents.filter(doc => doc.id !== documentToDelete));
      setDocumentToDelete(null);
      alert('Document supprimé avec succès!');
    }
  };
  
  const cancelDeleteDocument = () => {
    setDocumentToDelete(null);
  };
  
  const getDocumentTypeName = (type: string) => {
    const types: Record<string, string> = {
      'statutes': 'Statuts du club',
      'legal_receipt': 'Recepisse legal',
      'bank_certificate': 'Attestation bancaire',
      'insurance': 'Assurance du club',
      'ag_pv': 'PV d\'Assemblee Generale',
      'other': 'Autre document',
      'photo': 'Photo',
      'id_card': 'Carte d\'identité',
      'medical_certificate': 'Certificat médical',
      'contract': 'Contrat'
    };
    return types[type] || type;
  };
  
  // Helper function to determine document status
  const getDocumentStatus = (doc: Document): string => {
    // For now, all uploaded documents are considered approved
    // In a real implementation, this would come from document approval workflow
    return 'approved';
  };
  
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, {label: string, color: string}> = {
      'approved': { label: 'Approuvé', color: 'bg-green-100 text-green-800' },
      'pending': { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      'rejected': { label: 'Rejeté', color: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status] || statusConfig['pending'];
    return <span className={`px-2 py-1 text-xs rounded-full font-medium ${config.color}`}>
      {config.label}
    </span>;
  };
  
  // Team management handlers
  const handleManageTeam = (teamId: string) => {
    setSelectedTeam(teamId);
    setShowManageTeamModal(true);
  };

  const handleAssignMembers = async () => {
    if (!selectedTeam || selectedMembersForAssignment.length === 0) return;
    
    try {
      // For each selected member, update their teamId
      const updatePromises = selectedMembersForAssignment.map(memberId =>
        apiFetch(`/members/${memberId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            teamId: selectedTeam
          }),
        })
      );
      
      await Promise.all(updatePromises);
      
      // Refresh members data
      const membersRes = await apiFetch(`/orgs/${clubId}/members`);
      if (membersRes.ok) {
        const updatedMembers = await membersRes.json();
        setMembers(updatedMembers);
      }
      
      setSelectedMembersForAssignment([]);
      alert(`${selectedMembersForAssignment.length} membre(s) assigné(s) avec succès!`);
    } catch (error) {
      console.error('Error assigning members:', error);
      alert('Erreur lors de l\'assignation des membres');
    }
  };

  const handleSuspend = async () => {
    const reason = prompt('Motif de suspension (optionnel):');
    if (reason === null) return; // User cancelled
    
    try {
      const response = await apiFetch(`/orgs/${clubId}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason || undefined }),
      });

      if (!response.ok) {
        throw new Error('Failed to suspend club');
      }

      const updatedClub = await response.json();
      setClub(updatedClub);
      alert('Club suspendu avec succès!');
    } catch (error) {
      console.error('Error suspending club:', error);
      alert('Erreur lors de la suspension du club');
    }
  };

  const handleUnsuspend = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réactiver ce club ?')) return;
    
    try {
      const response = await apiFetch(`/orgs/${clubId}/unsuspend`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to unsuspend club');
      }

      const updatedClub = await response.json();
      setClub(updatedClub);
      alert('Club réactivé avec succès!');
    } catch (error) {
      console.error('Error unsuspending club:', error);
      alert('Erreur lors de la réactivation du club');
    }
  };

  const selectedTeamData = teams.find(t => t.id === selectedTeam) || null;
  
  // Document management variables
  const documentToDeleteData = documentToDelete ? documents.find(d => d.id === documentToDelete) : null;

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch club data
        const clubRes = await apiFetch(`/orgs/${clubId}`);
        if (!clubRes.ok) {
          if (clubRes.status === 404) {
            setError("Club non trouvé");
            return;
          }
          throw new Error("Failed to fetch club data");
        }
        const clubData = await clubRes.json();
        setClub(clubData);

        // Fetch members
        const membersRes = await apiFetch(`/orgs/${clubId}/members`);
        let fetchedMembers: Member[] = [];
        if (membersRes.ok) {
          fetchedMembers = await membersRes.json();
          setMembers(fetchedMembers);
        }

        // Fetch documents
        const documentsRes = await apiFetch(`/orgs/${clubId}/documents`);
        if (documentsRes.ok) {
          const documentsData = await documentsRes.json();
          setDocuments(documentsData);
        }

        // Fetch teams
        const teamsRes = await apiFetch(`/teams?orgId=${clubId}`);
        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          setTeams(teamsData);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    }

    if (clubId) {
      fetchData();
    }
  }, [clubId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || "Club non trouvé"}</p>
          <button
            onClick={() => router.push("/dashboard/federation/clubs")}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            Retour aux clubs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClubProfileView 
        club={club} 
        members={members}
        documents={documents}
        teams={teams}
        showUploadModal={showUploadModal}
        setShowUploadModal={setShowUploadModal}
        showManageTeamModal={showManageTeamModal}
        setShowManageTeamModal={setShowManageTeamModal}
        handleManageTeam={handleManageTeam}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        selectedMembersForAssignment={selectedMembersForAssignment}
        setSelectedMembersForAssignment={setSelectedMembersForAssignment}
        handleAssignMembers={handleAssignMembers}
        showViewPlayersModal={showViewPlayersModal}
        setShowViewPlayersModal={setShowViewPlayersModal}
        documentToDelete={documentToDelete}
        documentToDeleteData={documentToDeleteData || undefined}
        handleDeleteDocument={handleDeleteDocument}
        confirmDeleteDocument={confirmDeleteDocument}
        cancelDeleteDocument={cancelDeleteDocument}
        getDocumentTypeName={getDocumentTypeName}
        getStatusBadge={getStatusBadge}
        getDocumentStatus={getDocumentStatus}
        handleUploadDocument={handleUploadDocument}
        handleSuspend={handleSuspend}
        handleUnsuspend={handleUnsuspend}
        onBack={() => router.push("/dashboard/federation/clubs")}
        onEdit={() => router.push(`/dashboard/federation/clubs/${club.id}/edit`)}
        onDelete={async () => {
          if (confirm(`Êtes-vous sûr de vouloir supprimer le club "${club.name}" ? Cette action est irréversible.`)) {
            try {
              const res = await fetch(`/api/orgs/${club.id}`, {
                method: 'DELETE',
              });
              
              if (res.ok) {
                alert('Club supprimé avec succès');
                router.push("/dashboard/federation/clubs");
              } else {
                const error = await res.text();
                alert(error || "Erreur lors de la suppression du club");
              }
            } catch (error) {
              console.error('Error deleting club:', error);
              alert('Erreur lors de la suppression du club');
            }
          }
        }}
      />
    </div>
  );
}
