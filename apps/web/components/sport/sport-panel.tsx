"use client";

import * as React from "react";

type CompetitionRow = {
  id: string;
  name: string;
  level: string;
  status: string;
  created_at: string;
};

type TeamRow = {
  id: string;
  org_id: string;
  org_name?: string;
  name: string;
  category?: string | null;
  status: string;
};

type MatchRow = {
  id: string;
  competition_id?: string | null;
  competition_name?: string | null;
  starts_at: string;
  venue?: string | null;
  status: string;
  home_team_name: string;
  away_team_name: string;
};

export function SportPanel({
  initialCompetitions,
  initialTeams,
  initialMatches
}: {
  initialCompetitions: CompetitionRow[];
  initialTeams: TeamRow[];
  initialMatches: MatchRow[];
}) {
  const [competitions, setCompetitions] = React.useState(initialCompetitions);
  const [teams, setTeams] = React.useState(initialTeams);
  const [matches, setMatches] = React.useState(initialMatches);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const [competitionName, setCompetitionName] = React.useState("Championnat");
  const [competitionLevel, setCompetitionLevel] = React.useState<"club" | "national" | "international">("national");
  const [competitionStatus, setCompetitionStatus] = React.useState<"draft" | "published" | "archived">("draft");

  const [teamName, setTeamName] = React.useState("Equipe A");
  const [teamCategory, setTeamCategory] = React.useState("");

  const [matchCompetitionId, setMatchCompetitionId] = React.useState<string>("");
  const [homeTeamId, setHomeTeamId] = React.useState<string>("");
  const [awayTeamId, setAwayTeamId] = React.useState<string>("");
  const [startsAt, setStartsAt] = React.useState<string>(() => new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  const [venue, setVenue] = React.useState("Patinoire");

  async function refresh() {
    // Mock data refresh - in a real app this would fetch from API
    console.log('Refreshing sport data...');
    // For now, we'll keep the existing state
  }

  async function createCompetition(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // Mock API call - in a real app this would POST to API
      console.log('Creating competition:', { name: competitionName, level: competitionLevel, status: competitionStatus });
      
      // Add to local state as mock
      const newCompetition: CompetitionRow = {
        id: Date.now().toString(),
        name: competitionName,
        level: competitionLevel,
        status: competitionStatus,
        created_at: new Date().toISOString()
      };
      
      setCompetitions(prev => [...prev, newCompetition]);
      setCompetitionName("Championnat");
      setCompetitionLevel("national");
      setCompetitionStatus("draft");
      
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // Mock API call - in a real app this would POST to API
      console.log('Creating team:', { name: teamName, category: teamCategory });
      
      // Add to local state as mock
      const newTeam: TeamRow = {
        id: Date.now().toString(),
        org_id: "1",
        name: teamName,
        category: teamCategory || null,
        status: "active"
      };
      
      setTeams(prev => [...prev, newTeam]);
      setTeamName("Equipe A");
      setTeamCategory("");
      
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function createMatch(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // Mock API call - in a real app this would POST to API
      const iso = new Date(startsAt).toISOString();
      console.log('Creating match:', {
        competitionId: matchCompetitionId,
        homeTeamId,
        awayTeamId,
        startsAt: iso,
        venue: venue
      });
      
      // Add to local state as mock
      const homeTeam = teams.find(t => t.id === homeTeamId);
      const awayTeam = teams.find(t => t.id === awayTeamId);
      const competition = competitions.find(c => c.id === matchCompetitionId);
      
      if (homeTeam && awayTeam) {
        const newMatch: MatchRow = {
          id: Date.now().toString(),
          competition_id: matchCompetitionId || null,
          competition_name: competition?.name || null,
          starts_at: iso,
          venue: venue || null,
          status: "scheduled",
          home_team_name: homeTeam.name,
          away_team_name: awayTeam.name
        };
        
        setMatches(prev => [...prev, newMatch]);
        setMatchCompetitionId("");
        setHomeTeamId("");
        setAwayTeamId("");
        setStartsAt(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
        setVenue("Patinoire");
      }
      
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      {error ? (
        <div className="rounded-2xl border border-error-500/20 bg-error-500/10 px-4 py-3 text-sm font-semibold text-error-500">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
          <div className="text-lg font-semibold text-gray-800">Compétition</div>
          <form className="mt-4 grid gap-3" onSubmit={createCompetition}>
            <input
              className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              value={competitionName}
              onChange={(e) => setCompetitionName(e.target.value)}
              required
            />
            <select
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              value={competitionLevel}
              onChange={(e) => setCompetitionLevel(e.target.value as any)}
            >
              <option value="club">club</option>
              <option value="national">national</option>
              <option value="international">international</option>
            </select>
            <select
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              value={competitionStatus}
              onChange={(e) => setCompetitionStatus(e.target.value as any)}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
            <button
              disabled={busy}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? "..." : "Créer"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
          <div className="text-lg font-semibold text-gray-800">Équipe</div>
          <form className="mt-4 grid gap-3" onSubmit={createTeam}>
            <input
              className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
            <input
              className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              value={teamCategory}
              onChange={(e) => setTeamCategory(e.target.value)}
              placeholder="Catégorie (optionnel)"
            />
            <button
              disabled={busy}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? "..." : "Créer"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
          <div className="text-lg font-semibold text-gray-800">Match</div>
          <form className="mt-4 grid gap-3" onSubmit={createMatch}>
            <select
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              value={matchCompetitionId}
              onChange={(e) => setMatchCompetitionId(e.target.value)}
            >
              <option value="">(sans compétition)</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              value={homeTeamId}
              onChange={(e) => setHomeTeamId(e.target.value)}
              required
            >
              <option value="">Home team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <select
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              value={awayTeamId}
              onChange={(e) => setAwayTeamId(e.target.value)}
              required
            >
              <option value="">Away team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
            />
            <input
              className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Lieu"
            />
            <button
              disabled={busy}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? "..." : "Créer"}
            </button>
          </form>
          <div className="mt-2 text-xs text-gray-500">Création match réservée à la fédération (MVP).</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-800">Compétitions</div>
            <div className="text-sm text-gray-500">{competitions.length}</div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="border-b border-gray-200 px-3 py-3">Nom</th>
                  <th className="border-b border-gray-200 px-3 py-3">Niveau</th>
                  <th className="border-b border-gray-200 px-3 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {competitions.map((c) => (
                  <tr key={c.id} className="text-sm text-gray-700">
                    <td className="border-b border-gray-100 px-3 py-3 font-medium text-gray-800">{c.name}</td>
                    <td className="border-b border-gray-100 px-3 py-3">{c.level}</td>
                    <td className="border-b border-gray-100 px-3 py-3">
                      <span className="rounded-lg bg-brand-500/10 px-2 py-1 text-xs font-semibold text-brand-700">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-800">Matchs</div>
            <div className="text-sm text-gray-500">{matches.length}</div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="border-b border-gray-200 px-3 py-3">Date</th>
                  <th className="border-b border-gray-200 px-3 py-3">Match</th>
                  <th className="border-b border-gray-200 px-3 py-3">Compétition</th>
                  <th className="border-b border-gray-200 px-3 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id} className="text-sm text-gray-700">
                    <td className="border-b border-gray-100 px-3 py-3 text-gray-600">
                      {new Date(m.starts_at).toLocaleString()}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-3 font-medium text-gray-800">
                      {m.home_team_name} vs {m.away_team_name}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-3">{m.competition_name ?? "—"}</td>
                    <td className="border-b border-gray-100 px-3 py-3">
                      <span className="rounded-lg bg-brand-500/10 px-2 py-1 text-xs font-semibold text-brand-700">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}







