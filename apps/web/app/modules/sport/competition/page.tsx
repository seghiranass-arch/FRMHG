import { cookies } from "next/headers";
import { CompetitionCenter } from "../../../../components/sport/competition-center";
import { PageHeader } from "../../../../components/dashboard/page-header";
import { requireAuth } from "../../../../lib/server-auth";

const API_URL = process.env.API_URL || "http://localhost:3001";
const COOKIE_NAME = "frmhg_token";

async function fetchWithAuth<T>(endpoint: string): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: token ? { Cookie: `${COOKIE_NAME}=${token}` } : {},
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return response.json();
}

export default async function CompetitionModule() {
  const me = await requireAuth();
  let competitionsRaw: any[] = [];
  let clubs: any[] = [];
  let matches: any[] = [];
  let players: any[] = [];
  let matchSheets: any[] = [];
  let manualPlayerStatsRaw: any[] = [];
  let loadError: string | null = null;

  try {
    const result = await Promise.all([
      fetchWithAuth<any[]>("/sport/competitions"),
      fetchWithAuth<any[]>("/sport/clubs"),
      fetchWithAuth<any[]>("/sport/matches"),
      fetchWithAuth<any[]>("/sport/players"),
      fetchWithAuth<any[]>("/sport/match-sheets"),
      fetchWithAuth<any[]>("/sport/manual-player-stats"),
    ]);
    competitionsRaw = result[0];
    clubs = result[1];
    matches = result[2];
    players = result[3];
    matchSheets = result[4];
    manualPlayerStatsRaw = result[5];
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Erreur lors du chargement des données sportives";
  }

  const competitions = competitionsRaw.map((c) => ({
    ...c,
    type: c.type || "league",
    format: c.type === "cup" ? "cup_single_elimination" : "league_double_round_robin",
    phase: c.phase || "draft",
    lockedAt: c.lockedAt ?? null,
  }));

  const manualPlayerStats = manualPlayerStatsRaw.map((entry) => ({
    playerId: entry.memberId,
    competitionId: entry.competitionId,
    matchesPlayed: entry.stats?.matchesPlayed ?? 0,
    goals: entry.stats?.goals ?? 0,
    assists: entry.stats?.assists ?? 0,
    updatedAt: entry.updatedAt,
  }));
  
  const isAdmin = me.roles?.includes("federation_admin");
  
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestion des Compétitions"
        subtitle="L2 (aller/retour) • C1 (élimination directe) • Score & qualifiés automatiques"
        user={me}
        usePlainStyle={false}
      />

      {loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {loadError}
        </div>
      ) : null}

      <CompetitionCenter
        initialCompetitions={competitions}
        initialClubs={clubs}
        initialMatches={matches}
        initialPlayers={players}
        initialMatchSheets={matchSheets}
        isAdmin={isAdmin}
      />
    </div>
  );
}
