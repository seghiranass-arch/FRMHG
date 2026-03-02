"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Users, Search, RefreshCw, Plus, Building, Filter, Grid, List } from "lucide-react";

type Member = {
  id: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  sex?: "M" | "F" | null;
  org_id?: string | null;
  orgId?: string | null;
  assigned_club_id?: string | null;
  assignedClubId?: string | null;
  org_name?: string | null;
  discipline?: string | null;
  age_category?: string | null;
  ageCategory?: string | null;
  status?: string | null;
  member_status?: string | null;
  memberStatus?: string | null;
  profile_photo_id?: string | null;
  profilePhotoId?: string | null;
  license_status?: string | null;
  licenseStatus?: string | null;
  license_number?: string | null;
  licenseNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  user_id?: string | null;
  userId?: string | null;
  team_id?: string | null;
  teamId?: string | null;
  created_at?: string;
  documents?: Array<{
    id: string;
    type?: string | null;
  }>;
};

const MEMBER_CATEGORY = {
  club_player: { label: "Joueur de Club", color: "bg-blue-100 text-blue-800", dotColor: "bg-blue-500" },
  adherent: { label: "Adhérent École Hockey", color: "bg-green-100 text-green-800", dotColor: "bg-green-500" },
};

const LICENSE_STATUS = {
  active: { label: "Active", color: "bg-green-100 text-green-800" },
  pending_payment: { label: "Attente paiement", color: "bg-yellow-100 text-yellow-800" },
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
  pending_approval: { label: "Attente approbation", color: "bg-orange-100 text-orange-800" },
  archived: { label: "Archivée", color: "bg-gray-100 text-gray-600" },
};

const STATUS_CONFIG = {
  active: { label: "Actif", color: "bg-green-100 text-green-800" },
  inactive: { label: "Inactif", color: "bg-gray-100 text-gray-600" },
  suspended: { label: "Suspendu", color: "bg-red-100 text-red-800" },
  archived: { label: "Archivé", color: "bg-gray-100 text-gray-600" },
};

export default function MembresModulePage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [clubFilter, setClubFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchData();
  }, [router]);

  const getUserRoles = (data: any): string[] => {
    if (!data) return [];
    if (Array.isArray(data.roles)) return data.roles;
    if (Array.isArray(data.user?.roles)) return data.user.roles;
    if (Array.isArray(data.data?.roles)) return data.data.roles;
    return [];
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
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
      const roles = getUserRoles(meData);
      const [membersRes, clubsRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/orgs")
      ]);

      let membersData: Member[] = [];
      if (membersRes.ok) {
        membersData = await membersRes.json();
        setMembers(membersData);
      }

      let clubsData: { id: string; name: string }[] = [];
      if (clubsRes.ok) {
        const rawClubs = await clubsRes.json();
        clubsData = rawClubs.map((c: any) => ({ id: c.id, name: c.name }));
        setClubs(clubsData);
      }

    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  const getMemberStatus = (m: Member) => m.member_status || m.memberStatus;
  const getMemberFirstName = (m: Member) => m.first_name || m.firstName || "";
  const getMemberLastName = (m: Member) => m.last_name || m.lastName || "";
  const getMemberPhoto = (m: Member) => {
    const directPhotoId = m.profile_photo_id || m.profilePhotoId;
    if (directPhotoId) return directPhotoId;
    const docPhoto = m.documents?.find(doc => doc.type === "photo");
    return docPhoto?.id;
  };
  const getMemberCategory = (m: Member) => m.age_category || m.ageCategory;
  const getMemberLicenseStatus = (m: Member) => m.license_status || m.licenseStatus;
  const getMemberLicenseNumber = (m: Member) => m.license_number || m.licenseNumber;
  const getMemberOrgId = (m: Member) =>
    m.org_id || m.orgId || m.assigned_club_id || m.assignedClubId;
  const getMemberUserId = (m: Member) => m.user_id || m.userId;

  const userRoles = getUserRoles(user);
  const isFederationAdmin = userRoles.includes("federation_admin");
  const isClubAdmin = userRoles.includes("club_admin");
  const isPlayerRole = userRoles.includes("club_player") || userRoles.includes("player");
  const userOrgId = user?.orgId || user?.org_id || null;
  const linkedMember = user?.id
    ? members.find(m => getMemberUserId(m) === user.id)
    : undefined;
  const scopedOrgId = userOrgId || getMemberOrgId(linkedMember || ({} as Member)) || null;

  const scopedMembers = members.filter(member => {
    if (isFederationAdmin) return true;
    if (isClubAdmin) {
      if (!scopedOrgId) return false;
      const isSameClub = getMemberOrgId(member) === scopedOrgId;
      const isClubPlayer = getMemberStatus(member) === "club_player";
      return isSameClub && isClubPlayer;
    }
    if (isPlayerRole) return getMemberUserId(member) === user?.id;
    return true;
  });

  const scopedClubs = isClubAdmin && scopedOrgId
    ? clubs.filter(c => c.id === scopedOrgId)
    : clubs;

  useEffect(() => {
    if (isClubAdmin && scopedOrgId) {
      setClubFilter(scopedOrgId);
    }
  }, [isClubAdmin, scopedOrgId]);

  // Filter members
  const filteredMembers = scopedMembers.filter(member => {
    const firstName = getMemberFirstName(member).toLowerCase();
    const lastName = getMemberLastName(member).toLowerCase();
    const licenseNum = getMemberLicenseNumber(member)?.toLowerCase() || "";
    
    const matchesSearch = 
      firstName.includes(searchTerm.toLowerCase()) ||
      lastName.includes(searchTerm.toLowerCase()) ||
      licenseNum.includes(searchTerm.toLowerCase());
    
    const memberStatus = getMemberStatus(member);
    const memberOrgId = getMemberOrgId(member);
    const matchesCategory = 
      categoryFilter === "all" || 
      memberStatus === categoryFilter ||
      (categoryFilter === "club_player" && memberOrgId) ||
      (categoryFilter === "adherent" && !memberOrgId);
    
    const matchesClub = clubFilter === "all" || getMemberOrgId(member) === clubFilter;
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesClub && matchesStatus;
  });

  // Stats
  const clubPlayers = scopedMembers.filter(m => getMemberStatus(m) === "club_player" || getMemberOrgId(m));
  const adherents = scopedMembers.filter(m => getMemberStatus(m) === "adherent" || (!getMemberOrgId(m) && getMemberStatus(m) !== "club_player"));
  const pendingLicenses = scopedMembers.filter(m => {
    const ls = getMemberLicenseStatus(m);
    return ls === "pending_approval" || ls === "pending_payment";
  });

  const stats = {
    total: scopedMembers.length,
    clubPlayers: clubPlayers.length,
    adherents: adherents.length,
    pendingLicenses: pendingLicenses.length,
  };

  // Category tabs
  const categoryTabs = [
    { id: "all", label: "Tous", count: stats.total },
    { id: "club_player", label: "Joueurs de Club", count: stats.clubPlayers },
    ...(isClubAdmin ? [] : [{ id: "adherent", label: "Adhérents École Hockey", count: stats.adherents }]),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={() => fetchData()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Joueurs</h1>
          <p className="text-sm text-gray-500 mt-1">Liste des joueurs et adhérents</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData()}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <div className="flex items-center gap-2">
            {!isClubAdmin && (
              <Link
                href="/modules/membres/nouveau/adherent"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-green-500 rounded-xl hover:bg-green-600 shadow-lg hover:shadow-xl transition-all"
              >
                <User className="w-5 h-5" />
                Nouvel Adhérent
              </Link>
            )}
            <Link
              href="/modules/membres/nouveau/joueur"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-500 rounded-xl hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Nouveau Joueur
            </Link>
          </div>
        </div>
      </div>

      {(isClubAdmin || isPlayerRole) && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          Vue limitée aux informations liées à votre profil
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-${isClubAdmin ? "3" : "4"} gap-4`}>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 rounded-xl">
              <Users className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Total Membres</div>
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Joueurs de Club</div>
              <div className="text-2xl font-bold text-blue-600">{stats.clubPlayers}</div>
            </div>
          </div>
        </div>
        {!isClubAdmin && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-xl">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Adhérents École</div>
                <div className="text-2xl font-bold text-green-600">{stats.adherents}</div>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-xl">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Licences en attente</div>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingLicenses}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-theme-sm">
        <div className="flex gap-2">
          {categoryTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                categoryFilter === tab.id
                  ? "bg-brand-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                categoryFilter === tab.id
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nom, prénom ou n° licence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Club</label>
            <select
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="all">Tous les clubs</option>
              {scopedClubs.map(club => (
                <option key={club.id} value={club.id}>{club.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="suspended">Suspendus</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Affichage</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-brand-100 text-brand-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Grid className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-brand-100 text-brand-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <List className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-theme-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Membres ({filteredMembers.length})
          </h2>
          <div className="text-sm text-gray-500">
            {searchTerm || clubFilter !== "all" || statusFilter !== "all" || categoryFilter !== "all"
              ? `${scopedMembers.length} au total`
              : ""}
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun membre trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || clubFilter !== "all" || statusFilter !== "all" || categoryFilter !== "all"
                ? "Aucun membre ne correspond à vos filtres."
                : "Commencez par créer votre premier membre."}
            </p>
            {!searchTerm && clubFilter === "all" && statusFilter === "all" && categoryFilter === "all" && (
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Link
                  href="/modules/membres/nouveau/adherent"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
                >
                  <User className="w-4 h-4" />
                  Créer un adhérent
                </Link>
                <Link
                  href="/modules/membres/nouveau/joueur"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <Plus className="w-4 h-4" />
                  Créer un joueur
                </Link>
              </div>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMembers.map(member => {
              const memberStatus = getMemberStatus(member);
              const categoryConfig = memberStatus === "club_player" || member.org_id
                ? MEMBER_CATEGORY.club_player
                : MEMBER_CATEGORY.adherent;
              const licenseStatus = getMemberLicenseStatus(member);
              const photoUrl = getMemberPhoto(member) ? `/api/documents/view?id=${getMemberPhoto(member)}` : null;

              return (
                <div
                  key={member.id}
                  onClick={() => router.push(`/modules/membres/${member.id}`)}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-brand-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                        {photoUrl ? (
                          <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${categoryConfig.dotColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 group-hover:text-brand-600 transition-colors truncate uppercase">
                        {getMemberLastName(member)}
                      </div>
                      <div className="text-sm text-gray-500 truncate capitalize">
                        {getMemberFirstName(member)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${categoryConfig.color}`}>
                      {categoryConfig.label}
                    </span>
                    {licenseStatus && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${LICENSE_STATUS[licenseStatus as keyof typeof LICENSE_STATUS]?.color || 'bg-gray-100 text-gray-600'}`}>
                        {LICENSE_STATUS[licenseStatus as keyof typeof LICENSE_STATUS]?.label || licenseStatus}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {member.org_name && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Building className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{member.org_name}</span>
                      </div>
                    )}
                    {getMemberCategory(member) && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded font-bold text-gray-600">
                          {getMemberCategory(member)}
                        </span>
                        {member.discipline && (
                          <span className="text-gray-500">{member.discipline}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-400 font-mono">
                      {getMemberLicenseNumber(member) || "Pas de licence"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Membre</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Catégorie</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Club</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Discipline</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Licence</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(member => {
                  const memberStatus = getMemberStatus(member);
                  const categoryConfig = memberStatus === "club_player" || member.org_id
                    ? MEMBER_CATEGORY.club_player
                    : MEMBER_CATEGORY.adherent;
                  const licenseStatus = getMemberLicenseStatus(member);
                  const photoUrl = getMemberPhoto(member) ? `/api/documents/view?id=${getMemberPhoto(member)}` : null;

                  return (
                    <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                            {photoUrl ? (
                              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 uppercase">{getMemberLastName(member)}</div>
                            <div className="text-sm text-gray-500 capitalize">{getMemberFirstName(member)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${categoryConfig.color}`}>
                          {categoryConfig.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{member.org_name || "—"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">{member.discipline || "—"}</div>
                        <div className="text-xs text-gray-400">{getMemberCategory(member) || "—"}</div>
                      </td>
                      <td className="py-3 px-4">
                        {licenseStatus ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${LICENSE_STATUS[licenseStatus as keyof typeof LICENSE_STATUS]?.color || 'bg-gray-100 text-gray-600'}`}>
                            {LICENSE_STATUS[licenseStatus as keyof typeof LICENSE_STATUS]?.label || licenseStatus}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/modules/membres/${member.id}`}
                          className="text-sm font-medium text-brand-600 hover:text-brand-700"
                        >
                          Voir profil
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
