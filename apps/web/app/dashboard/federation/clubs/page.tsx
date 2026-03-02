"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Building2, Users, MapPin, Phone, Mail, CheckCircle, Clock, XCircle, Edit, Trash2, Eye } from "lucide-react";

type Club = {
  id: string;
  name: string;
  acronym?: string;
  type: "club" | "national_team";
  status: "pending" | "active" | "suspended" | "archived";
  region?: string;
  city?: string;
  primaryPhone?: string;
  officialEmail?: string;
  presidentName?: string;
  logoDocumentId?: string;
  logoUrl?: string;
  _count?: { members: number };
  createdAt?: string;
};

type Action = {
  label: string;
  icon: React.ReactNode;
  onClick: (club: Club) => void;
  variant: "primary" | "secondary" | "danger";
  condition?: (club: Club) => boolean;
};

const STATUS_CONFIG = {
  active: { label: "Actif", color: "bg-green-100 text-green-700", icon: CheckCircle },
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  suspended: { label: "Suspendu", color: "bg-red-100 text-red-700", icon: XCircle },
  archived: { label: "Archivé", color: "bg-gray-100 text-gray-600", icon: XCircle },
};

// Empty array for error handling
const EMPTY_CLUBS: Club[] = [];

export default function ClubsListPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchClubs() {
      try {
        const res = await fetch("/api/orgs");
        if (res.ok) {
          const data = await res.json();
          const clubsWithData = data.map((club: any) => ({
            ...club,
            logoUrl: club.logoDocumentId ? `/api/documents/view?id=${club.logoDocumentId}` : undefined,
          }));
          setClubs(clubsWithData);
        } else {
          console.error("API unavailable, showing error state");
          setError("Impossible de charger les clubs");
          setClubs(EMPTY_CLUBS);
        }
      } catch (err) {
        console.error("API error:", err);
        setError("Erreur de connexion au serveur");
        setClubs(EMPTY_CLUBS);
      } finally {
        setIsLoading(false);
      }
    }
    fetchClubs();
  }, []);

  const filteredClubs = clubs.filter(club => {
    if (filter === "all") return true;
    return club.status === filter;
  });

  const stats = {
    total: clubs.length,
    active: clubs.filter(c => c.status === "active").length,
    suspended: clubs.filter(c => c.status === "suspended").length,
  };

  const handleEdit = (club: Club) => {
    router.push(`/dashboard/federation/clubs/${club.id}/edit`);
  };

  const handleDelete = async (club: Club) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le club "${club.name}" ? Cette action est irréversible.`)) {
      try {
        const res = await fetch(`/api/orgs/${club.id}`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          setClubs(prev => prev.filter(c => c.id !== club.id));
          alert('Club supprimé avec succès');
        } else {
          alert('Erreur lors de la suppression du club');
        }
      } catch (error) {
        console.error('Error deleting club:', error);
        alert('Erreur lors de la suppression du club');
      }
    }
  };

  const actions: Action[] = [
    {
      label: "Modifier",
      icon: <Edit className="w-4 h-4" />,
      onClick: handleEdit,
      variant: "secondary"
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDelete,
      variant: "danger"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement des clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total clubs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-500">Actifs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.suspended}</p>
              <p className="text-sm text-gray-500">Suspendus</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          {["all", "active", "suspended"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === status
                  ? "bg-brand-500 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {status === "all" ? "Tous" : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label}
            </button>
          ))}
        </div>
        <Link
          href="/dashboard/federation/clubs/new"
          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau club
        </Link>
      </div>

      {/* Clubs Grid */}
      {filteredClubs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun club trouvé</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClubs.map((club) => {
            const StatusIcon = STATUS_CONFIG[club.status]?.icon || CheckCircle;
            return (
              <div
                key={club.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-brand-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {(club as any).logoUrl ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200">
                        <img 
                          src={(club as any).logoUrl} 
                          alt={`${club.name} logo`} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // If logo fails to load, show fallback
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const fallbackDiv = document.createElement('div');
                              fallbackDiv.className = 'w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-lg';
                              fallbackDiv.textContent = club.acronym?.substring(0, 2) || club.name.substring(0, 2);
                              parent.appendChild(fallbackDiv);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-lg">
                        {club.acronym?.substring(0, 2) || club.name.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                        {club.name}
                      </h3>
                      {club.acronym && (
                        <p className="text-sm text-gray-500">{club.acronym}</p>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_CONFIG[club.status]?.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {STATUS_CONFIG[club.status]?.label}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {club.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{club.city}{club.region ? `, ${club.region}` : ""}</span>
                    </div>
                  )}
                  {club.presidentName && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>Président: {club.presidentName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{club._count?.members || 0} membres</span>
                  </div>
                  {club.createdAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Créé: {new Date(club.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/federation/clubs/${club.id}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Voir
                  </button>
                  {actions.map((action) => (
                    <button
                      key={action.label}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(club);
                      }}
                      className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        action.variant === "primary" 
                          ? "text-white bg-brand-500 hover:bg-brand-600" 
                          : action.variant === "secondary" 
                            ? "text-gray-700 bg-gray-100 hover:bg-gray-200" 
                            : "text-red-600 bg-red-50 hover:bg-red-100"
                      }`}
                      title={action.label}
                    >
                      {action.icon}
                      <span className="sr-only">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
