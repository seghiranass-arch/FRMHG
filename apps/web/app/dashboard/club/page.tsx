import Image from "next/image";
import { cookies, headers } from "next/headers";
import { requireAuth } from "../../../lib/server-auth";
import { PageHeader } from "../../../components/dashboard/page-header";
import { MemberDistributionChart } from "./club-charts";
import { 
  Users, 
  Calendar, 
  Activity, 
  ShieldCheck, 
  Clock, 
  FileText, 
  CreditCard,
  Trophy,
  ArrowRight,
  TrendingUp,
  MapPin
} from "lucide-react";
import Link from "next/link";

const COOKIE_NAME = "frmhg_token";
const API_URL = process.env.API_URL || "http://localhost:3001";

type Member = {
  id: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  member_status?: string;
  memberStatus?: string;
  license_status?: string;
  licenseStatus?: string;
  created_at?: string;
  createdAt?: string;
  org_id?: string | null;
  orgId?: string | null;
  ageCategory?: string;
  teamId?: string;
  team_id?: string;
};

type Team = {
  id: string;
  name: string;
  category: string;
  gender: string;
  members?: any[];
};

type Match = {
  id: string;
  date: string;
  competitionName: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  venue?: string;
  homeScore?: number;
  awayScore?: number;
  resultType?: string;
};

type ClubProfile = {
  id: string;
  name: string;
  acronym?: string;
  logoDocumentId?: string;
  competitions?: any[];
  upcomingMatches?: Match[];
  recentResults?: Match[];
};

async function fetchWithAuth<T>(endpoint: string, fallback: T): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: token ? { Cookie: `${COOKIE_NAME}=${token}` } : {},
      cache: "no-store",
    });
    if (!response.ok) return fallback;
    return response.json();
  } catch {
    return fallback;
  }
}

async function getClub(orgId?: string | null): Promise<ClubProfile | null> {
  if (!orgId) return null;
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  try {
    const response = await fetch(`${protocol}://${host}/api/public/sport/clubs/${orgId}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getMembers(orgId?: string | null): Promise<Member[]> {
  if (!orgId) return [];
  const data = await fetchWithAuth<Member[]>(`/members?assignedClubId=${orgId}`, []);
  return Array.isArray(data) ? data : [];
}

async function getTeams(orgId?: string | null): Promise<Team[]> {
  if (!orgId) return [];
  const data = await fetchWithAuth<Team[]>(`/teams?orgId=${orgId}`, []);
  return Array.isArray(data) ? data : [];
}

export default async function ClubDashboard() {
  const me = await requireAuth();
  const [club, members, teams] = await Promise.all([
    getClub(me.orgId),
    getMembers(me.orgId),
    getTeams(me.orgId),
  ]);

  const isFederationAdmin = me.roles.includes("federation_admin");
  const getMemberStatus = (m: Member) => m.member_status || m.memberStatus || "";
  const getLicenseStatus = (m: Member) => m.license_status || m.licenseStatus || "";
  const getCreatedAt = (m: Member) => m.created_at || m.createdAt || "";
  
  // KPI Calculations
  const totalMembers = members.length;
  const clubPlayers = members.filter((m) => getMemberStatus(m) === "club_player").length;
  const adherents = members.filter((m) => getMemberStatus(m) === "adherent").length;
  const activeLicenses = members.filter((m) => getLicenseStatus(m) === "active").length;
  const pendingLicenses = members.filter((m) =>
    ["pending_approval", "pending_payment"].includes(getLicenseStatus(m)),
  ).length;
  const newThisMonth = members.filter((m) => {
    const createdAt = getCreatedAt(m);
    if (!createdAt) return false;
    const createdTime = new Date(createdAt).getTime();
    return createdTime >= Date.now() - 30 * 24 * 60 * 60 * 1000;
  }).length;

  const licenseCoverage = totalMembers > 0 ? Math.round((activeLicenses / totalMembers) * 100) : 0;

  // Calculate members per team
  const membersByTeam = members.reduce((acc, m) => {
    const tId = m.teamId || (m as any).team_id;
    if (tId) {
      acc[tId] = (acc[tId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Chart Data
  const memberStatusData = [
    { name: "Joueurs", value: clubPlayers, color: "#3b82f6" }, // blue-500
    { name: "Adhérents", value: adherents, color: "#10b981" }, // emerald-500
  ].filter(d => d.value > 0);

  const licenseStatusData = [
    { name: "Actives", value: activeLicenses, color: "#22c55e" }, // green-500
    { name: "En attente", value: pendingLicenses, color: "#f59e0b" }, // amber-500
    { name: "Autres", value: totalMembers - activeLicenses - pendingLicenses, color: "#94a3b8" }, // slate-400
  ].filter(d => d.value > 0);

  const stats = [
    { 
      label: "Membres total", 
      value: totalMembers, 
      change: `+${newThisMonth} ce mois`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      label: "Licences actives", 
      value: activeLicenses, 
      change: `${licenseCoverage}% couverture`,
      icon: ShieldCheck,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    { 
      label: "En attente", 
      value: pendingLicenses, 
      change: "Action requise",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    { 
      label: "Compétitions", 
      value: club?.competitions?.length || 0, 
      change: "Engagées",
      icon: Trophy,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Tableau de bord Club"
        subtitle={`Bienvenue, ${me.displayName}`}
        user={me}
        usePlainStyle={false}
      />

      {/* Club Identity Card */}
      {club && (
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm">
          <div className="flex items-center gap-6">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-50 ring-1 ring-gray-100 flex items-center justify-center">
              {club.logoDocumentId ? (
                <Image
                  src={`/api/documents/view?id=${club.logoDocumentId}`}
                  alt={club.name}
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-300">
                  {(club.acronym || club.name || "").substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{club.name}</h2>
              {club.acronym && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                    {club.acronym}
                  </span>
                  <span className="text-sm text-gray-500">Saison 2024-2025</span>
                </div>
              )}
            </div>
          </div>
          <div className="hidden sm:block">
            <Link 
              href="/modules/membres"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all"
            >
              <Users className="h-4 w-4" />
              Gérer l'effectif
            </Link>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`rounded-xl p-3 ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="mr-1.5 h-4 w-4 text-green-500" />
              <span className="font-medium text-green-600">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Main Content */}
      <div className="space-y-8">
        {/* Charts Row */}
        <div className="grid gap-8 md:grid-cols-2">
          <MemberDistributionChart 
            title="Répartition Effectif" 
            data={memberStatusData}
            iconName="users"
          />
          <MemberDistributionChart 
            title="État des Licences" 
            data={licenseStatusData}
            iconName="file-text"
          />
        </div>

        {/* Matches and Results Row */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upcoming Matches */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-sm">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                Prochains Matchs
              </h3>
              <Link href="/modules/sportif" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Voir tout
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {club?.upcomingMatches && club.upcomingMatches.length >0 ? (
                club.upcomingMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col items-center min-w-[60px]">
                        <span className="text-xs font-bold text-gray-900">
                          {new Date(match.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(match.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                            {match.competitionName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-semibold text-gray-900">
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="truncate">{match.homeTeam}</span>
                            {match.homeLogo ? (
                              <div className="relative h-6 w-6 flex-shrink-0">
                                <Image
                                  src={`/api/documents/view?id=${match.homeLogo}`}
                                  alt={match.homeTeam}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                {match.homeTeam.substring(0, 1)}
                              </div>
                            )}
                          </div>
                          <span className="text-gray-400 font-normal px-1">vs</span>
                          <div className="flex items-center gap-2 flex-1">
                            {match.awayLogo ? (
                              <div className="relative h-6 w-6 flex-shrink-0">
                                <Image
                                  src={`/api/documents/view?id=${match.awayLogo}`}
                                  alt={match.awayTeam}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                {match.awayTeam.substring(0, 1)}
                              </div>
                            )}
                            <span className="truncate">{match.awayTeam}</span>
                          </div>
                        </div>
                        {match.venue && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            {match.venue}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Aucun match programmé prochainement
                </div>
              )}
            </div>
          </div>

          {/* Recent Results */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-sm">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-400" />
                Derniers Résultats
              </h3>
              <Link href="/modules/sportif" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Voir tout
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {club?.recentResults && club.recentResults.length > 0 ? (
                club.recentResults.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col items-center min-w-[60px]">
                        <span className="text-xs font-bold text-gray-900">
                          {new Date(match.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </span>
                        <div className={`mt-1 h-1.5 w-1.5 rounded-full ${
                          match.homeScore !== undefined && match.awayScore !== undefined ? (
                            (match.homeTeam === club.acronym || match.homeTeam === club.name) ? (
                              match.homeScore > match.awayScore ? "bg-green-500" : "bg-red-500"
                            ) : (
                              match.awayScore! > match.homeScore! ? "bg-green-500" : "bg-red-500"
                            )
                          ) : "bg-gray-300"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {match.competitionName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-semibold text-gray-900">
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className={`truncate ${
                              (match.homeTeam === club.acronym || match.homeTeam === club.name) ? "font-bold" : ""
                            }`}>{match.homeTeam}</span>
                            {match.homeLogo ? (
                              <div className="relative h-6 w-6 flex-shrink-0">
                                <Image
                                  src={`/api/documents/view?id=${match.homeLogo}`}
                                  alt={match.homeTeam}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                {match.homeTeam.substring(0, 1)}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded font-mono text-sm">
                            <span className={`font-bold ${
                              (match.homeScore || 0) > (match.awayScore || 0) ? "text-gray-900" : "text-gray-500"
                            }`}>{match.homeScore}</span>
                            <span className="text-gray-300">-</span>
                            <span className={`font-bold ${
                              (match.awayScore || 0) > (match.homeScore || 0) ? "text-gray-900" : "text-gray-500"
                            }`}>{match.awayScore}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            {match.awayLogo ? (
                              <div className="relative h-6 w-6 flex-shrink-0">
                                <Image
                                  src={`/api/documents/view?id=${match.awayLogo}`}
                                  alt={match.awayTeam}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                {match.awayTeam.substring(0, 1)}
                              </div>
                            )}
                            <span className={`truncate ${
                              (match.awayTeam === club.acronym || match.awayTeam === club.name) ? "font-bold" : ""
                            }`}>{match.awayTeam}</span>
                          </div>
                        </div>
                        {match.resultType && match.resultType !== 'regulation' && (
                          <div className="flex justify-center mt-1">
                            <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 rounded">
                              {match.resultType === 'overtime' ? 'AP' : 'TB'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Aucun résultat récent
                </div>
              )}
            </div>
          </div>

          {/* Teams List */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-sm lg:col-span-2">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-400" />
                Équipes ({teams.length})
              </h3>
              <Link href="/modules/membres" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Gérer
              </Link>
            </div>
            <div className="p-6">
              {teams.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-gray-100 transition-colors">
                      <div>
                        <div className="font-semibold text-gray-900">{team.name}</div>
                        <div className="text-xs text-gray-500 mt-1 capitalize">{team.category} • {team.gender}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-medium text-gray-500">Effectif</span>
                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-sm font-bold text-brand-600 shadow-sm border border-gray-100">
                          {membersByTeam[team.id] || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-4">Aucune équipe configurée</p>
                  <Link 
                    href="/modules/membres"
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Configurer les équipes <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            t: "Effectif", 
            d: "Gérer les joueurs et staffs", 
            href: "/modules/membres",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50"
          },
          { 
            t: "Licences", 
            d: "Renouvellements et demandes", 
            href: "/modules/licences",
            icon: FileText,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
          },
          { 
            t: "Paiements", 
            d: "Historique et factures", 
            href: "/modules/paiements",
            icon: CreditCard,
            color: "text-purple-600",
            bg: "bg-purple-50"
          },
          { 
            t: "Compétitions", 
            d: "Calendriers et résultats", 
            href: "/modules/sportif",
            icon: Trophy,
            color: "text-amber-600",
            bg: "bg-amber-50"
          }
        ].map((action) => (
          <Link 
            key={action.t} 
            href={action.href} 
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className={`mb-4 inline-flex rounded-xl p-3 ${action.bg}`}>
              <action.icon className={`h-6 w-6 ${action.color}`} />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
              {action.t}
            </h3>
            <p className="text-sm text-gray-500">
              {action.d}
            </p>
          </Link>
        ))}
      </div>
      
      {isFederationAdmin && (
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-theme-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Administration Fédérale</h3>
              <p className="text-gray-300 text-sm mb-4">Accès rapide aux outils de gestion fédérale</p>
            </div>
            <Link
              href="/dashboard/federation/clubs"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              Gestion des clubs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
