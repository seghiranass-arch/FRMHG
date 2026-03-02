"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import MemberForm, { MemberFormData } from "../../../../../components/members/member-form";
import { Plus } from "lucide-react";

type Club = {
  id: string;
  name: string;
};

type Season = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

export default function NouveauJoueurPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [clubs, setClubs] = React.useState<Club[]>([]);
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [disciplines, setDisciplines] = React.useState<any[]>([]);
  const [subscriptionTypes, setSubscriptionTypes] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch data on mount
  React.useEffect(() => {
    async function fetchData() {
      try {
        // Fetch clubs
        const clubsRes = await fetch("http://localhost:3001/orgs");
        if (clubsRes.ok) {
          const clubsData = await clubsRes.json();
          setClubs(clubsData.map((c: any) => ({ id: c.id, name: c.name })));
        }

        // Fetch seasons
        const seasonsRes = await fetch("http://localhost:3001/licensing/seasons");
        if (seasonsRes.ok) {
          const seasonsData = await seasonsRes.json();
          setSeasons(seasonsData.map((s: any) => ({
            id: s.id,
            code: s.code,
            name: s.name,
            isActive: s.is_active || s.isActive
          })));
        }

        // Fetch disciplines
        const disciplinesRes = await fetch("http://localhost:3001/settings/disciplines");
        if (disciplinesRes.ok) {
          setDisciplines(await disciplinesRes.json());
        }

        // Fetch subscription types
        const subscriptionsRes = await fetch("http://localhost:3001/settings/subscriptions");
        if (subscriptionsRes.ok) {
          setSubscriptionTypes(await subscriptionsRes.json());
        }

        // Fetch categories
        const categoriesRes = await fetch("http://localhost:3001/settings/categories");
        if (categoriesRes.ok) {
          setCategories(await categoriesRes.json());
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (data: MemberFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text || "Erreur lors de la création du joueur");
        return;
      }

      const createdMember = await res.json();
      return createdMember;
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadDocument = async (file: File, documentType: string) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3001/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("Document upload failed");
      }
    } catch (err) {
      console.error("Error uploading document:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Nouveau Joueur de Club</h1>
              <p className="text-sm text-gray-500">
                Créer un nouveau profil de joueur affilié à un club
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Plus className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-800">Joueur de Club</h3>
            <p className="text-sm text-blue-700 mt-1">
              Un joueur de club est un membre affilié à un club spécifique. Il bénéficie des licences 
              et abonnements gérés par son club et participe aux équipes du club.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Form - Pre-filled with club_player status */}
      <MemberForm
        onSubmit={handleSubmit}
        onUploadDocument={handleUploadDocument}
        isLoading={isLoading}
        isEditing={false}
        clubs={clubs}
        seasons={seasons}
        disciplines={disciplines}
        subscriptionTypes={subscriptionTypes}
        categories={categories}
        initialData={{ memberStatus: "club_player", licenseStatus: "pending_approval", licenseType: "player" }} // Force club_player status
        hideMemberStatusSelection={true} // Hide member status selection
        hiddenTabs={["subscription", "documents", "license"]} // Hide specified tabs for joueur
        hiddenSportsFields={["jerseyNumber"]} // Hide sports fields for joueur
      />
    </div>
  );
}
