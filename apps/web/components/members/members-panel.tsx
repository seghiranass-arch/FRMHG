"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UnifiedTable, TableActions } from "../ui/unified-table";
import { Eye, Edit, Trash2, User, Calendar, Trophy, Building } from "lucide-react";

type Member = {
  id: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  sex?: "M" | "F" | null;
  org_id?: string | null;
  org_name?: string | null;
  discipline?: string | null;
  age_category?: string | null;
  ageCategory?: string | null;
  status?: string | null;
  profile_photo_id?: string | null;
  profilePhotoId?: string | null;
  documents?: Array<{
    id: string;
    type?: string | null;
  }>;
};

export function MembersPanel({ initial }: { initial: Member[] }) {
  const [items, setItems] = React.useState(initial);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  async function refresh() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/members", { cache: "no-store" });
      if (res.ok) setItems(await res.json());
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteMember(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible.")) return;
    
    try {
      const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(items.filter(item => item.id !== id));
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (e) {
      alert("Erreur réseau");
    }
  }

  // Fetch on mount if initial is empty
  React.useEffect(() => {
    if (initial.length === 0) {
      refresh();
    }
  }, []);

  const getPhotoUrl = (m: Member) => {
    const photoId =
      m.profile_photo_id ||
      m.profilePhotoId ||
      m.documents?.find(doc => doc.type === "photo")?.id;
    if (!photoId) return null;
    return `/api/documents/view?id=${photoId}`;
  };

  // Define table columns
  const columns = [
    {
      key: "photo",
      title: "Photo",
      render: (_: any, row: Member) => (
        <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-gray-400">
          {getPhotoUrl(row) ? (
            <img src={getPhotoUrl(row)!} alt="" className="h-full w-full object-cover" />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>
      )
    },
    {
      key: "name",
      title: "Nom / Prénom",
      sortable: true,
      render: (_: any, row: Member) => (
        <div>
          <div className="font-semibold text-gray-800 uppercase leading-tight">
            {row.last_name ?? row.lastName ?? ""}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {row.first_name ?? row.firstName ?? ""}
          </div>
        </div>
      )
    },
    {
      key: "discipline",
      title: "Discipline",
      sortable: true,
      render: (_: any, row: Member) => (
        <div>
          <div className="font-medium text-gray-700">{row.discipline || "—"}</div>
          <div className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 inline-block mt-1 font-bold text-gray-600">
            {row.age_category || row.ageCategory || "—"}
          </div>
        </div>
      )
    },
    {
      key: "org_name",
      title: "Organisation",
      sortable: true,
      render: (_: any, row: Member) => (
        <div className="text-xs font-medium text-gray-800">
          {row.org_name || "Adhérent Libre"}
        </div>
      )
    },
    {
      key: "status",
      title: "Statut",
      sortable: true,
      render: (_: any, row: Member) => (
        <div className="text-center">
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
            row.status === 'active' ? 'bg-green-100 text-green-700' : 
            row.status === 'suspended' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {row.status || 'active'}
          </span>
        </div>
      )
    }
  ];

  // Define actions
  const actions = [
    {
      label: "Voir",
      icon: <Eye className="w-4 h-4" />,
      onClick: (row: Member) => router.push(`/modules/membres/${row.id}`),
      variant: "primary" as const
    },
    {
      label: "Modifier", 
      icon: <Edit className="w-4 h-4" />,
      onClick: (row: Member) => router.push(`/modules/membres/${row.id}?edit=1`),
      variant: "secondary" as const
    },
    {
      label: "Supprimer",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row: Member) => deleteMember(row.id),
      variant: "danger" as const
    }
  ];

  return (
    <div className="grid gap-4">
      <UnifiedTable
        data={items}
        columns={columns}
        actions={actions}
        title="Liste des Membres"
        subtitle={`${items.length} membre(s) trouvé(s)`}
        searchable={true}
        refreshable={true}
        onRefresh={refresh}
        loading={isLoading}
        emptyState={{
          title: "Aucun membre trouvé",
          description: isLoading ? "Chargement en cours..." : "Aucun membre trouvé dans le système.",
          icon: <User className="w-8 h-8 text-gray-400" />
        }}
        containerClassName=""
        onRowClick={(row: Member) => router.push(`/modules/membres/${row.id}`)}
        defaultSort={{ key: "last_name", direction: "asc" }}
      />
    </div>
  );
}








