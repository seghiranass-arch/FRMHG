"use client";

import * as React from "react";
import Link from "next/link";
import { UnifiedTable } from "../ui/unified-table";
import { Building, MapPin, Phone, Mail, User, Calendar } from "lucide-react";

type OrgStatus = "pending" | "active" | "suspended" | "archived";

interface Club {
  id: string;
  name: string;
  acronym?: string;
  type: "club" | "national_team";
  status: OrgStatus;
  region?: string;
  city?: string;
  primary_phone?: string;
  official_email?: string;
  president_name?: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  logo_document_id?: string;
}

interface ClubListProps {
  clubs: Club[];
  onActivate: (clubId: string) => Promise<void>;
  onArchive: (clubId: string) => Promise<void>;
  onDelete: (clubId: string) => Promise<void>;
  isFederationAdmin: boolean;
}

const STATUS_LABELS = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  active: { label: "Actif", color: "bg-green-100 text-green-800" },
  suspended: { label: "Suspendu", color: "bg-red-100 text-red-800" },
  archived: { label: "Archivé", color: "bg-gray-100 text-gray-800" },
};

export function ClubList({ clubs, onActivate, onArchive, onDelete, isFederationAdmin }: ClubListProps) {
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const handleActivate = async (clubId: string) => {
    setActionLoading(clubId);
    try {
      await onActivate(clubId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (clubId: string) => {
    if (confirm("Êtes-vous sûr de vouloir archiver ce club ?")) {
      setActionLoading(clubId);
      try {
        await onArchive(clubId);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleDelete = async (clubId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement ce club ? Cette action est irréversible.")) {
      setActionLoading(clubId);
      try {
        await onDelete(clubId);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Define table columns
  const columns = [
    {
      key: "logo",
      title: "Logo",
      render: (_: any, row: Club) => {
        const logoId = row.logo_document_id ?? (row as any).logoDocumentId;
        return logoId ? (
          <img 
            src={`/api/documents/view?id=${logoId}`} 
            alt={`${row.name} logo`} 
            className="w-10 h-10 object-contain rounded"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const nextElement = target.nextElementSibling;
              if (nextElement && nextElement.nodeType === Node.ELEMENT_NODE) {
                (nextElement as HTMLElement).style.display = 'block';
              }
            }}
          />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
            <Building className="w-5 h-5 text-gray-400" />
          </div>
        );
      }
    },
    {
      key: "name",
      title: "Club",
      sortable: true,
      render: (_: any, row: Club) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.name}
            {row.acronym && (
              <span className="ml-2 text-xs text-gray-500">({row.acronym})</span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {row.type === "club" ? "Club" : "Équipe nationale"}
          </div>
          {row.president_name && (
            <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <User className="w-3 h-3" />
              Prés: {row.president_name}
            </div>
          )}
        </div>
      )
    },
    {
      key: "location",
      title: "Localisation",
      sortable: true,
      render: (_: any, row: Club) => (
        <div className="flex items-center gap-1 text-sm text-gray-900">
          <MapPin className="w-4 h-4 text-gray-400" />
          {row.city && row.region ? `${row.city}, ${row.region}` : "Non spécifié"}
        </div>
      )
    },
    {
      key: "contact",
      title: "Contact",
      render: (_: any, row: Club) => (
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-900">
            <Phone className="w-4 h-4 text-gray-400" />
            {row.primary_phone || "—"}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <Mail className="w-4 h-4 text-gray-400" />
            {row.official_email || "—"}
          </div>
        </div>
      )
    },
    {
      key: "status",
      title: "Statut",
      sortable: true,
      render: (_: any, row: Club) => (
        <div>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_LABELS[row.status].color}`}>
            {STATUS_LABELS[row.status].label}
          </span>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Créé: {formatDate(row.created_at)}
          </div>
        </div>
      )
    }
  ];

  // Define actions
  const actions = [
    {
      label: "Voir",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
      onClick: (row: Club) => window.location.href = `/dashboard/federation/clubs/${row.id}`,
      variant: "primary" as const
    },
    ...(isFederationAdmin ? [
      {
        label: "Modifier",
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
        onClick: (row: Club) => window.location.href = `/dashboard/federation/clubs/${row.id}/edit`,
        variant: "secondary" as const
      },
      ...(clubs.filter(c => c.status === "pending").length > 0 ? [{
        label: "Activer",
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        onClick: (row: Club) => handleActivate(row.id),
        variant: "primary" as const,
        condition: (row: Club) => row.status === "pending"
      }] : []),
      ...(clubs.filter(c => !c.archived && c.status !== "pending").length > 0 ? [{
        label: "Archiver",
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
        onClick: (row: Club) => handleArchive(row.id),
        variant: "secondary" as const,
        condition: (row: Club) => !row.archived && row.status !== "pending"
      }] : []),
      {
        label: "Supprimer",
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
        onClick: (row: Club) => handleDelete(row.id),
        variant: "danger" as const
      }
    ] : [])
  ];

  return (
    <UnifiedTable
      data={clubs}
      columns={columns}
      actions={actions}
      title="Clubs"
      subtitle={`${clubs.length} club${clubs.length > 1 ? 's' : ''}`}
      searchable={true}
      refreshable={true}
      emptyState={{
        title: "Aucun club",
        description: "Commencez par créer votre premier club.",
        icon: <Building className="w-8 h-8 text-gray-400" />
      }}
      containerClassName=""
      onRowClick={(row: Club) => window.location.href = `/dashboard/federation/clubs/${row.id}`}
      defaultSort={{ key: "name", direction: "asc" }}
    />
  );
}



