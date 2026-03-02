"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import ClubForm, { ClubFormData, ClubDocument } from "../../../../../../components/orgs/club-form";

type Club = {
  id: string;
  name: string;
  acronym?: string;
  type: "club" | "national_team";
  establishmentDate?: string;
  federalRegistrationNumber?: string;
  referenceSeason?: string;
  region?: string;
  city?: string;
  address?: string;
  fullAddress?: string;
  primaryPhone?: string;
  officialEmail?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  presidentName?: string;
  secretaryGeneralName?: string;
  treasurerName?: string;
  primaryContactName?: string;
  primaryContactPhone?: string;
  activeCategories?: string[];
  practicedDisciplines?: string[];
  clubColors?: {
    primary?: string;
    secondary?: string;
  };
  logoDocumentId?: string;
  ribIban?: string;
  // Validation & statut
  status?: "pending" | "active" | "suspended" | "archived";
  validationDate?: string;
  validatedBy?: string;
  rejectionReason?: string;
  suspensionReason?: string;
  // Champs système
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  archived?: boolean;
};

type Document = {
  id: string;
  document_type: string;
  document_id: string;
  filename?: string;
  description?: string;
  document_date?: string;
  created_at?: string;
};

export default function EditClubPage() {
  const router = useRouter();
  const params = useParams();
  const clubId = params.id as string;

  const [club, setClub] = useState<Club | null>(null);
  const [documents, setDocuments] = useState<ClubDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Fetch club data
      const clubRes = await fetch(`/api/orgs/${clubId}`);
      if (!clubRes.ok) {
        throw new Error("Club non trouvé");
      }
      const clubData = await clubRes.json();
      setClub(clubData);

      // Fetch documents
      try {
        const docsRes = await fetch(`/api/orgs/${clubId}/documents`);
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          // Convert to ClubDocument format
          const formattedDocs: ClubDocument[] = docsData.map((d: Document) => ({
            id: d.id,
            documentType: d.document_type,
            documentId: d.document_id,
            filename: d.filename,
            description: d.description,
            documentDate: d.document_date,
            createdAt: d.created_at,
          }));
          setDocuments(formattedDocs);
        }
      } catch (docsError) {
        console.error('Error fetching documents:', docsError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement du club");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication before fetching data
    const checkAuthAndFetchData = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          if (meRes.status === 401) {
            router.push("/");
            return;
          }
          throw new Error("Failed to fetch user data");
        }
        await fetchData();
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/");
      }
    };

    checkAuthAndFetchData();
  }, [clubId, router]);

  const handleUploadDocument = async (file: File, documentType: string, description?: string, documentDate?: string) => {
    try {
      // Upload the file first
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orgId', clubId);
      if (description) {
        formData.append('description', description);
      }

      const uploadRes = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload file');
      }

      const uploadData = await uploadRes.json();
      const documentId = uploadData.id;

      // Refresh documents list
      await fetchData();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors du téléversement du document');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce document ?')) return;

    try {
      const res = await fetch(`/api/orgs/${clubId}/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete document');
      }

      // Refresh documents list
      await fetchData();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Erreur lors de la suppression du document');
    }
  };

  const handleSubmit = async (data: ClubFormData) => {
    setIsSubmitting(true);
    try {
      // Prepare club data without frontend-only fields
      const clubData: any = { ...data };
      
      // Remove frontend-only fields that don't exist in the database
      delete clubData.activeCategories;
      delete clubData.practicedDisciplines;
      delete clubData.clubColors;
      delete clubData.ribIban;
      delete clubData.secretaryGeneralName;
      delete clubData.treasurerName;
      delete clubData.primaryContactName;
      delete clubData.primaryContactPhone;
      delete (clubData as any).logoFile;
      
      // Extract logo file before cleaning data
      const logoFile = (data as any).logoFile;
      
      // If there's a logo file to upload, handle it separately
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('file', logoFile);
        logoFormData.append('orgId', clubId);
        
        // Upload the logo
        const logoUploadRes = await fetch('/api/documents/upload', {
          method: 'POST',
          body: logoFormData,
        });
        
        if (logoUploadRes.ok) {
          const logoData = await logoUploadRes.json();
          const logoDocumentId = logoData.id;
          
          if (logoDocumentId) {
            // Add the logoDocumentId to the club data
            clubData.logoDocumentId = logoDocumentId;
          }
        } else {
          console.error('Failed to upload logo:', await logoUploadRes.text());
          throw new Error('Échec du téléchargement du logo');
        }
      }
      
      // If logoDocumentId is already provided in the data, use it
      if (data.logoDocumentId) {
        clubData.logoDocumentId = data.logoDocumentId;
      }
      
      const res = await fetch(`/api/orgs/${clubId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clubData),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Erreur lors de la modification du club");
      }

      // Rediriger vers la page du club
      router.push(`/dashboard/federation/clubs/${clubId}`);
    } catch (error) {
      console.error("Erreur:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de la modification du club");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement du club...</p>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erreur de chargement
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || "Club non trouvé"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Convertir les données du club au format du formulaire
  const formData: Partial<ClubFormData> = {
    name: club.name,
    acronym: club.acronym || "",
    type: club.type,
    establishmentDate: club.establishmentDate || "",
    federalRegistrationNumber: club.federalRegistrationNumber || "",
    referenceSeason: club.referenceSeason || "",
    region: club.region || "",
    city: club.city || "",
    fullAddress: club.fullAddress || club.address || "",
    primaryPhone: club.primaryPhone || "",
    officialEmail: club.officialEmail || "",
    website: club.website || "",
    socialMedia: {
      facebook: club.socialMedia?.facebook || "",
      instagram: club.socialMedia?.instagram || "",
      twitter: club.socialMedia?.twitter || "",
      youtube: club.socialMedia?.youtube || "",
    },
    presidentName: club.presidentName || "",
    secretaryGeneralName: club.secretaryGeneralName || "",
    treasurerName: club.treasurerName || "",
    primaryContactName: club.primaryContactName || "",
    primaryContactPhone: club.primaryContactPhone || "",
    activeCategories: club.activeCategories || [],
    practicedDisciplines: club.practicedDisciplines || [],
    clubColors: {
      primary: club.clubColors?.primary || "#000000",
      secondary: club.clubColors?.secondary || "#FFFFFF",
    },
    ribIban: club.ribIban || "",
    logoDocumentId: club.logoDocumentId,
    // Validation & statut
    status: club.status,
    validationDate: club.validationDate,
    validatedBy: club.validatedBy,
    rejectionReason: club.rejectionReason,
    suspensionReason: club.suspensionReason,
    // Champs système
    createdAt: club.createdAt,
    updatedAt: club.updatedAt,
    createdBy: club.createdBy,
    updatedBy: club.updatedBy,
    archived: club.archived,
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Modifier le club</h1>
        <p className="mt-1 text-sm text-gray-500">
          Modifiez les informations du club "{club.name}".
        </p>
      </div>

      <ClubForm
        initialData={formData}
        documents={documents}
        onSubmit={handleSubmit}
        onUploadDocument={handleUploadDocument}
        onDeleteDocument={handleDeleteDocument}
        isLoading={isSubmitting}
        isEditing={true}
        clubId={clubId}
      />
    </div>
  );
}
