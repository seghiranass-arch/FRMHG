"use client";

import * as React from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import MemberForm, { MemberFormData } from "../../../../components/members/member-form";
import { MemberProfileView } from "../../../../components/members/member-profile-view";
import { ModulePage } from "../../../../components/layout/page-wrapper";

export default function MemberProfilePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isEditingParam = searchParams.get("edit") === "1";

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [initialData, setInitialData] = React.useState<Partial<MemberFormData> | null>(null);
  const [isEditing, setIsEditing] = React.useState(isEditingParam);
  
  const [clubs, setClubs] = React.useState<any[]>([]);
  const [seasons, setSeasons] = React.useState<any[]>([]);
  const [disciplines, setDisciplines] = React.useState<any[]>([]);
  const [subscriptionTypes, setSubscriptionTypes] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [subscriptionHistory, setSubscriptionHistory] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [canDownloadLicense, setCanDownloadLicense] = React.useState(false);

  const mapMemberToForm = (data: any): MemberFormData => {
    const memberStatus =
      data.member_status ??
      data.memberStatus ??
      (data.org_id || data.orgId ? "club_player" : "adherent");

    const profilePhotoIdFromDocs = Array.isArray(data.documents)
      ? data.documents.find((doc: any) => doc.type === "photo")?.id
      : undefined;

    return {
      ...data,
      firstName: data.first_name ?? data.firstName,
      lastName: data.last_name ?? data.lastName,
      dateOfBirth: data.date_of_birth ?? data.dateOfBirth,
      profilePhotoId: data.profile_photo_id ?? data.profilePhotoId ?? profilePhotoIdFromDocs,
      memberNumber: data.member_number ?? data.memberNumber,
      idNumber: data.id_number ?? data.idNumber,
      idType: data.id_type ?? data.idType,
      emergencyContactName: data.emergency_contact_name ?? data.emergencyContactName,
      emergencyContactPhone: data.emergency_contact_phone ?? data.emergencyContactPhone,
      ageCategory: data.age_category ?? data.ageCategory,
      jerseyNumber: data.jersey_number ?? data.jerseyNumber,
      registrationDate: data.registration_date ?? data.registrationDate,
      memberStatus,
      assignedClubId: data.org_id ?? data.orgId ?? data.assignedClubId,
      assignmentStartDate: data.assignment_start_date ?? data.assignmentStartDate,
      assignmentEndDate: data.assignment_end_date ?? data.assignmentEndDate,
      subscriptionType: data.subscription_type ?? data.subscriptionType,
      seasonId: data.season_id ?? data.seasonId,
      subscriptionAmount: data.subscription_amount
        ? Number(data.subscription_amount)
        : data.subscriptionAmount,
      paymentMethod: data.payment_method ?? data.paymentMethod,
      paymentStatus: data.payment_status ?? data.paymentStatus,
      paymentDate: data.payment_date ?? data.paymentDate,
      paymentReference: data.payment_reference ?? data.paymentReference,
      medicalStatus: data.medical_status ?? data.medicalStatus,
      lastMedicalVisitDate: data.last_medical_visit_date ?? data.lastMedicalVisitDate,
      federationDoctor: data.federation_doctor ?? data.federationDoctor,
      medicalFitness: data.medical_fitness ?? data.medicalFitness,
      fitnessExpirationDate: data.fitness_expiration_date ?? data.fitnessExpirationDate,
      licenseNumber: data.license_number ?? data.licenseNumber,
      licenseSeason: data.license_season ?? data.licenseSeason,
      licenseType: data.license_type ?? data.licenseType,
      licenseStatus: data.license_status ?? data.licenseStatus,
      licenseIssueDate: data.license_issue_date ?? data.licenseIssueDate,
      licenseExpirationDate: data.license_expiration_date ?? data.licenseExpirationDate,
    };
  };

  const refreshMember = async () => {
    const memberRes = await fetch(`/api/members/${id}`);
    if (memberRes.ok) {
      const data = await memberRes.json();
      const mapped = mapMemberToForm(data);
      setInitialData(mapped);
      return mapped;
    }
    return null;
  };

  const refreshSubscriptions = async (memberStatus?: string) => {
    if (memberStatus !== "adherent") {
      setSubscriptionHistory([]);
      return;
    }
    const res = await fetch(`/api/members/${id}/subscriptions`);
    if (res.ok) {
      setSubscriptionHistory(await res.json());
      return;
    }
    if (res.status === 404) {
      setSubscriptionHistory([]);
    }
  };

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          const roles = Array.isArray(meData?.roles)
            ? meData.roles
            : Array.isArray(meData?.user?.roles)
            ? meData.user.roles
            : Array.isArray(meData?.data?.roles)
            ? meData.data.roles
            : [];
          const isFederationAdmin = roles.includes("federation_admin");
          const isClubAdmin = roles.includes("club_admin");
          setIsAdmin(isFederationAdmin);
          setCanDownloadLicense(isFederationAdmin || isClubAdmin);
        } else {
          setIsAdmin(false);
          setCanDownloadLicense(false);
        }

        const memberData = await refreshMember();
        const isAdherentMember = memberData?.memberStatus === "adherent";

        const [clubsRes, seasonsRes, disciplinesRes, subscriptionsRes, categoriesRes] = await Promise.all([
          fetch("/api/orgs"),
          fetch("/api/licensing/seasons"),
          fetch("/api/settings/disciplines"),
          fetch("/api/settings/subscriptions"),
          fetch("/api/settings/categories"),
        ]);

        if (clubsRes.ok) setClubs(await clubsRes.json());
        if (seasonsRes.ok) {
          const seasonsData = await seasonsRes.json();
          setSeasons(seasonsData.map((s: any) => ({
            id: s.id,
            code: s.code,
            name: s.name,
            isActive: s.is_active || s.isActive
          })));
        }
        if (disciplinesRes.ok) setDisciplines(await disciplinesRes.json());
        if (subscriptionsRes.ok) setSubscriptionTypes(await subscriptionsRes.json());
        if (categoriesRes.ok) setCategories(await categoriesRes.json());
        await refreshSubscriptions(isAdherentMember ? "adherent" : "club_player");
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erreur lors du chargement des données.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleCreateSubscription = async (payload?: {
    subscriptionType?: string;
    seasonId?: string;
    subscriptionAmount?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    paymentDate?: string;
    paymentReference?: string;
  }) => {
    if (!initialData) return;
    setError(null);
    const amountValue =
      payload?.subscriptionAmount ?? initialData.subscriptionAmount ?? undefined;
    const amountCents = amountValue !== undefined ? Math.round(amountValue * 100) : undefined;
    const res = await fetch(`/api/members/${id}/subscriptions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        subscriptionId: payload?.subscriptionType ?? initialData.subscriptionType,
        seasonId: payload?.seasonId ?? initialData.seasonId,
        amountCents,
      }),
    });
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    const created = await res.json();
    const paymentStatusRaw = payload?.paymentStatus ?? initialData.paymentStatus;
    const paymentStatus =
      paymentStatusRaw === "paid"
        ? "paid"
        : paymentStatusRaw === "pending" || paymentStatusRaw === "overdue"
        ? "pending"
        : "";
    if (paymentStatus) {
      const paymentRes = await fetch(`/api/members/${id}/subscriptions/${created.id}/payments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amountCents: amountCents ?? 0,
          method: payload?.paymentMethod ?? initialData.paymentMethod,
          status: paymentStatus,
          paidAt: payload?.paymentDate ?? initialData.paymentDate,
          reference: payload?.paymentReference ?? initialData.paymentReference,
        }),
      });
      if (!paymentRes.ok) {
        setError(await paymentRes.text());
        return;
      }
    }
    await refreshSubscriptions(initialData?.memberStatus);
    await refreshMember();
  };

  const handleRenewSubscription = async (subscriptionId: string) => {
    if (!initialData) return;
    setError(null);
    const current = subscriptionHistory.find((s) => s.id === subscriptionId);
    const res = await fetch(`/api/members/${id}/subscriptions/${subscriptionId}/renew`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        subscriptionId: current?.subscriptionId ?? initialData.subscriptionType,
        seasonId: current?.seasonId ?? initialData.seasonId,
        amountCents: current?.amountCents ?? (initialData.subscriptionAmount ? Math.round(initialData.subscriptionAmount * 100) : undefined),
      }),
    });
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    await refreshSubscriptions(initialData?.memberStatus);
    await refreshMember();
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    setError(null);
    const res = await fetch(`/api/members/${id}/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: { "content-type": "application/json" },
    });
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    await refreshSubscriptions(initialData?.memberStatus);
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    setError(null);
    const res = await fetch(`/api/members/${id}/subscriptions/${subscriptionId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    await refreshSubscriptions(initialData?.memberStatus);
  };

  const handleAddPayment = async (subscriptionId: string) => {
    if (!initialData) return;
    setError(null);
    const current = subscriptionHistory.find((s) => s.id === subscriptionId);
    const amountCents = current?.amountCents ?? Math.round((initialData.subscriptionAmount || 0) * 100);
    const res = await fetch(`/api/members/${id}/subscriptions/${subscriptionId}/payments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        amountCents,
        method: initialData.paymentMethod,
        status: "paid",
        paidAt: initialData.paymentDate,
        reference: initialData.paymentReference,
      }),
    });
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    await refreshSubscriptions(initialData?.memberStatus);
    await refreshMember();
  };

  const handleSubmit = async (data: MemberFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text || "Erreur lors de la mise à jour du membre");
        return;
      }

      const updatedMember = await res.json();
      setInitialData(mapMemberToForm(updatedMember));
      setIsEditing(false);
      router.refresh();
      return updatedMember;
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/modules/membres")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditing ? "Modifier le membre" : "Profil du membre"}
            </h1>
            <p className="text-sm text-gray-500">
              {initialData?.firstName} {initialData?.lastName} — {initialData?.memberNumber}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier
            </button>
          )}
          {isEditing && (
             <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
            >
                Annuler
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Profile / Form */}
      {initialData && (
        <>
            {isEditing ? (
                <MemberForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    onProfilePhotoUpdated={(photoId) => {
                      setInitialData(prev =>
                        prev
                          ? { ...prev, profilePhotoId: photoId, profile_photo_id: photoId }
                          : prev
                      );
                    }}
                    isLoading={isSubmitting}
                    isEditing={true}
                    memberId={id}
                    clubs={clubs}
                    seasons={seasons}
                    disciplines={disciplines}
                    subscriptionTypes={subscriptionTypes}
                    categories={categories}
                    canAccessMedical={true}
                    hideMemberStatusSelection={true}
                    hiddenTabs={
                      initialData.memberStatus === "adherent"
                        ? ["sports", "club", "documents", "license"]
                        : initialData.memberStatus === "club_player"
                        ? ["subscription", "documents", "license"]
                        : []
                    }
                    hiddenSportsFields={
                      initialData.memberStatus === "club_player"
                        ? ["ageCategory", "jerseyNumber"]
                        : []
                    }
                />
            ) : (
                <MemberProfileView
                    data={initialData}
                    isAdmin={isAdmin}
                    canDownloadLicense={canDownloadLicense}
                    clubs={clubs}
                    seasons={seasons}
                    disciplines={disciplines}
                    subscriptionTypes={subscriptionTypes}
                    categories={categories}
                    subscriptionHistory={subscriptionHistory}
                    onCreateSubscription={handleCreateSubscription}
                    onRenewSubscription={handleRenewSubscription}
                    onCancelSubscription={handleCancelSubscription}
                    onDeleteSubscription={handleDeleteSubscription}
                    onAddPayment={handleAddPayment}
                />
            )}
        </>
      )}
    </div>
  );
}
