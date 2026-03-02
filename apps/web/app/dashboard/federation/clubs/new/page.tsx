"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ClubForm, { ClubFormData } from "../../../../../components/orgs/club-form";

export default function NewClubPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        // Check authentication first
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          if (meRes.status === 401) {
            router.push("/");
            return;
          }
          throw new Error("Failed to fetch user data");
        }
        const meData = await meRes.json();
        setUser(meData);

        // Fetch disciplines
        const res = await fetch("/api/settings/disciplines");
        if (res.ok) {
          setDisciplines(await res.json());
        }
      } catch (err) {
        console.error("Error:", err);
        router.push("/");
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  const handleSubmit = async (data: ClubFormData) => {
    setIsLoading(true);
    try {
      const clubData = { ...data };
      
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clubData),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Erreur lors de la création du club");
      }

      const result = await res.json();
      
      // API returns the created org directly, not wrapped in { org: ... }
      const createdOrg = result;
      
      setSuccessMessage(`Club "${createdOrg.name}" créé avec succès !`);

      // Rediriger vers la page du club après 3 secondes
      setTimeout(() => {
        router.push(`/dashboard/federation/clubs/${createdOrg.id}`);
      }, 3000);

    } catch (error) {
      console.error("Erreur:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de la création du club");
    } finally {
      setIsLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Club créé avec succès !
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{successMessage}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Redirection vers la page du club dans quelques secondes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClubForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      isEditing={false}
      disciplines={disciplines}
    />
  );
}
