import { cookies, headers } from "next/headers";
import { LicensingPanel } from "../../../components/licensing/licensing-panel";
import { PageHeader } from "../../../components/dashboard/page-header";
import { getServerUser } from "../../../lib/server-auth";

type MemberLicense = {
  id: string;
  first_name: string;
  last_name: string;
  license_number: string;
  license_type: string; // 'player' or 'adherent'
  license_status: string; // 'pending_approval', 'active', 'draft', etc.
  license_issue_date: string;
  license_expiration_date: string | null;
  license_season: string | null;
  season_name: string | null;
  season_code: string | null;
  org_id: string | null;
  org_name: string | null;
  age_category: string | null;
  profile_photo_id: string | null;
  profile_photo_updated_at: string | null;
};

type Season = {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
  endDate?: string;
};

type FetchResult = {
  data: MemberLicense[];
  error: string | null;
};

async function getMembersForLicensing(): Promise<FetchResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const rawApiUrl =
      process.env.API_INTERNAL_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      process.env.API_URL ??
      "http://localhost:3001";
    const normalizedPath = rawApiUrl.startsWith("/") ? rawApiUrl : `/${rawApiUrl}`;
    const apiUrl = rawApiUrl.startsWith("http")
      ? rawApiUrl
      : `${protocol}://${host}${normalizedPath}`;
    const [res, seasonsRes] = await Promise.all([
      fetch(`${apiUrl}/members/licensing/list`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
        cache: "no-store",
      }),
      fetch(`${apiUrl}/licensing/seasons`, { cache: "no-store" }),
    ]);

    const seasons: Season[] = seasonsRes.ok ? await seasonsRes.json() : [];
    const seasonsById = new Map(seasons.map((s) => [s.id, s]));
    const seasonsByCode = new Map(seasons.map((s) => [s.code, s]));
    const activeSeason = seasons.find((s) => s.isActive);

    if (!res.ok) {
      // If unauthorized, redirect to login
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      const text = await res.text();
      return { data: [], error: text || `Erreur ${res.status}` };
    }

    const data = await res.json();
    const normalized = Array.isArray(data)
      ? data.map((m: any) => {
          const seasonKey =
            m.license_season ??
            m.licenseSeason ??
            m.season_id ??
            m.seasonId ??
            activeSeason?.id ??
            activeSeason?.code;
          const season =
            seasonsById.get(seasonKey) || seasonsByCode.get(seasonKey);
          const rawStatus = m.license_status ?? m.licenseStatus;
          const normalizedStatus =
            rawStatus === "draft" ? "pending_approval" : rawStatus;
          return {
            id: m.id,
            first_name: m.first_name ?? m.firstName,
            last_name: m.last_name ?? m.lastName,
            license_number: m.license_number ?? m.licenseNumber,
            license_type:
              m.memberStatus === "adherent"
                ? "adherent"
                : m.memberStatus === "club_player"
                ? "player"
                : m.license_type ?? m.licenseType,
            license_status: normalizedStatus,
            license_issue_date:
              m.license_issue_date ?? m.licenseIssueDate ?? m.createdAt,
            license_expiration_date:
              m.license_expiration_date ??
              m.licenseExpirationDate ??
              season?.endDate ??
              null,
            license_season:
              m.license_season ??
              m.licenseSeason ??
              m.season_id ??
              m.seasonId ??
              activeSeason?.id ??
              null,
            season_name: m.season_name ?? m.seasonName ?? season?.name ?? null,
            season_code: m.season_code ?? m.seasonCode ?? season?.code ?? null,
            org_id: m.org_id ?? m.orgId ?? m.assignedClubId ?? m.org?.id ?? null,
            org_name: m.org_name ?? m.orgName ?? m.org?.name,
            age_category:
              m.age_category ??
              m.ageCategory ??
              m.team?.category ??
              m.teamCategory ??
              m.team_category ??
              null,
            profile_photo_id: m.profile_photo_id ?? m.profilePhotoId ?? m.documents?.[0]?.id,
            profile_photo_updated_at: m.documents?.[0]?.updatedAt ?? m.documents?.[0]?.createdAt ?? null,
          };
        })
      : [];
    return { data: normalized, error: null };
  } catch (err) {
    return { data: [], error: "Impossible de charger les licences" };
  }
}

export default async function LicencesModule() {
  const serverUser = await getServerUser();
  const user = serverUser ?? {
    id: "dev-user",
    email: "admin@frmhg.ma",
    displayName: "Admin (Dev)",
    roles: ["federation_admin"],
  };
  
  let members: MemberLicense[] = [];
  let error: string | null = null;
  
  try {
    const result = await getMembersForLicensing();
    members = result.data;
    error = result.error;
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      throw err; // Let the auth system handle redirection
    }
    error = "Impossible de charger les licences";
  }
  
  const isFederationAdmin = user?.roles?.includes("federation_admin") ?? false;
  const isClubAdmin = user?.roles?.includes("club_admin") ?? false;
  const userOrgId = user?.orgId ?? null;
  const getMemberOrgId = (m: MemberLicense) => m.org_id;
  const scopedMembers =
    isClubAdmin && userOrgId
      ? members.filter((m) => getMemberOrgId(m) === userOrgId)
      : members;
  
  // Separate players and adherents
  const players = scopedMembers.filter(m => m.license_type === 'player');
  const adherents = scopedMembers.filter(m => m.license_type === 'adherent');
  
  // Count pending approvals
  const pendingPlayers = players.filter(m => ['pending_approval', 'pending'].includes(m.license_status)).length;
  const pendingAdherents = adherents.filter(m => ['pending_approval', 'pending'].includes(m.license_status)).length;

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestion des Licences" 
        subtitle="Approuver les licences en attente et gérer les renouvellements"
        user={user!}
        usePlainStyle={false}
      />
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800 font-medium">Erreur: {error}</p>
        </div>
      )}

      {/* Stats */}
      <div className={`grid grid-cols-1 md:grid-cols-${isClubAdmin ? "3" : "4"} gap-4`}>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm">
          <div className="text-sm font-medium text-gray-500">Total Joueurs</div>
          <div className="mt-1 text-2xl font-bold text-gray-800">{players.length}</div>
          {pendingPlayers > 0 && (
            <div className="mt-1 text-xs text-orange-600 font-semibold">{pendingPlayers} en attente</div>
          )}
        </div>
        {!isClubAdmin && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm">
            <div className="text-sm font-medium text-gray-500">Total Adhérents</div>
            <div className="mt-1 text-2xl font-bold text-gray-800">{adherents.length}</div>
            {pendingAdherents > 0 && (
              <div className="mt-1 text-xs text-orange-600 font-semibold">{pendingAdherents} en attente</div>
            )}
          </div>
        )}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm">
          <div className="text-sm font-medium text-gray-500">Licences Actives</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {scopedMembers.filter(m => m.license_status === 'active').length}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm">
          <div className="text-sm font-medium text-gray-500">En Attente Approbation</div>
          <div className="mt-1 text-2xl font-bold text-orange-600">
            {scopedMembers.filter(m => m.license_status === 'pending_approval').length}
          </div>
        </div>
      </div>

      <LicensingPanel
        players={players}
        adherents={adherents}
        canApprove={isFederationAdmin}
        showAdherents={!isClubAdmin}
        allowRenewRequest={isClubAdmin}
      />
    </div>
  );
}
