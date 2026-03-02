"use client";

import * as React from "react";

// Types matching the page
type Competition = {
  id: string;
  name: string;
  season: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  category: string;
  type: 'league' | 'cup';
  cupTeamCount?: number | null;
  participantCount: number;
};

type Club = {
  id: string;
  name: string;
  acronym: string;
  status: 'active' | 'inactive';
  assignedCompetitions: string[];
  logoDocumentId?: string;
};

type Match = {
  id: string;
  competitionId: string;
  competitionName: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  date: string;
  time: string;
  venue: string;
  round?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
  homeScore: number | null;
  awayScore: number | null;
  resultType?: 'regulation' | 'overtime' | 'shootout';
  refereeId: string | null;
  refereeName: string | null;
};

type Player = {
  id: string;
  firstName: string;
  lastName: string;
  clubId: string;
  clubName: string;
  position: string;
  jerseyNumber: number;
};

type MatchEvent = {
  id: string;
  type: 'goal' | 'shot' | 'penalty';
  teamId: string;
  playerId: string;
  assistIds?: string[];
  period?: 'regulation' | 'overtime';
  strength?: 'even' | 'power_play' | 'short_handed';
  isGameWinningGoal?: boolean;
  pim?: number;
  plusMinusDelta?: number;
};

type MatchSheet = {
  id: string;
  matchId: string;
  status: 'draft' | 'validated';
  updatedAt: string;
  homeTeamId: string;
  awayTeamId: string;
  homeRoster: string[];
  awayRoster: string[];
  events: MatchEvent[];
};

type PlayerStats = {
  playerId: string;
  playerName: string;
  clubName: string;
  matchesPlayed: number;
  goals: number;
  assists: number;
  points: number;
};

type ManualPlayerStats = {
  playerId: string;
  competitionId: string;
  matchesPlayed: number;
  goals: number;
  assists: number;
  updatedAt: string;
};

type Season = {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
};

type PlayerStatsLine = PlayerStats & {
  source: 'manual' | 'auto';
  lastUpdated?: string;
};

function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder,
  className 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  options: { value: string; label: string; logoUrl?: string }[]; 
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        className="w-full border border-gray-200 rounded-lg py-2 pl-3 pr-8 bg-white cursor-pointer flex items-center min-h-[38px] text-sm relative hover:border-brand-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? (
          <div className="flex items-center gap-2">
            {selectedOption.logoUrl && (
              <img src={selectedOption.logoUrl} alt="" className="w-5 h-5 object-contain" />
            )}
            <span className="truncate text-gray-800 font-medium">{selectedOption.label}</span>
          </div>
        ) : (
          <span className="text-gray-400">{placeholder || "Sélectionner..."}</span>
        )}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-400 text-sm italic">Aucune option</div>
          ) : (
            options.map(option => (
              <div
                key={option.value}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 transition-colors ${option.value === value ? 'bg-brand-50 text-brand-900 font-medium' : 'text-gray-700'}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.logoUrl && (
                  <img src={option.logoUrl} alt="" className="w-5 h-5 object-contain" />
                )}
                <span>{option.label}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function CompetitionManagementSystem({
  initialCompetitions,
  initialClubs,
  initialMatches,
  initialPlayers,
  initialMatchSheets,
  initialManualPlayerStats,
  initialPlayerStats
  ,
  isAdmin
}: {
  initialCompetitions: Competition[];
  initialClubs: Club[];
  initialMatches: Match[];
  initialPlayers: Player[];
  initialMatchSheets: MatchSheet[];
  initialManualPlayerStats: ManualPlayerStats[];
  initialPlayerStats: PlayerStats[];
  isAdmin?: boolean;
}) {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'competitions' | 'clubs' | 'matches' | 'statistics'>('dashboard');
  const [competitions, setCompetitions] = React.useState(initialCompetitions);
  const [clubs, setClubs] = React.useState(initialClubs);
  const [matches, setMatches] = React.useState(initialMatches);
  const [players] = React.useState(initialPlayers);
  const [matchSheets, setMatchSheets] = React.useState(initialMatchSheets);
  const [manualPlayerStats, setManualPlayerStats] = React.useState(initialManualPlayerStats);
  const [playerStatsFallback] = React.useState(initialPlayerStats);
  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(null);
  const [showMatchSheet, setShowMatchSheet] = React.useState(false);
  const [isCreateCompetitionOpen, setIsCreateCompetitionOpen] = React.useState(false);
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [seasonsError, setSeasonsError] = React.useState<string | null>(null);
  const [createCompetitionForm, setCreateCompetitionForm] = React.useState({
    name: "",
    season: "",
    startDate: "",
    endDate: "",
    type: "league" as Competition["type"],
    clubIds: [] as string[],
  });
  const [createCompetitionError, setCreateCompetitionError] = React.useState<string | null>(null);
  const [createCompetitionSaving, setCreateCompetitionSaving] = React.useState(false);
  const [isEditCompetitionOpen, setIsEditCompetitionOpen] = React.useState(false);
  const [editCompetitionForm, setEditCompetitionForm] = React.useState({
    id: "",
    name: "",
    season: "",
    startDate: "",
    endDate: "",
    type: "league" as Competition["type"],
    cupTeamCount: "",
  });
  const [editCompetitionError, setEditCompetitionError] = React.useState<string | null>(null);
  const [editCompetitionSaving, setEditCompetitionSaving] = React.useState(false);
  const [isCreateMatchOpen, setIsCreateMatchOpen] = React.useState(false);
  const [createMatchForm, setCreateMatchForm] = React.useState({
    competitionId: "",
    homeTeamId: "",
    awayTeamId: "",
    date: "",
    time: "",
    venue: "",
    round: "",
  });
  const [createMatchError, setCreateMatchError] = React.useState<string | null>(null);
  const [createMatchSaving, setCreateMatchSaving] = React.useState(false);
  const [isEditMatchOpen, setIsEditMatchOpen] = React.useState(false);
  const [editMatchForm, setEditMatchForm] = React.useState({
    id: "",
    competitionId: "",
    homeTeamId: "",
    awayTeamId: "",
    date: "",
    time: "",
    venue: "",
    round: "",
  });
  const [editMatchError, setEditMatchError] = React.useState<string | null>(null);
  const [editMatchSaving, setEditMatchSaving] = React.useState(false);
  const [cupSchemaCompetition, setCupSchemaCompetition] = React.useState<Competition | null>(null);
  const [cupSchemaTab, setCupSchemaTab] = React.useState<"manual" | "draw">("manual");
  const [cupSchemaForm, setCupSchemaForm] = React.useState({
    homeTeamId: "",
    awayTeamId: "",
    date: "",
    time: "",
    venue: "",
  });
  const [cupSchemaError, setCupSchemaError] = React.useState<string | null>(null);
  const [cupSchemaSaving, setCupSchemaSaving] = React.useState(false);
  const [clubAssignmentCompetition, setClubAssignmentCompetition] = React.useState<Competition | null>(null);
  const [clubAssignmentIds, setClubAssignmentIds] = React.useState<string[]>([]);
  const [clubAssignmentError, setClubAssignmentError] = React.useState<string | null>(null);
  const [clubAssignmentSaving, setClubAssignmentSaving] = React.useState(false);
  const [matchSheetError, setMatchSheetError] = React.useState<string | null>(null);
  const [matchSheetSaving, setMatchSheetSaving] = React.useState(false);
  const [matchSheetForm, setMatchSheetForm] = React.useState({
    homeRoster: [] as string[],
    awayRoster: [] as string[],
    events: [] as MatchEvent[],
    homeScore: "",
    awayScore: "",
    status: "draft" as MatchSheet["status"]
  });
  const [matchSheetTab, setMatchSheetTab] = React.useState<'roster' | 'events' | 'summary'>('roster');

  // Dashboard metrics
  const activeCompetitions = competitions.filter(c => c.status === 'active').length;
  const upcomingMatches = matches.filter(m => m.status === 'scheduled').length;
  const totalClubs = clubs.filter(c => c.status === 'active').length;
  const recentMatches = matches.filter(m => m.status === 'completed').slice(0, 5);
  const activeCompetitionsForStats = competitions.filter(c => c.status === 'active');
  const leagueCompetitions = activeCompetitionsForStats.filter(c => c.type === 'league');
  const cupCompetitions = activeCompetitionsForStats.filter(c => c.type === 'cup');
  const cupSchemaClubs = cupSchemaCompetition
    ? clubs.filter((club) => club.status === "active" && club.assignedCompetitions?.includes(cupSchemaCompetition.id))
    : [];
  const cupSchemaMatches = cupSchemaCompetition
    ? matches
        .filter((match) => match.competitionId === cupSchemaCompetition.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const playerDirectory = React.useMemo(() => {
    const directory = new Map<string, { name: string; clubName: string }>();
    players.forEach((player) => {
      directory.set(player.id, {
        name: `${player.firstName} ${player.lastName}`,
        clubName: player.clubName
      });
    });
    playerStatsFallback.forEach((stat) => {
      if (!directory.has(stat.playerId)) {
        directory.set(stat.playerId, { name: stat.playerName, clubName: stat.clubName });
      }
    });
    return directory;
  }, [players, playerStatsFallback]);

  const matchGoalSummaryByMatchId = React.useMemo(() => {
    const map = new Map<string, { teamId: string; scorer: string; assists: string[] }[]>();
    const getPlayerName = (playerId: string) => playerDirectory.get(playerId)?.name || "—";
    const matchLookup = new Map(matches.map((match) => [match.id, match]));
    matchSheets.forEach((sheet) => {
      const match = matchLookup.get(sheet.matchId);
      if (!match || match.status !== "completed") return;
      const goals = sheet.events
        .filter((event) => event.type === "goal")
        .map((event) => ({
          teamId: event.teamId,
          scorer: getPlayerName(event.playerId),
          assists: (event.assistIds || []).filter(Boolean).map(getPlayerName)
        }));
      map.set(sheet.matchId, goals);
    });
    return map;
  }, [matchSheets, matches, playerDirectory]);

  const homeTeamPlayers = React.useMemo(() => {
    if (!selectedMatch) return [];
    return players.filter((player) => player.clubId === selectedMatch.homeTeamId);
  }, [players, selectedMatch]);

  const awayTeamPlayers = React.useMemo(() => {
    if (!selectedMatch) return [];
    return players.filter((player) => player.clubId === selectedMatch.awayTeamId);
  }, [players, selectedMatch]);

  const manualStatsByCompetition = React.useMemo(() => {
    const byCompetition = new Map<string, Map<string, ManualPlayerStats>>();
    manualPlayerStats.forEach((entry) => {
      if (!byCompetition.has(entry.competitionId)) {
        byCompetition.set(entry.competitionId, new Map());
      }
      byCompetition.get(entry.competitionId)!.set(entry.playerId, entry);
    });
    return byCompetition;
  }, [manualPlayerStats]);

  const autoStatsByCompetition = React.useMemo(() => {
    const statsByCompetition = new Map<string, Map<string, { matchesPlayed: number; goals: number; assists: number; points: number }>>();
    const updatedByCompetition = new Map<string, Map<string, string>>();
    const matchMap = new Map(matches.map((match) => [match.id, match]));

    const ensurePlayer = (competitionId: string, playerId: string) => {
      if (!statsByCompetition.has(competitionId)) {
        statsByCompetition.set(competitionId, new Map());
      }
      const compMap = statsByCompetition.get(competitionId)!;
      if (!compMap.has(playerId)) {
        compMap.set(playerId, { matchesPlayed: 0, goals: 0, assists: 0, points: 0 });
      }
      return compMap.get(playerId)!;
    };

    const registerUpdate = (competitionId: string, playerId: string, updatedAt: string) => {
      if (!updatedByCompetition.has(competitionId)) {
        updatedByCompetition.set(competitionId, new Map());
      }
      const compMap = updatedByCompetition.get(competitionId)!;
      const previous = compMap.get(playerId);
      if (!previous || new Date(updatedAt).getTime() > new Date(previous).getTime()) {
        compMap.set(playerId, updatedAt);
      }
    };

    matchSheets.forEach((sheet) => {
      const match = matchMap.get(sheet.matchId);
      if (!match || match.status !== "completed" || sheet.status !== "validated") {
        return;
      }

      const competitionId = match.competitionId;

      const roster = [...sheet.homeRoster, ...sheet.awayRoster];
      roster.forEach((playerId) => {
        const stats = ensurePlayer(competitionId, playerId);
        stats.matchesPlayed += 1;
        registerUpdate(competitionId, playerId, sheet.updatedAt);
      });

      sheet.events.forEach((event) => {
        if (event.type !== "goal") return;

        const scorer = ensurePlayer(competitionId, event.playerId);
        scorer.goals += 1;
        registerUpdate(competitionId, event.playerId, sheet.updatedAt);

        (event.assistIds || []).forEach((assistId) => {
          const assist = ensurePlayer(competitionId, assistId);
          assist.assists += 1;
          registerUpdate(competitionId, assistId, sheet.updatedAt);
        });
      });
    });

    statsByCompetition.forEach((compMap) => {
      compMap.forEach((stat) => {
        stat.points = stat.goals + stat.assists;
      });
    });

    return { statsByCompetition, updatedByCompetition };
  }, [matchSheets, matches]);

  const playerLeaderboardByCompetition = React.useMemo(() => {
    const leaderboards = new Map<string, PlayerStatsLine[]>();
    const competitionIds = competitions.filter((c) => c.status === "active").map((c) => c.id);

    competitionIds.forEach((competitionId) => {
      const autoComp = autoStatsByCompetition.statsByCompetition.get(competitionId) || new Map();
      const manualComp = manualStatsByCompetition.get(competitionId) || new Map();
      const autoUpdated = autoStatsByCompetition.updatedByCompetition.get(competitionId) || new Map();

      const allPlayerIds = new Set<string>([...autoComp.keys(), ...manualComp.keys()]);
      const lines: PlayerStatsLine[] = [];

      allPlayerIds.forEach((playerId) => {
        const baseInfo = playerDirectory.get(playerId) || { name: "—", clubName: "—" };
        const auto = autoComp.get(playerId) || { matchesPlayed: 0, goals: 0, assists: 0, points: 0 };
        const manual = manualComp.get(playerId);
        const autoUpdatedAt = autoUpdated.get(playerId);
        const useManual =
          !!manual && (!autoUpdatedAt || new Date(manual.updatedAt).getTime() > new Date(autoUpdatedAt).getTime());

        const chosen = useManual
          ? {
              matchesPlayed: manual!.matchesPlayed,
              goals: manual!.goals,
              assists: manual!.assists,
              points: manual!.goals + manual!.assists
            }
          : auto;

        lines.push({
          playerId,
          playerName: baseInfo.name,
          clubName: baseInfo.clubName,
          matchesPlayed: chosen.matchesPlayed,
          goals: chosen.goals,
          assists: chosen.assists,
          points: chosen.points,
          source: useManual ? "manual" : "auto",
          lastUpdated: useManual ? manual!.updatedAt : autoUpdatedAt
        });
      });

      lines.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goals !== a.goals) return b.goals - a.goals;
        if (b.assists !== a.assists) return b.assists - a.assists;
        return b.matchesPlayed - a.matchesPlayed;
      });

      leaderboards.set(competitionId, lines);
    });

    return leaderboards;
  }, [autoStatsByCompetition, competitions, manualStatsByCompetition, playerDirectory]);

  const standingsByCompetition = React.useMemo(() => {
    const standings = new Map<string, Map<string, {
      clubId: string;
      clubName: string;
      gp: number;
      w: number;
      l: number;
      ot: number;
      pts: number;
      gf: number;
      ga: number;
      gd: number;
    }>>();

    const ensureClub = (competitionId: string, clubId: string, clubName: string) => {
      if (!standings.has(competitionId)) {
        standings.set(competitionId, new Map());
      }
      const compMap = standings.get(competitionId)!;
      if (!compMap.has(clubId)) {
        compMap.set(clubId, {
          clubId,
          clubName,
          gp: 0,
          w: 0,
          l: 0,
          ot: 0,
          pts: 0,
          gf: 0,
          ga: 0,
          gd: 0
        });
      }
      return compMap.get(clubId)!;
    };

    matches.forEach((match) => {
      if (match.status !== "completed" || match.homeScore === null || match.awayScore === null) {
        return;
      }
      const home = ensureClub(match.competitionId, match.homeTeamId, match.homeTeamName);
      const away = ensureClub(match.competitionId, match.awayTeamId, match.awayTeamName);

      home.gp += 1;
      away.gp += 1;
      home.gf += match.homeScore;
      home.ga += match.awayScore;
      away.gf += match.awayScore;
      away.ga += match.homeScore;

      const isOvertime = match.resultType === "overtime" || match.resultType === "shootout";
      if (match.homeScore > match.awayScore) {
        home.w += 1;
        home.pts += isOvertime ? 2 : 3;
        if (isOvertime) {
          away.ot += 1;
          away.pts += 1;
        } else {
          away.l += 1;
        }
      } else if (match.awayScore > match.homeScore) {
        away.w += 1;
        away.pts += isOvertime ? 2 : 3;
        if (isOvertime) {
          home.ot += 1;
          home.pts += 1;
        } else {
          home.l += 1;
        }
      } else {
        home.pts += 1;
        away.pts += 1;
      }

      home.gd = home.gf - home.ga;
      away.gd = away.gf - away.ga;
    });

    return standings;
  }, [matches]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      upcoming: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'À venir' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Terminée' },
      scheduled: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Programmé' },
      in_progress: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'En cours' },
      postponed: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Reporté' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulé' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getCompetitionTypeLabel = (type: Competition["type"]) => {
    return type === "cup" ? "Coupe" : "Ligue";
  };

  const getCupRounds = (teamCount?: number | null) => {
    if (!teamCount || teamCount < 2) return [];
    const powerOfTwo = 2 ** Math.ceil(Math.log2(teamCount));
    const roundsCount = Math.log2(powerOfTwo);
    return Array.from({ length: roundsCount }, (_, index) => {
      const matchCount = powerOfTwo / (2 ** (index + 1));
      let label = `Tour ${index + 1}`;
      if (matchCount === 1) label = "Finale";
      else if (matchCount === 2) label = "Demi-finales";
      else if (matchCount === 4) label = "Quarts de finale";
      else if (matchCount === 8) label = "8èmes de finale";
      else if (matchCount === 16) label = "16èmes de finale";
      
      return {
        label,
        matchCount,
      };
    });
  };

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setCreateCompetitionError(null);
    if (!createCompetitionForm.name || !createCompetitionForm.season || !createCompetitionForm.startDate || !createCompetitionForm.endDate || !createCompetitionForm.type) {
      setCreateCompetitionError("Veuillez remplir tous les champs.");
      return;
    }
    const selectedClubIds = Array.from(new Set((createCompetitionForm.clubIds || []).filter(Boolean)));
    if (selectedClubIds.length < 2) {
      setCreateCompetitionError("Veuillez sélectionner au moins 2 clubs.");
      return;
    }
    const start = new Date(createCompetitionForm.startDate);
    const end = new Date(createCompetitionForm.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setCreateCompetitionError("Dates invalides.");
      return;
    }
    if (end.getTime() < start.getTime()) {
      setCreateCompetitionError("La date de fin doit être après la date de début.");
      return;
    }
    setCreateCompetitionSaving(true);
    try {
      const res = await fetch("/api/sport/competitions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: createCompetitionForm.name,
          season: createCompetitionForm.season,
          startDate: createCompetitionForm.startDate,
          endDate: createCompetitionForm.endDate,
          type: createCompetitionForm.type,
          cupTeamCount: createCompetitionForm.type === "cup" ? selectedClubIds.length : undefined,
          clubIds: selectedClubIds,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        setCreateCompetitionError(text || "Impossible de créer la compétition.");
        return;
      }
      const created = await res.json();
      setCompetitions((prev) => [
        {
          ...created,
          category: "",
          type: created.type || createCompetitionForm.type || "league",
          cupTeamCount: created.cupTeamCount ?? (createCompetitionForm.type === "cup" ? selectedClubIds.length : null),
        },
        ...prev,
      ]);
      setIsCreateCompetitionOpen(false);
      setCreateCompetitionForm({ name: "", season: "", startDate: "", endDate: "", type: "league", clubIds: [] });
    } finally {
      setCreateCompetitionSaving(false);
    }
  };

  const openEditCompetition = (competition: Competition) => {
    setEditCompetitionForm({
      id: competition.id,
      name: competition.name,
      season: competition.season,
      startDate: getDateInputValue(competition.startDate),
      endDate: getDateInputValue(competition.endDate),
      type: competition.type,
      cupTeamCount: competition.cupTeamCount ? String(competition.cupTeamCount) : "",
    });
    setEditCompetitionError(null);
    setIsEditCompetitionOpen(true);
  };

  const handleUpdateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setEditCompetitionError(null);
    if (!editCompetitionForm.name || !editCompetitionForm.season || !editCompetitionForm.startDate || !editCompetitionForm.endDate) {
      setEditCompetitionError("Veuillez remplir tous les champs.");
      return;
    }
    const cupTeamCountValue = Number(editCompetitionForm.cupTeamCount);
    if (editCompetitionForm.type === "cup") {
      if (!Number.isFinite(cupTeamCountValue) || !Number.isInteger(cupTeamCountValue) || cupTeamCountValue < 2) {
        setEditCompetitionError("Veuillez saisir un nombre d'équipes valide (minimum 2) pour la coupe.");
        return;
      }
    }
    const start = new Date(editCompetitionForm.startDate);
    const end = new Date(editCompetitionForm.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setEditCompetitionError("Dates invalides.");
      return;
    }
    if (end.getTime() < start.getTime()) {
      setEditCompetitionError("La date de fin doit être après la date de début.");
      return;
    }
    setEditCompetitionSaving(true);
    try {
      const res = await fetch(`/api/sport/competitions/${editCompetitionForm.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: editCompetitionForm.name,
          season: editCompetitionForm.season,
          startDate: editCompetitionForm.startDate,
          endDate: editCompetitionForm.endDate,
          type: editCompetitionForm.type,
          cupTeamCount: editCompetitionForm.type === "cup" ? cupTeamCountValue : undefined,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        setEditCompetitionError(text || "Impossible de modifier la compétition.");
        return;
      }
      const updated = await res.json();
      setCompetitions((prev) =>
        prev.map((competition) =>
          competition.id === editCompetitionForm.id
            ? {
                ...competition,
                ...updated,
                category: competition.category,
                type: updated.type || editCompetitionForm.type,
                cupTeamCount: updated.cupTeamCount ?? (editCompetitionForm.type === "cup" ? cupTeamCountValue : null),
              }
            : competition
        )
      );
      setMatches((prev) =>
        prev.map((match) =>
          match.competitionId === editCompetitionForm.id
            ? { ...match, competitionName: updated.name }
            : match
        )
      );
      setIsEditCompetitionOpen(false);
    } finally {
      setEditCompetitionSaving(false);
    }
  };

  const handleDeleteCompetition = async (competition: Competition) => {
    if (!isAdmin) return;
    const confirmed = window.confirm("Supprimer cette compétition ? Cette action est irréversible.");
    if (!confirmed) return;
    const matchIdsToRemove = matches
      .filter((match) => match.competitionId === competition.id)
      .map((match) => match.id);
    try {
      const res = await fetch(`/api/sport/competitions/${competition.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        return;
      }
      setCompetitions((prev) => prev.filter((item) => item.id !== competition.id));
      setMatches((prev) => prev.filter((match) => match.competitionId !== competition.id));
      setMatchSheets((prev) => prev.filter((sheet) => !matchIdsToRemove.includes(sheet.matchId)));
      setManualPlayerStats((prev) => prev.filter((stat) => stat.competitionId !== competition.id));
    } finally {
      if (cupSchemaCompetition?.id === competition.id) {
        setCupSchemaCompetition(null);
      }
      if (clubAssignmentCompetition?.id === competition.id) {
        setClubAssignmentCompetition(null);
      }
    }
  };

  const createEventId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const openMatchSheet = (match: Match) => {
    const existingSheet = matchSheets.find((sheet) => sheet.matchId === match.id);
    const normalizedEvents = (existingSheet?.events || []).map((event) => ({
      ...event,
      id: event.id || createEventId(),
      period: event.period || "regulation"
    }));
    setSelectedMatch(match);
    setMatchSheetTab("roster");
    setMatchSheetForm({
      homeRoster: existingSheet?.homeRoster || [],
      awayRoster: existingSheet?.awayRoster || [],
      events: normalizedEvents,
      homeScore: match.homeScore !== null ? String(match.homeScore) : "",
      awayScore: match.awayScore !== null ? String(match.awayScore) : "",
      status: existingSheet?.status || "draft"
    });
    setMatchSheetError(null);
    setShowMatchSheet(true);
  };

  const toggleRosterPlayer = (team: "home" | "away", playerId: string) => {
    setMatchSheetForm((prev) => {
      const rosterKey = team === "home" ? "homeRoster" : "awayRoster";
      const roster = prev[rosterKey];
      const nextRoster = roster.includes(playerId)
        ? roster.filter((id) => id !== playerId)
        : [...roster, playerId];
      return { ...prev, [rosterKey]: nextRoster };
    });
  };

  const addMatchEvent = (teamId?: string, type: MatchEvent["type"] = "goal") => {
    if (!selectedMatch) return;
    const defaultTeamId = teamId || selectedMatch.homeTeamId;
    const defaultPlayer = players.find((p) => p.clubId === defaultTeamId);
    setMatchSheetForm((prev) => ({
      ...prev,
      events: [
        {
          id: createEventId(),
          type: type,
          teamId: defaultTeamId,
          playerId: defaultPlayer?.id || "",
          assistIds: [],
          period: "regulation"
        },
        ...prev.events
      ]
    }));
  };

  const updateMatchEvent = (eventId: string, patch: Partial<MatchEvent>) => {
    setMatchSheetForm((prev) => ({
      ...prev,
      events: prev.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              ...patch,
              assistIds: patch.assistIds ? patch.assistIds.filter(Boolean) : event.assistIds
            }
          : event,
      )
    }));
  };

  const removeMatchEvent = (eventId: string) => {
    setMatchSheetForm((prev) => ({
      ...prev,
      events: prev.events.filter((event) => event.id !== eventId)
    }));
  };

  const saveMatchSheet = async (nextStatus: MatchSheet["status"]) => {
    if (!selectedMatch) return;
    setMatchSheetError(null);
    const sanitizedEvents = matchSheetForm.events.filter((event) => event.playerId && event.teamId);
    const hasIncompleteEvent = matchSheetForm.events.some((event) => !event.playerId || !event.teamId);
    const derived = sanitizedEvents.reduce(
      (acc, event) => {
        if ((event.period || "regulation") === "overtime") acc.hasOvertime = true;
        if (event.type === "goal") {
          if (event.teamId === selectedMatch.homeTeamId) acc.home += 1;
          else if (event.teamId === selectedMatch.awayTeamId) acc.away += 1;
        }
        return acc;
      },
      { home: 0, away: 0, hasOvertime: false },
    );
    if (nextStatus === "validated") {
      if (hasIncompleteEvent) {
        setMatchSheetError("Complétez tous les buteurs et équipes avant de valider.");
        return;
      }
      if (matchSheetForm.homeRoster.length === 0 || matchSheetForm.awayRoster.length === 0) {
        setMatchSheetError("Sélectionnez les joueurs des deux équipes.");
        return;
      }
      const rosterSet = new Set([...matchSheetForm.homeRoster, ...matchSheetForm.awayRoster]);
      const invalidEvent = sanitizedEvents.find((event) => !rosterSet.has(event.playerId));
      if (invalidEvent) {
        setMatchSheetError("Les buteurs doivent appartenir aux effectifs sélectionnés.");
        return;
      }
      const invalidAssist = sanitizedEvents.find((event) =>
        (event.assistIds || []).some((assistId) => assistId && !rosterSet.has(assistId)),
      );
      if (invalidAssist) {
        setMatchSheetError("Les passeurs doivent appartenir aux effectifs sélectionnés.");
        return;
      }
      if (derived.home === derived.away) {
        setMatchSheetError("Match nul interdit. Ajoutez un but en prolongation.");
        return;
      }
    }
    setMatchSheetSaving(true);
    try {
      const res = await fetch(`/api/sport/match-sheets/${selectedMatch.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          homeRoster: matchSheetForm.homeRoster,
          awayRoster: matchSheetForm.awayRoster,
          events: sanitizedEvents.map((event) => ({
            type: event.type,
            teamId: event.teamId,
            playerId: event.playerId,
            assistIds: event.assistIds || [],
            period: event.period || "regulation"
          }))
        })
      });
      if (!res.ok) {
        const text = await res.text();
        setMatchSheetError(text || "Impossible d’enregistrer la feuille de match.");
        return;
      }
      const data = await res.json();
      if (data?.sheet) {
        setMatchSheets((prev) => {
          const index = prev.findIndex((sheet) => sheet.matchId === data.sheet.matchId);
          if (index === -1) return [data.sheet, ...prev];
          const next = [...prev];
          next[index] = data.sheet;
          return next;
        });
      }
      if (data?.match) {
        setMatches((prev) => prev.map((m) => (m.id === data.match.id ? data.match : m)));
        setSelectedMatch(data.match);
      }
      setMatchSheetForm((prev) => ({ ...prev, status: nextStatus }));
    } finally {
      setMatchSheetSaving(false);
    }
  };

  const derivedMatchScore = React.useMemo(() => {
    if (!selectedMatch) return { home: 0, away: 0, hasOvertime: false };
    return matchSheetForm.events.reduce(
      (acc, event) => {
        if ((event.period || "regulation") === "overtime") acc.hasOvertime = true;
        if (event.type === "goal") {
          if (event.teamId === selectedMatch.homeTeamId) acc.home += 1;
          else if (event.teamId === selectedMatch.awayTeamId) acc.away += 1;
        }
        return acc;
      },
      { home: 0, away: 0, hasOvertime: false },
    );
  }, [matchSheetForm.events, selectedMatch]);

  const getDefaultMatchDateTime = () => {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");
    return {
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}`
    };
  };

  const getDateInputValue = (value: string) => {
    if (!value) return "";
    if (value.length >= 10 && value.includes("-")) return value.slice(0, 10);
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const openCreateMatch = () => {
    if (!isAdmin) return;
    const defaults = getDefaultMatchDateTime();
    const defaultCompetition = competitions[0]?.id || "";
    const activeClubs = clubs.filter((club) => club.status === "active");
    const defaultHome = activeClubs[0]?.id || "";
    const defaultAway = activeClubs.find((club) => club.id !== defaultHome)?.id || "";
    setCreateMatchForm((prev) => ({
      competitionId: prev.competitionId || defaultCompetition,
      homeTeamId: prev.homeTeamId || defaultHome,
      awayTeamId: prev.awayTeamId || defaultAway,
      date: prev.date || defaults.date,
      time: prev.time || defaults.time,
      venue: prev.venue || "",
      round: prev.round || ""
    }));
    setCreateMatchError(null);
    setIsCreateMatchOpen(true);
  };

  const openEditMatch = (match: Match) => {
    if (!isAdmin) return;
    setEditMatchForm({
      id: match.id,
      competitionId: match.competitionId,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      date: getDateInputValue(match.date),
      time: match.time,
      venue: match.venue || "",
      round: match.round || "",
    });
    setEditMatchError(null);
    setIsEditMatchOpen(true);
  };

  const handleUpdateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setEditMatchError(null);
    if (
      !editMatchForm.competitionId ||
      !editMatchForm.date ||
      !editMatchForm.time
    ) {
      setEditMatchError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (editMatchForm.homeTeamId && editMatchForm.awayTeamId && editMatchForm.homeTeamId === editMatchForm.awayTeamId) {
      setEditMatchError("Les équipes doivent être différentes.");
      return;
    }
    const matchDate = new Date(`${editMatchForm.date}T${editMatchForm.time}`);
    if (isNaN(matchDate.getTime())) {
      setEditMatchError("Date et heure invalides.");
      return;
    }
    setEditMatchSaving(true);
    try {
      const res = await fetch(`/api/sport/matches/${editMatchForm.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          competitionId: editMatchForm.competitionId,
          homeTeamId: editMatchForm.homeTeamId,
          awayTeamId: editMatchForm.awayTeamId,
          date: matchDate.toISOString(),
          venue: editMatchForm.venue || undefined,
          round: editMatchForm.round || undefined
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        setEditMatchError(text || "Impossible de modifier le match.");
        return;
      }
      const updated = await res.json();
      setMatches((prev) => prev.map((match) => (match.id === editMatchForm.id ? updated : match)));
      if (selectedMatch?.id === editMatchForm.id) {
        setSelectedMatch(updated);
      }
      setIsEditMatchOpen(false);
    } finally {
      setEditMatchSaving(false);
    }
  };

  const handleDeleteMatch = async (match: Match) => {
    if (!isAdmin) return;
    const confirmed = window.confirm("Supprimer ce match programmé ? Cette action est irréversible.");
    if (!confirmed) return;
    const targetId = match.id;
    try {
      const res = await fetch(`/api/sport/matches/${targetId}`, { method: "DELETE" });
      if (!res.ok) {
        return;
      }
      setMatches((prev) => prev.filter((item) => item.id !== targetId));
      setMatchSheets((prev) => prev.filter((sheet) => sheet.matchId !== targetId));
      if (selectedMatch?.id === targetId) {
        setSelectedMatch(null);
        setShowMatchSheet(false);
      }
    } finally {
      if (isEditMatchOpen && editMatchForm.id === targetId) {
        setIsEditMatchOpen(false);
      }
    }
  };

  const getCompetitionClubs = (competitionId: string) =>
    clubs.filter((club) => club.status === "active" && club.assignedCompetitions?.includes(competitionId));

  const shuffleTeams = (teamIds: string[]) => {
    const shuffled = [...teamIds];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const addMinutesToTime = (date: string, time: string, minutes: number) => {
    const [hours, mins] = time.split(":").map((value) => Number(value));
    const base = new Date(`${date}T${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`);
    base.setMinutes(base.getMinutes() + minutes);
    const pad = (value: number) => String(value).padStart(2, "0");
    return {
      date: `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`,
      time: `${pad(base.getHours())}:${pad(base.getMinutes())}`,
    };
  };

  const openCupSchema = (competition: Competition) => {
    const defaults = getDefaultMatchDateTime();
    const availableClubs = getCompetitionClubs(competition.id);
    const defaultHome = availableClubs[0]?.id || "";
    const defaultAway = availableClubs.find((club) => club.id !== defaultHome)?.id || "";
    setCupSchemaCompetition(competition);
    setCupSchemaTab("manual");
    setCupSchemaForm({
      homeTeamId: defaultHome,
      awayTeamId: defaultAway,
      date: defaults.date,
      time: defaults.time,
      venue: "",
    });
    setCupSchemaError(null);
  };

  const handleCreateCupMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !cupSchemaCompetition) return;
    setCupSchemaError(null);
    if (!cupSchemaForm.homeTeamId || !cupSchemaForm.awayTeamId || !cupSchemaForm.date || !cupSchemaForm.time) {
      setCupSchemaError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (cupSchemaForm.homeTeamId === cupSchemaForm.awayTeamId) {
      setCupSchemaError("Les équipes doivent être différentes.");
      return;
    }
    const matchDate = new Date(`${cupSchemaForm.date}T${cupSchemaForm.time}`);
    if (isNaN(matchDate.getTime())) {
      setCupSchemaError("Date et heure invalides.");
      return;
    }
    setCupSchemaSaving(true);
    try {
      const res = await fetch("/api/sport/matches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          competitionId: cupSchemaCompetition.id,
          homeTeamId: cupSchemaForm.homeTeamId,
          awayTeamId: cupSchemaForm.awayTeamId,
          date: matchDate.toISOString(),
          venue: cupSchemaForm.venue || undefined,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        setCupSchemaError(text || "Impossible de créer le match.");
        return;
      }
      const created = await res.json();
      setMatches((prev) => [created, ...prev]);
    } finally {
      setCupSchemaSaving(false);
    }
  };

  const handleAutoDraw = async () => {
    if (!isAdmin || !cupSchemaCompetition) return;
    setCupSchemaError(null);
    const availableClubs = getCompetitionClubs(cupSchemaCompetition.id);
    const targetCount = cupSchemaCompetition.cupTeamCount ?? availableClubs.length;

    if (availableClubs.length < 2) {
      setCupSchemaError("Veuillez affecter des équipes à la compétition.");
      return;
    }

    setCupSchemaSaving(true);
    try {
      const defaults =
        cupSchemaForm.date && cupSchemaForm.time
          ? { date: cupSchemaForm.date, time: cupSchemaForm.time }
          : getDefaultMatchDateTime();

      const lockRes = await fetch(`/api/sport/competitions/${cupSchemaCompetition.id}/lock`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          startDate: defaults.date,
          time: defaults.time,
          venue: cupSchemaForm.venue || undefined,
          roundIntervalDays: 7,
          matchIntervalMinutes: 120,
          mode: "auto"
        })
      });

      if (!lockRes.ok) {
        const text = await lockRes.text();
        setCupSchemaError(text || "Impossible de verrouiller la compétition.");
        return;
      }

      const matchesRes = await fetch("/api/sport/matches");
      if (matchesRes.ok) {
        const nextMatches = await matchesRes.json();
        setMatches(nextMatches);
      }

      const competitionsRes = await fetch("/api/sport/competitions");
      if (competitionsRes.ok) {
        const nextCompetitions = await competitionsRes.json();
        setCompetitions(nextCompetitions);
      }

      setCupSchemaCompetition(null);
    } catch (e) {
      setCupSchemaError("Erreur lors de la génération.");
    } finally {
      setCupSchemaSaving(false);
    }
  };

  const getRoundOptions = (competitionId: string) => {
    const competition = competitions.find((c) => c.id === competitionId);
    if (!competition) return [];

    if (competition.type === "cup") {
      return [
        { value: "Tour préliminaire", label: "Tour préliminaire" },
        { value: "32èmes de finale", label: "32èmes de finale" },
        { value: "16èmes de finale", label: "16èmes de finale" },
        { value: "8èmes de finale", label: "8èmes de finale" },
        { value: "Quarts de finale", label: "Quarts de finale" },
        { value: "Demi-finales", label: "Demi-finales" },
        { value: "Finale", label: "Finale" },
      ];
    }
    
    return Array.from({ length: 30 }, (_, i) => ({
      value: `Tour ${i + 1}`,
      label: `Tour ${i + 1}`,
    }));
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setCreateMatchError(null);
    if (
      !createMatchForm.competitionId ||
      !createMatchForm.date ||
      !createMatchForm.time
    ) {
      setCreateMatchError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (createMatchForm.homeTeamId && createMatchForm.awayTeamId && createMatchForm.homeTeamId === createMatchForm.awayTeamId) {
      setCreateMatchError("Les équipes doivent être différentes.");
      return;
    }
    const matchDate = new Date(`${createMatchForm.date}T${createMatchForm.time}`);
    if (isNaN(matchDate.getTime())) {
      setCreateMatchError("Date et heure invalides.");
      return;
    }
    setCreateMatchSaving(true);
    try {
      const res = await fetch("/api/sport/matches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          competitionId: createMatchForm.competitionId,
          homeTeamId: createMatchForm.homeTeamId,
          awayTeamId: createMatchForm.awayTeamId,
          date: matchDate.toISOString(),
          venue: createMatchForm.venue || undefined,
          round: createMatchForm.round || undefined
        })
      });
      if (!res.ok) {
        const text = await res.text();
        setCreateMatchError(text || "Impossible de créer le match.");
        return;
      }
      const created = await res.json();
      setMatches((prev) => [created, ...prev]);
      setIsCreateMatchOpen(false);
      setCreateMatchForm({
        competitionId: "",
        homeTeamId: "",
        awayTeamId: "",
        date: "",
        time: "",
        venue: "",
        round: ""
      });
    } finally {
      setCreateMatchSaving(false);
    }
  };

  const openClubAssignment = (competition: Competition) => {
    const selected = clubs
      .filter((club) => club.assignedCompetitions?.includes(competition.id))
      .map((club) => club.id);
    setClubAssignmentIds(selected);
    setClubAssignmentCompetition(competition);
    setClubAssignmentError(null);
  };

  const toggleClubAssignment = (clubId: string) => {
    setClubAssignmentIds((prev) =>
      prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId],
    );
  };

  const saveClubAssignment = async () => {
    if (!clubAssignmentCompetition) return;
    setClubAssignmentError(null);
    setClubAssignmentSaving(true);
    try {
      const res = await fetch(`/api/sport/competitions/${clubAssignmentCompetition.id}/clubs`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clubIds: clubAssignmentIds }),
      });
      if (!res.ok) {
        const text = await res.text();
        setClubAssignmentError(text || "Impossible d’enregistrer l’affectation des clubs.");
        return;
      }
      setClubs((prev) =>
        prev.map((club) => {
          const assigned = new Set(club.assignedCompetitions || []);
          if (clubAssignmentIds.includes(club.id)) {
            assigned.add(clubAssignmentCompetition.id);
          } else {
            assigned.delete(clubAssignmentCompetition.id);
          }
          return { ...club, assignedCompetitions: Array.from(assigned) };
        }),
      );
      setCompetitions((prev) =>
        prev.map((competition) =>
          competition.id === clubAssignmentCompetition.id
            ? { ...competition, participantCount: clubAssignmentIds.length }
            : competition,
        ),
      );
      setClubAssignmentCompetition(null);
    } finally {
      setClubAssignmentSaving(false);
    }
  };

  React.useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    const loadSeasons = async () => {
      try {
        const res = await fetch("/api/licensing/seasons");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const normalized: Season[] = (data || []).map((s: any) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          isActive: s.is_active ?? s.isActive,
        }));
        setSeasons(normalized);
        setCreateCompetitionForm((prev) => {
          if (prev.season || normalized.length === 0) return prev;
          const activeSeason = normalized.find((s) => s.isActive) || normalized[0];
          return { ...prev, season: activeSeason.code };
        });
      } catch (e) {
        if (!cancelled) {
          setSeasonsError("Impossible de charger les saisons.");
        }
      }
    };
    void loadSeasons();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-200">
          {(['dashboard', 'competitions', 'clubs', 'matches', 'statistics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="capitalize text-center">
                {tab === 'dashboard' && 'Tableau de bord'}
                {tab === 'competitions' && 'Compétitions'}
                {tab === 'clubs' && 'Clubs'}
                {tab === 'matches' && 'Matchs'}
                {tab === 'statistics' && 'Statistiques'}
              </div>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Tableau de bord des Compétitions</h3>
              
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                  <div className="text-sm font-medium text-blue-600">Compétitions Actives</div>
                  <div className="text-3xl font-bold text-blue-800 mt-1">{activeCompetitions}</div>
                  <div className="text-xs text-blue-500 mt-2">En cours cette saison</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                  <div className="text-sm font-medium text-green-600">Matchs Programmés</div>
                  <div className="text-3xl font-bold text-green-800 mt-1">{upcomingMatches}</div>
                  <div className="text-xs text-green-500 mt-2">À venir</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                  <div className="text-sm font-medium text-purple-600">Clubs Participants</div>
                  <div className="text-3xl font-bold text-purple-800 mt-1">{totalClubs}</div>
                  <div className="text-xs text-purple-500 mt-2">Actifs</div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                  <div className="text-sm font-medium text-orange-600">Derniers Résultats</div>
                  <div className="text-3xl font-bold text-orange-800 mt-1">{recentMatches.length}</div>
                  <div className="text-xs text-orange-500 mt-2">Matchs terminés</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-800 mb-4">Prochaines Rencontres</h4>
                  <div className="space-y-3">
                    {matches.filter(m => m.status === 'scheduled').slice(0, 3).map(match => (
                      <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">
                            {match.homeTeamName} vs {match.awayTeamName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(match.date)} à {match.time} • {match.venue}
                          </div>
                        </div>
                        {getStatusBadge(match.status)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-800 mb-4">Compétitions en Cours</h4>
                  <div className="space-y-3">
                    {competitions.filter(c => c.status === 'active').map(competition => (
                      <div key={competition.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">{competition.name}</div>
                          <div className="text-sm text-gray-600">
                            {getCompetitionTypeLabel(competition.type)} • {competition.type === "cup"
                              ? `${competition.cupTeamCount ?? 0} équipes`
                              : `${competition.participantCount} clubs`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Saison {competition.season}</div>
                          {getStatusBadge(competition.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Competitions Tab */}
          {activeTab === 'competitions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Gestion des Compétitions</h3>
                {isAdmin ? (
                  <button
                    onClick={() => setIsCreateCompetitionOpen(true)}
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                  >
                    Nouvelle Compétition
                  </button>
                ) : null}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {competitions.map(competition => (
                  <div key={competition.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-800">{competition.name}</h4>
                      {getStatusBadge(competition.status)}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div><span className="font-medium">Saison:</span> {competition.season}</div>
                      <div><span className="font-medium">Catégorie:</span> {competition.category}</div>
                      <div><span className="font-medium">Type:</span> {getCompetitionTypeLabel(competition.type)}</div>
                      <div>
                        <span className="font-medium">
                          {competition.type === "cup" ? "Équipes prévues:" : "Participants:"}
                        </span>{" "}
                        {competition.type === "cup"
                          ? competition.cupTeamCount ?? 0
                          : `${competition.participantCount} clubs`}
                      </div>
                      <div><span className="font-medium">Période:</span> {formatDate(competition.startDate)} - {formatDate(competition.endDate)}</div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="flex-1 px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        Détails
                      </button>
                      <button
                        onClick={() => setActiveTab("statistics")}
                        className="flex-1 px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Classement
                      </button>
                      {isAdmin ? (
                        <button
                          onClick={() => openCupSchema(competition)}
                          className="flex-1 px-3 py-1.5 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                          {competition.type === "cup" ? "Tirage" : "Générer"}
                        </button>
                      ) : null}
                      {isAdmin ? (
                        <button
                          onClick={() => openClubAssignment(competition)}
                          className="flex-1 px-3 py-1.5 text-xs bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                        >
                          Affecter clubs
                        </button>
                      ) : null}
                      {isAdmin ? (
                        <button
                          onClick={() => openEditCompetition(competition)}
                          className="flex-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Modifier
                        </button>
                      ) : null}
                      {isAdmin ? (
                        <button
                          onClick={() => handleDeleteCompetition(competition)}
                          className="flex-1 px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Supprimer
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCreateCompetitionOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <div className="text-lg font-semibold text-gray-800">Nouvelle Compétition</div>
                  <button
                    onClick={() => setIsCreateCompetitionOpen(false)}
                    className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleCreateCompetition} className="space-y-4 px-6 py-5">
                  {seasonsError ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                      {seasonsError}
                    </div>
                  ) : null}
                  {createCompetitionError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {createCompetitionError}
                    </div>
                  ) : null}
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-gray-700">Nom</label>
                      <input
                        className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        value={createCompetitionForm.name}
                        onChange={(e) =>
                          setCreateCompetitionForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-gray-700">Saison</label>
                      <select
                        className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        value={createCompetitionForm.season}
                        onChange={(e) =>
                          setCreateCompetitionForm((prev) => ({ ...prev, season: e.target.value }))
                        }
                      >
                        <option value="">Sélectionner une saison</option>
                        {seasons.map((season) => (
                          <option key={season.id} value={season.code}>
                            {season.name} ({season.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-gray-700">Type</label>
                      <select
                        className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        value={createCompetitionForm.type}
                        onChange={(e) =>
                          setCreateCompetitionForm((prev) => ({
                            ...prev,
                            type: e.target.value as Competition["type"],
                          }))
                        }
                      >
                        <option value="league">{getCompetitionTypeLabel("league")}</option>
                        <option value="cup">{getCompetitionTypeLabel("cup")}</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-semibold text-gray-700">Clubs participants</label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCreateCompetitionForm((prev) => ({
                                ...prev,
                                clubIds: clubs.filter((c) => c.status === "active").map((c) => c.id),
                              }))
                            }
                            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            Tout
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreateCompetitionForm((prev) => ({ ...prev, clubIds: [] }))}
                            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            Aucun
                          </button>
                        </div>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-3">
                        <div className="max-h-52 space-y-2 overflow-auto">
                          {clubs
                            .filter((club) => club.status === "active")
                            .map((club) => {
                              const checked = (createCompetitionForm.clubIds || []).includes(club.id);
                              return (
                                <label key={club.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-gray-50">
                                  <div className="flex min-w-0 items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => {
                                        const nextChecked = e.target.checked;
                                        setCreateCompetitionForm((prev) => {
                                          const set = new Set(prev.clubIds || []);
                                          if (nextChecked) set.add(club.id);
                                          else set.delete(club.id);
                                          return { ...prev, clubIds: Array.from(set) };
                                        });
                                      }}
                                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                    />
                                    <div className="min-w-0">
                                      <div className="truncate text-sm font-semibold text-gray-800">{club.acronym}</div>
                                      <div className="truncate text-xs text-gray-500">{club.name}</div>
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                        </div>
                        <div className="mt-3 text-xs font-semibold text-gray-600">
                          Sélectionnés : {createCompetitionForm.clubIds.length}
                          {createCompetitionForm.type === "cup"
                            ? ` (format coupe, tableau basé sur ${createCompetitionForm.clubIds.length} équipes)`
                            : ` (format ligue aller/retour)`}
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">Date début</label>
                        <input
                          type="date"
                          className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={createCompetitionForm.startDate}
                          onChange={(e) =>
                            setCreateCompetitionForm((prev) => ({ ...prev, startDate: e.target.value }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">Date fin</label>
                        <input
                          type="date"
                          className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={createCompetitionForm.endDate}
                          onChange={(e) =>
                            setCreateCompetitionForm((prev) => ({ ...prev, endDate: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateCompetitionOpen(false)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={createCompetitionSaving}
                      className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      {createCompetitionSaving ? "..." : "Créer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}

          {isEditCompetitionOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <div className="text-lg font-semibold text-gray-800">Modifier la compétition</div>
                  <button
                    onClick={() => setIsEditCompetitionOpen(false)}
                    className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleUpdateCompetition} className="space-y-4 px-6 py-5">
                  {editCompetitionError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {editCompetitionError}
                    </div>
                  ) : null}
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-gray-700">Nom</label>
                      <input
                        className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        value={editCompetitionForm.name}
                        onChange={(e) =>
                          setEditCompetitionForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-gray-700">Saison</label>
                      <select
                        className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        value={editCompetitionForm.season}
                        onChange={(e) =>
                          setEditCompetitionForm((prev) => ({ ...prev, season: e.target.value }))
                        }
                      >
                        <option value="">Sélectionner une saison</option>
                        {seasons.map((season) => (
                          <option key={season.id} value={season.code}>
                            {season.name} ({season.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-gray-700">Type</label>
                      <select
                        className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        value={editCompetitionForm.type}
                        onChange={(e) =>
                          setEditCompetitionForm((prev) => ({
                            ...prev,
                            type: e.target.value as Competition["type"],
                            cupTeamCount: e.target.value === "cup" ? prev.cupTeamCount : ""
                          }))
                        }
                      >
                        <option value="league">{getCompetitionTypeLabel("league")}</option>
                        <option value="cup">{getCompetitionTypeLabel("cup")}</option>
                      </select>
                    </div>
                    {editCompetitionForm.type === "cup" ? (
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">Nombre d'équipes</label>
                        <input
                          type="number"
                          min={2}
                          className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={editCompetitionForm.cupTeamCount}
                          onChange={(e) =>
                            setEditCompetitionForm((prev) => ({ ...prev, cupTeamCount: e.target.value }))
                          }
                        />
                      </div>
                    ) : null}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">Date début</label>
                        <input
                          type="date"
                          className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={editCompetitionForm.startDate}
                          onChange={(e) =>
                            setEditCompetitionForm((prev) => ({ ...prev, startDate: e.target.value }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">Date fin</label>
                        <input
                          type="date"
                          className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={editCompetitionForm.endDate}
                          onChange={(e) =>
                            setEditCompetitionForm((prev) => ({ ...prev, endDate: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditCompetitionOpen(false)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={editCompetitionSaving}
                      className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      {editCompetitionSaving ? "..." : "Enregistrer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}

          {isCreateMatchOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <div className="text-lg font-semibold text-gray-800">Nouveau Match</div>
                  <button
                    onClick={() => setIsCreateMatchOpen(false)}
                    className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleCreateMatch} className="space-y-4 px-6 py-5">
                  {createMatchError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {createMatchError}
                    </div>
                  ) : null}
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-gray-700">Compétition</label>
                      <select
                        className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        value={createMatchForm.competitionId}
                        onChange={(e) =>
                          setCreateMatchForm((prev) => ({ ...prev, competitionId: e.target.value }))
                        }
                      >
                        <option value="">Sélectionner une compétition</option>
                        {competitions.map((competition) => (
                          <option key={competition.id} value={competition.id}>
                            {competition.name} ({competition.season})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-gray-700">Tour (optionnel)</label>
                      <select
                        className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        value={createMatchForm.round}
                        onChange={(e) =>
                          setCreateMatchForm((prev) => ({ ...prev, round: e.target.value }))
                        }
                        disabled={!createMatchForm.competitionId}
                      >
                        <option value="">Sélectionner un tour</option>
                        {createMatchForm.competitionId
                          ? getRoundOptions(createMatchForm.competitionId).map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))
                          : null}
                      </select>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">Équipe domicile</label>
                        <select
                          className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={createMatchForm.homeTeamId}
                          onChange={(e) =>
                            setCreateMatchForm((prev) => ({ ...prev, homeTeamId: e.target.value }))
                          }
                        >
                          <option value="">Sélectionner une équipe</option>
                          {clubs
                            .filter((club) => club.status === "active")
                            .map((club) => (
                              <option key={club.id} value={club.id}>
                                {club.acronym}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">Équipe extérieure</label>
                        <select
                          className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={createMatchForm.awayTeamId}
                          onChange={(e) =>
                            setCreateMatchForm((prev) => ({ ...prev, awayTeamId: e.target.value }))
                          }
                        >
                          <option value="">Sélectionner une équipe</option>
                          {clubs
                            .filter((club) => club.status === "active" && club.id !== createMatchForm.homeTeamId)
                            .map((club) => (
                              <option key={club.id} value={club.id}>
                                {club.acronym}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">Date</label>
                        <input
                          type="date"
                          className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={createMatchForm.date}
                          onChange={(e) =>
                            setCreateMatchForm((prev) => ({ ...prev, date: e.target.value }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">Heure</label>
                        <input
                          type="time"
                          className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={createMatchForm.time}
                          onChange={(e) =>
                            setCreateMatchForm((prev) => ({ ...prev, time: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-gray-700">Lieu</label>
                      <input
                        className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        value={createMatchForm.venue}
                        onChange={(e) =>
                          setCreateMatchForm((prev) => ({ ...prev, venue: e.target.value }))
                        }
                        placeholder="Patinoire"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateMatchOpen(false)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={createMatchSaving}
                      className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      {createMatchSaving ? "..." : "Créer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}

          {isEditMatchOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <div className="text-lg font-semibold text-gray-800">Modifier le match</div>
                  <button
                    onClick={() => setIsEditMatchOpen(false)}
                    className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleUpdateMatch} className="space-y-4 px-6 py-5">
                  {editMatchError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {editMatchError}
                    </div>
                  ) : null}
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-gray-700">Compétition</label>
                      <select
                        className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        value={editMatchForm.competitionId}
                        onChange={(e) =>
                          setEditMatchForm((prev) => ({ ...prev, competitionId: e.target.value }))
                        }
                      >
                        <option value="">Sélectionner une compétition</option>
                        {competitions.map((competition) => (
                          <option key={competition.id} value={competition.id}>
                            {competition.name} ({competition.season})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">Équipe domicile</label>
                        <select
                          className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={editMatchForm.homeTeamId}
                          onChange={(e) =>
                            setEditMatchForm((prev) => ({ ...prev, homeTeamId: e.target.value }))
                          }
                        >
                          <option value="">Sélectionner une équipe</option>
                          {clubs
                            .filter((club) => club.status === "active")
                            .map((club) => (
                              <option key={club.id} value={club.id}>
                                {club.acronym}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">Équipe extérieure</label>
                        <select
                          className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={editMatchForm.awayTeamId}
                          onChange={(e) =>
                            setEditMatchForm((prev) => ({ ...prev, awayTeamId: e.target.value }))
                          }
                        >
                          <option value="">Sélectionner une équipe</option>
                          {clubs
                            .filter((club) => club.status === "active" && club.id !== editMatchForm.homeTeamId)
                            .map((club) => (
                              <option key={club.id} value={club.id}>
                                {club.acronym}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">Date</label>
                        <input
                          type="date"
                          className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={editMatchForm.date}
                          onChange={(e) =>
                            setEditMatchForm((prev) => ({ ...prev, date: e.target.value }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">Heure</label>
                        <input
                          type="time"
                          className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={editMatchForm.time}
                          onChange={(e) =>
                            setEditMatchForm((prev) => ({ ...prev, time: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-gray-700">Lieu</label>
                      <input
                        className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                        value={editMatchForm.venue}
                        onChange={(e) =>
                          setEditMatchForm((prev) => ({ ...prev, venue: e.target.value }))
                        }
                        placeholder="Patinoire"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditMatchOpen(false)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={editMatchSaving}
                      className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      {editMatchSaving ? "..." : "Enregistrer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}

          {clubAssignmentCompetition ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <div className="text-lg font-semibold text-gray-800">
                    Affecter des clubs
                  </div>
                  <button
                    onClick={() => setClubAssignmentCompetition(null)}
                    className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4 px-6 py-5">
                  <div className="text-sm text-gray-600">
                    {clubAssignmentCompetition.name}
                  </div>
                  {clubAssignmentError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {clubAssignmentError}
                    </div>
                  ) : null}
                  <div className="max-h-[360px] overflow-y-auto rounded-xl border border-gray-100">
                    {clubs.map((club) => (
                      <label
                        key={club.id}
                        className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 text-sm last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={clubAssignmentIds.includes(club.id)}
                          onChange={() => toggleClubAssignment(club.id)}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600"
                        />
                        <span className="font-medium text-gray-800">
                          {club.name}
                        </span>
                        <span className="text-xs text-gray-500">{club.acronym}</span>
                      </label>
                    ))}
                    {clubs.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-gray-500">
                        Aucun club disponible.
                      </div>
                    ) : null}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setClubAssignmentCompetition(null)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={saveClubAssignment}
                      disabled={clubAssignmentSaving}
                      className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      {clubAssignmentSaving ? "..." : "Enregistrer"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {cupSchemaCompetition ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <div>
                    <div className="text-lg font-semibold text-gray-800">Schéma de Coupe</div>
                    <div className="text-xs text-gray-500">{cupSchemaCompetition.name}</div>
                  </div>
                  <button
                    onClick={() => setCupSchemaCompetition(null)}
                    className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4 px-6 py-5">
                  {cupSchemaError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {cupSchemaError}
                    </div>
                  ) : null}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCupSchemaTab("manual")}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                        cupSchemaTab === "manual"
                          ? "bg-brand-600 text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Manuel
                    </button>
                    <button
                      onClick={() => setCupSchemaTab("draw")}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                        cupSchemaTab === "draw"
                          ? "bg-brand-600 text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {cupSchemaCompetition.type === "league" ? "Générer le calendrier" : "Tirage au sort"}
                    </button>
                  </div>

                  {cupSchemaTab === "manual" ? (
                    <form onSubmit={handleCreateCupMatch} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <label className="text-sm font-semibold text-gray-700">Équipe domicile</label>
                          <select
                            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                            value={cupSchemaForm.homeTeamId}
                            onChange={(e) =>
                              setCupSchemaForm((prev) => ({ ...prev, homeTeamId: e.target.value }))
                            }
                          >
                            <option value="">Sélectionner une équipe</option>
                            {cupSchemaClubs.map((club) => (
                              <option key={club.id} value={club.id}>
                                {club.acronym}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-semibold text-gray-700">Équipe extérieure</label>
                          <select
                            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                            value={cupSchemaForm.awayTeamId}
                            onChange={(e) =>
                              setCupSchemaForm((prev) => ({ ...prev, awayTeamId: e.target.value }))
                            }
                          >
                            <option value="">Sélectionner une équipe</option>
                            {cupSchemaClubs
                              .filter((club) => club.id !== cupSchemaForm.homeTeamId)
                              .map((club) => (
                                <option key={club.id} value={club.id}>
                                  {club.acronym}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <label className="text-sm font-semibold text-gray-700">Date</label>
                          <input
                            type="date"
                            className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                            value={cupSchemaForm.date}
                            onChange={(e) =>
                              setCupSchemaForm((prev) => ({ ...prev, date: e.target.value }))
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-semibold text-gray-700">Heure</label>
                          <input
                            type="time"
                            className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                            value={cupSchemaForm.time}
                            onChange={(e) =>
                              setCupSchemaForm((prev) => ({ ...prev, time: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">Lieu</label>
                        <input
                          className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={cupSchemaForm.venue}
                          onChange={(e) =>
                            setCupSchemaForm((prev) => ({ ...prev, venue: e.target.value }))
                          }
                          placeholder="Patinoire"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setCupSchemaCompetition(null)}
                          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                          Fermer
                        </button>
                        <button
                          type="submit"
                          disabled={cupSchemaSaving}
                          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                        >
                          {cupSchemaSaving ? "..." : "Créer le match"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                        {cupSchemaCompetition.type === 'league'
                          ? `${cupSchemaClubs.length} équipes affectées • Génération de tous les tours`
                          : `${cupSchemaCompetition.cupTeamCount ?? 0} équipes prévues • ${cupSchemaClubs.length} équipes affectées • Seul le premier tour est programmé`
                        }
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <label className="text-sm font-semibold text-gray-700">Date de début</label>
                          <input
                            type="date"
                            className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                            value={cupSchemaForm.date}
                            onChange={(e) =>
                              setCupSchemaForm((prev) => ({ ...prev, date: e.target.value }))
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-semibold text-gray-700">Heure par défaut</label>
                          <input
                            type="time"
                            className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                            value={cupSchemaForm.time}
                            onChange={(e) =>
                              setCupSchemaForm((prev) => ({ ...prev, time: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">Lieu par défaut</label>
                        <input
                          className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={cupSchemaForm.venue}
                          onChange={(e) =>
                            setCupSchemaForm((prev) => ({ ...prev, venue: e.target.value }))
                          }
                          placeholder="Patinoire"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setCupSchemaCompetition(null)}
                          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                          Fermer
                        </button>
                        <button
                          type="button"
                          onClick={handleAutoDraw}
                          disabled={cupSchemaSaving}
                          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                        >
                          {cupSchemaSaving ? "..." : (cupSchemaCompetition.type === 'league' ? "Générer le calendrier" : "Générer le tirage")}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-4">
                    <div className="text-sm font-semibold text-gray-800 mb-3">Matchs existants</div>
                    {cupSchemaMatches.length === 0 ? (
                      <div className="text-sm text-gray-500">Aucun match créé pour le moment.</div>
                    ) : (
                      <div className="space-y-6">
                        {(() => {
                            const grouped = cupSchemaMatches.reduce((acc, match) => {
                                const r = match.round || "Autres";
                                if (!acc[r]) acc[r] = [];
                                acc[r].push(match);
                                return acc;
                            }, {} as Record<string, typeof cupSchemaMatches>);
                            
                            const sortedRounds = Object.keys(grouped).sort((a, b) => {
                                if (a === "Autres") return 1;
                                if (b === "Autres") return -1;
                                const order = ["Tour préliminaire", "32èmes de finale", "16èmes de finale", "8èmes de finale", "Quarts de finale", "Demi-finales", "Finale"];
                                const idxA = order.indexOf(a);
                                const idxB = order.indexOf(b);
                                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                                
                                const numA = parseInt(a.replace(/\D/g, '')) || 0;
                                const numB = parseInt(b.replace(/\D/g, '')) || 0;
                                if (numA !== numB) return numA - numB;
                                
                                return a.localeCompare(b);
                            });
                            
                            return sortedRounds.map(round => (
                                <div key={round} className="space-y-2">
                                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{round}</h5>
                                    {grouped[round].map(match => (
                                      <div
                                        key={match.id}
                                        className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between hover:bg-white hover:shadow-sm transition-all"
                                      >
                                        <div className="font-medium text-gray-800">
                                          {match.homeTeamName} vs {match.awayTeamName}
                                        </div>
                                        <div className="text-gray-600">{formatDate(match.date)} • {match.time}</div>
                                        <div className="flex items-center gap-2">
                                          {getStatusBadge(match.status)}
                                          {isAdmin && match.status === "scheduled" ? (
                                            <>
                                              <button
                                                onClick={() => openEditMatch(match)}
                                                className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-white"
                                              >
                                                Modifier
                                              </button>
                                              <button
                                                onClick={() => handleDeleteMatch(match)}
                                                className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-white"
                                              >
                                                Supprimer
                                              </button>
                                            </>
                                          ) : null}
                                          {match.status === "completed" &&
                                          match.homeScore !== null &&
                                          match.awayScore !== null ? (
                                            <span className="text-xs font-semibold text-gray-700">
                                              {match.homeScore} - {match.awayScore}
                                            </span>
                                          ) : null}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                            ));
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Clubs Tab */}
          {activeTab === 'clubs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Affectation des Clubs</h3>
                <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
                  Affecter un Club
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-separate border-spacing-0">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3 border-b border-gray-200">Club</th>
                      <th className="px-4 py-3 border-b border-gray-200">Acronyme</th>
                      <th className="px-4 py-3 border-b border-gray-200">Compétitions</th>
                      <th className="px-4 py-3 border-b border-gray-200">Statut</th>
                      <th className="px-4 py-3 border-b border-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubs.map(club => (
                      <tr key={club.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 border-b border-gray-100 font-medium text-gray-800">{club.name}</td>
                        <td className="px-4 py-3 border-b border-gray-100">{club.acronym}</td>
                        <td className="px-4 py-3 border-b border-gray-100">
                          <div className="flex flex-wrap gap-1">
                            {club.assignedCompetitions.slice(0, 2).map(compId => {
                              const comp = competitions.find(c => c.id === compId);
                              return comp ? (
                                <span key={compId} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {comp.name.split(' ')[0]}
                                </span>
                              ) : null;
                            })}
                            {club.assignedCompetitions.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{club.assignedCompetitions.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b border-gray-100">
                          {getStatusBadge(club.status === 'active' ? 'active' : 'completed')}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-100">
                          <button className="px-3 py-1 text-xs bg-brand-500 text-white rounded-lg hover:bg-brand-600">
                            Gérer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Matches Tab */}
          {activeTab === 'matches' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Programmation des Matchs</h3>
                {isAdmin ? (
                  <button
                    onClick={openCreateMatch}
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                  >
                    Nouveau Match
                  </button>
                ) : null}
              </div>
              
              <div className="space-y-8">
                {(() => {
                  const groupedMatches = matches.reduce((groups, match) => {
                    const round = match.round || "Autres matchs";
                    if (!groups[round]) groups[round] = [];
                    groups[round].push(match);
                    return groups;
                  }, {} as Record<string, Match[]>);

                  const sortedRounds = Object.keys(groupedMatches).sort((a, b) => {
                    if (a === "Autres matchs") return 1;
                    if (b === "Autres matchs") return -1;
                    
                    const cupOrder = ["Tour préliminaire", "32èmes de finale", "16èmes de finale", "8èmes de finale", "Quarts de finale", "Demi-finales", "Finale"];
                    const idxA = cupOrder.indexOf(a);
                    const idxB = cupOrder.indexOf(b);
                    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                    
                    const numA = parseInt(a.replace(/\D/g, '')) || 0;
                    const numB = parseInt(b.replace(/\D/g, '')) || 0;
                    if (numA !== numB) return numA - numB;
                    
                    return a.localeCompare(b);
                  });

                  if (sortedRounds.length === 0) return <div className="text-sm text-gray-500">Aucun match programmé.</div>;

                  return sortedRounds.map((round) => (
                    <div key={round} className="space-y-4">
                      {round !== "Autres matchs" && (
                         <h4 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">{round}</h4>
                      )}
                      <div className="grid gap-4">
                        {groupedMatches[round].map((match) => {
                          const goalSummary = matchGoalSummaryByMatchId.get(match.id) || [];
                          const getGoalTeamName = (teamId: string) =>
                            teamId === match.homeTeamId ? match.homeTeamName : match.awayTeamName;
                          return (
                            <div key={match.id} className="border border-gray-200 rounded-xl p-5">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-semibold text-gray-800 text-lg">
                                    {match.homeTeamName} vs {match.awayTeamName}
                                  </h4>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <span>{formatDate(match.date)} à {match.time}</span>
                                    <span>•</span>
                                    <span>{match.venue}</span>
                                    <span>•</span>
                                    <span>{match.competitionName}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {getStatusBadge(match.status)}
                                  {match.refereeName && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                      Arbitre: {match.refereeName}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {match.status === 'scheduled' && (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => openMatchSheet(match)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                                  >
                                    Feuille de Match
                                  </button>
                                  <button
                                    onClick={() => openEditMatch(match)}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMatch(match)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              )}
                              
                              {match.status === 'completed' && match.homeScore !== null && match.awayScore !== null && (
                                <div className="mt-4 space-y-3 rounded-lg bg-gray-50 p-4">
                                  <div className="text-center">
                                    <span className="text-3xl font-bold text-gray-800">
                                      {match.homeScore} - {match.awayScore}
                                    </span>
                                    <div className="text-sm text-gray-600 mt-1">Résultat final</div>
                                  </div>
                                  {goalSummary.length > 0 ? (
                                    <div className="border-t border-gray-200 pt-3">
                                      <div className="text-sm font-semibold text-gray-700 mb-2">Buteurs &amp; assists</div>
                                      <ul className="space-y-1">
                                        {goalSummary.map((goal, index) => (
                                          <li key={`${match.id}-${index}`} className="text-sm text-gray-700">
                                            <span className="font-semibold">{getGoalTeamName(goal.teamId)}</span>{" "}
                                            {goal.scorer}
                                            {goal.assists.length > 0
                                              ? ` (${goal.assists.join(", ")})`
                                              : " (sans assistance)"}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <div className="space-y-10">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Classement des Clubs</h3>
                <div className="space-y-6">
                  {leagueCompetitions.length === 0 ? (
                    <div className="text-sm text-gray-500">Aucune compétition de ligue active.</div>
                  ) : (
                    leagueCompetitions.map((competition) => {
                      const standingsMap = standingsByCompetition.get(competition.id);
                      const standingsRows = standingsMap
                        ? [...standingsMap.values()].sort((a, b) => {
                            if (b.pts !== a.pts) return b.pts - a.pts;
                            if (b.gd !== a.gd) return b.gd - a.gd;
                            return b.gf - a.gf;
                          })
                        : [];
                      const leaderboardRows = playerLeaderboardByCompetition.get(competition.id) || [];

                      return (
                        <div key={competition.id} className="bg-white border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="font-semibold text-gray-800">{competition.name}</div>
                              <div className="text-xs text-gray-500">{competition.season}</div>
                            </div>
                            <span className="text-xs font-semibold text-gray-500">
                              {standingsRows.length} clubs
                            </span>
                          </div>
                          {standingsRows.length === 0 ? (
                            <div className="text-sm text-gray-500">Aucun match validé pour le moment.</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[900px] border-separate border-spacing-0">
                                <thead>
                                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <th className="px-3 py-2 border-b border-gray-200">Club</th>
                                    <th className="px-3 py-2 border-b border-gray-200 text-center">MJ</th>
                                    <th className="px-3 py-2 border-b border-gray-200 text-center">V</th>
                                    <th className="px-3 py-2 border-b border-gray-200 text-center">D</th>
                                    <th className="px-3 py-2 border-b border-gray-200 text-center">OT</th>
                                    <th className="px-3 py-2 border-b border-gray-200 text-center">BP</th>
                                    <th className="px-3 py-2 border-b border-gray-200 text-center">BC</th>
                                    <th className="px-3 py-2 border-b border-gray-200 text-center">Diff</th>
                                    <th className="px-3 py-2 border-b border-gray-200 text-center">PTS</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {standingsRows.map((row) => (
                                    <tr key={row.clubId} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 border-b border-gray-100 font-medium text-gray-800">
                                        {row.clubName}
                                      </td>
                                      <td className="px-3 py-2 border-b border-gray-100 text-center">{row.gp}</td>
                                      <td className="px-3 py-2 border-b border-gray-100 text-center">{row.w}</td>
                                      <td className="px-3 py-2 border-b border-gray-100 text-center">{row.l}</td>
                                      <td className="px-3 py-2 border-b border-gray-100 text-center">{row.ot}</td>
                                      <td className="px-3 py-2 border-b border-gray-100 text-center">{row.gf}</td>
                                      <td className="px-3 py-2 border-b border-gray-100 text-center">{row.ga}</td>
                                      <td className="px-3 py-2 border-b border-gray-100 text-center font-semibold">
                                        <span className={row.gd >= 0 ? "text-green-600" : "text-red-600"}>
                                          {row.gd >= 0 ? "+" : ""}{row.gd}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 border-b border-gray-100 text-center font-semibold text-brand-700">
                                        {row.pts}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-semibold text-gray-800">Classement des Joueurs</div>
                              <span className="text-xs font-semibold text-gray-500">
                                {leaderboardRows.length} joueurs
                              </span>
                            </div>

                            {leaderboardRows.length === 0 ? (
                              <div className="text-sm text-gray-500">Aucune statistique validée pour le moment.</div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] border-separate border-spacing-0">
                                  <thead>
                                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                      <th className="px-3 py-2 border-b border-gray-200">Joueur</th>
                                      <th className="px-3 py-2 border-b border-gray-200">Club</th>
                                      <th className="px-3 py-2 border-b border-gray-200 text-center">MJ</th>
                                      <th className="px-3 py-2 border-b border-gray-200 text-center">B</th>
                                      <th className="px-3 py-2 border-b border-gray-200 text-center">A</th>
                                      <th className="px-3 py-2 border-b border-gray-200 text-center">PTS</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {leaderboardRows.map((row) => (
                                      <tr key={row.playerId} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 border-b border-gray-100 font-medium text-gray-800">
                                          {row.playerName}
                                        </td>
                                        <td className="px-3 py-2 border-b border-gray-100 text-gray-600">
                                          {row.clubName}
                                        </td>
                                        <td className="px-3 py-2 border-b border-gray-100 text-center">{row.matchesPlayed}</td>
                                        <td className="px-3 py-2 border-b border-gray-100 text-center font-semibold text-blue-600">
                                          {row.goals}
                                        </td>
                                        <td className="px-3 py-2 border-b border-gray-100 text-center font-semibold text-green-600">
                                          {row.assists}
                                        </td>
                                        <td className="px-3 py-2 border-b border-gray-100 text-center font-semibold text-purple-600">
                                          {row.points}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Compétitions en Coupe</h3>
                <div className="space-y-6">
                  {cupCompetitions.length === 0 ? (
                    <div className="text-sm text-gray-500">Aucune compétition de coupe active.</div>
                  ) : (
                    cupCompetitions.map((competition) => {
                      const competitionMatches = matches
                        .filter((match) => match.competitionId === competition.id)
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                      const rounds = getCupRounds(competition.cupTeamCount ?? undefined);
                      return (
                        <div key={competition.id} className="bg-white border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="font-semibold text-gray-800">{competition.name}</div>
                              <div className="text-xs text-gray-500">{competition.season}</div>
                            </div>
                            <span className="text-xs font-semibold text-gray-500">
                              {competition.cupTeamCount ?? 0} équipes
                            </span>
                          </div>
                          {!competition.cupTeamCount || competition.cupTeamCount < 2 ? (
                            <div className="text-sm text-gray-500">Nombre d'équipes non défini pour la coupe.</div>
                          ) : (
                            <div className="grid gap-6 lg:grid-cols-3">
                              {rounds.map((round) => {
                                const roundMatches = competitionMatches.filter(
                                  (m) => m.round === round.label
                                );
                                const slots = Array.from({ length: round.matchCount }, (_, index) => roundMatches[index] || null);
                                return (
                                  <div key={round.label} className="space-y-3">
                                    <div className="text-sm font-semibold text-gray-700">{round.label}</div>
                                    <div className="space-y-2">
                                      {slots.map((match, index) => (
                                        <div
                                          key={`${round.label}-${index}`}
                                          className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs"
                                        >
                                          {match ? (
                                            <div className="space-y-1">
                                              <div className="font-medium text-gray-800">
                                                {match.homeTeamName} vs {match.awayTeamName}
                                              </div>
                                              <div className="text-gray-600">{formatDate(match.date)} • {match.time}</div>
                                              <div className="flex items-center gap-2">
                                                {getStatusBadge(match.status)}
                                                {match.status === 'completed' &&
                                                match.homeScore !== null &&
                                                match.awayScore !== null ? (
                                                  <span className="text-xs font-semibold text-gray-700">
                                                    {match.homeScore} - {match.awayScore}
                                                  </span>
                                                ) : null}
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="text-gray-500">Match à définir</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Match Sheet Modal */}
      {showMatchSheet && selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Feuille de Match</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {selectedMatch.competitionName} • {formatDate(selectedMatch.date)} à {selectedMatch.time} • {selectedMatch.venue}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowMatchSheet(false);
                  setSelectedMatch(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex border-b border-gray-100 px-6 bg-white">
              <button
                onClick={() => setMatchSheetTab('roster')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  matchSheetTab === 'roster'
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                1. Effectifs
              </button>
              <button
                onClick={() => setMatchSheetTab('events')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  matchSheetTab === 'events'
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                2. Déroulement
              </button>
              <button
                onClick={() => setMatchSheetTab('summary')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  matchSheetTab === 'summary'
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                3. Résumé & Validation
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {matchSheetError && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100 flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {matchSheetError}
                </div>
              )}

              {matchSheetTab === 'roster' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
                      <h3 className="font-bold text-lg text-gray-800">{selectedMatch.homeTeamName}</h3>
                      <span className="text-xs font-medium px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full">
                        {matchSheetForm.homeRoster.length} sélectionnés
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-1 max-h-[500px]">
                      {homeTeamPlayers.length === 0 ? (
                        <div className="text-sm text-gray-400 italic text-center py-8">Aucun joueur trouvé pour cette équipe</div>
                      ) : (
                        homeTeamPlayers.map((player) => (
                          <label
                            key={player.id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                              matchSheetForm.homeRoster.includes(player.id)
                                ? 'bg-brand-50 border-brand-200 shadow-sm'
                                : 'bg-white border-transparent hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={matchSheetForm.homeRoster.includes(player.id)}
                              onChange={() => toggleRosterPlayer("home", player.id)}
                              className="w-5 h-5 text-brand-600 rounded border-gray-300 focus:ring-brand-500 transition-colors"
                            />
                            <div>
                              <p className={`text-sm font-medium ${matchSheetForm.homeRoster.includes(player.id) ? 'text-brand-900' : 'text-gray-700'}`}>
                                {player.firstName} {player.lastName}
                              </p>
                              <p className="text-xs text-gray-500">#{player.jerseyNumber} • {player.position}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
                      <h3 className="font-bold text-lg text-gray-800">{selectedMatch.awayTeamName}</h3>
                      <span className="text-xs font-medium px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full">
                        {matchSheetForm.awayRoster.length} sélectionnés
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-1 max-h-[500px]">
                      {awayTeamPlayers.length === 0 ? (
                        <div className="text-sm text-gray-400 italic text-center py-8">Aucun joueur trouvé pour cette équipe</div>
                      ) : (
                        awayTeamPlayers.map((player) => (
                          <label
                            key={player.id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                              matchSheetForm.awayRoster.includes(player.id)
                                ? 'bg-brand-50 border-brand-200 shadow-sm'
                                : 'bg-white border-transparent hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={matchSheetForm.awayRoster.includes(player.id)}
                              onChange={() => toggleRosterPlayer("away", player.id)}
                              className="w-5 h-5 text-brand-600 rounded border-gray-300 focus:ring-brand-500 transition-colors"
                            />
                            <div>
                              <p className={`text-sm font-medium ${matchSheetForm.awayRoster.includes(player.id) ? 'text-brand-900' : 'text-gray-700'}`}>
                                {player.firstName} {player.lastName}
                              </p>
                              <p className="text-xs text-gray-500">#{player.jerseyNumber} • {player.position}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {matchSheetTab === 'events' && (
                <div className="space-y-8 max-w-4xl mx-auto">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{selectedMatch.homeTeamName}</h3>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Domicile</div>
                    </div>
                    <div className="text-center px-8 py-2 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-5xl font-black text-gray-900 tracking-tight leading-none flex items-center gap-4">
                        <span>{matchSheetForm.events.filter(e => e.type === 'goal' && e.teamId === selectedMatch.homeTeamId).length}</span>
                        <span className="text-gray-300 text-4xl font-light">:</span>
                        <span>{matchSheetForm.events.filter(e => e.type === 'goal' && e.teamId === selectedMatch.awayTeamId).length}</span>
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Score en direct</div>
                    </div>
                    <div className="text-center flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{selectedMatch.awayTeamName}</h3>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Extérieur</div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => addMatchEvent(selectedMatch.homeTeamId)}
                      className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:shadow-md transition-all group flex-1 max-w-xs"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shadow-sm">+</div>
                      <div className="text-left">
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Ajouter un but</div>
                        <div className="text-sm font-bold text-gray-900 truncate">{selectedMatch.homeTeamName}</div>
                      </div>
                    </button>
                    <button
                      onClick={() => addMatchEvent(selectedMatch.awayTeamId)}
                      className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:shadow-md transition-all group flex-1 max-w-xs"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shadow-sm">+</div>
                      <div className="text-left">
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Ajouter un but</div>
                        <div className="text-sm font-bold text-gray-900 truncate">{selectedMatch.awayTeamName}</div>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-2">Historique des événements</h4>
                    {matchSheetForm.events.length === 0 ? (
                      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-gray-500 font-medium">Aucun événement enregistré</p>
                        <p className="text-sm text-gray-400 mt-1">Utilisez les boutons ci-dessus pour ajouter des buts</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {matchSheetForm.events.map((event, index) => {
                          const teamPlayers =
                            event.teamId === selectedMatch.homeTeamId ? homeTeamPlayers : awayTeamPlayers;
                          const assist1 = event.assistIds?.[0] || "";
                          const assist2 = event.assistIds?.[1] || "";
                          const isHome = event.teamId === selectedMatch.homeTeamId;
                          
                          return (
                            <div
                              key={event.id || index}
                              className={`relative bg-white rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md ${isHome ? 'border-l-blue-500' : 'border-l-red-500'}`}
                              style={{ zIndex: matchSheetForm.events.length - index }}
                            >
                              <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                <div className="md:col-span-1 flex justify-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm ${isHome ? 'bg-blue-500' : 'bg-red-500'}`}>
                                    BUT
                                  </div>
                                </div>
                                
                          <div className="md:col-span-3">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Équipe</label>
                            <CustomSelect
                              value={event.teamId}
                              onChange={(val) =>
                                updateMatchEvent(event.id, {
                                  teamId: val,
                                  playerId: "",
                                  assistIds: []
                                })
                              }
                              options={[
                                { 
                                  value: selectedMatch.homeTeamId, 
                                  label: selectedMatch.homeTeamName,
                                  logoUrl: clubs.find(c => c.id === selectedMatch.homeTeamId)?.logoDocumentId 
                                    ? `/api/documents/view?id=${clubs.find(c => c.id === selectedMatch.homeTeamId)?.logoDocumentId}`
                                    : undefined
                                },
                                { 
                                  value: selectedMatch.awayTeamId, 
                                  label: selectedMatch.awayTeamName,
                                  logoUrl: clubs.find(c => c.id === selectedMatch.awayTeamId)?.logoDocumentId 
                                    ? `/api/documents/view?id=${clubs.find(c => c.id === selectedMatch.awayTeamId)?.logoDocumentId}`
                                    : undefined
                                }
                              ]}
                              className="w-full"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Période</label>
                            <CustomSelect
                              value={event.period || "regulation"}
                              onChange={(val) => updateMatchEvent(event.id, { period: val as MatchEvent["period"] })}
                              options={[
                                { value: "regulation", label: "Réglementaire" },
                                { value: "overtime", label: "Prolongation" }
                              ]}
                              className="w-full"
                            />
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Buteur</label>
                            <CustomSelect
                              value={event.playerId}
                              onChange={(val) => updateMatchEvent(event.id, { playerId: val })}
                              options={[
                                { value: "", label: "Sélectionner..." },
                                ...teamPlayers
                                  .filter(p => isHome ? matchSheetForm.homeRoster.includes(p.id) : matchSheetForm.awayRoster.includes(p.id))
                                  .map(player => ({
                                    value: player.id,
                                    label: `${player.firstName} ${player.lastName} (#${player.jerseyNumber})`
                                  }))
                              ]}
                              placeholder="Sélectionner le buteur"
                              className="w-full"
                            />
                          </div>

                          <div className="md:col-span-3 grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Passeur 1</label>
                              <CustomSelect
                                value={assist1}
                                onChange={(val) =>
                                  updateMatchEvent(event.id, {
                                    assistIds: [val, assist2].filter(Boolean)
                                  })
                                }
                                options={[
                                  { value: "", label: "-" },
                                  ...teamPlayers
                                    .filter(p => isHome ? matchSheetForm.homeRoster.includes(p.id) : matchSheetForm.awayRoster.includes(p.id))
                                    .map(player => ({
                                      value: player.id,
                                      label: `${player.lastName}`
                                    }))
                                ]}
                                placeholder="-"
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Passeur 2</label>
                              <CustomSelect
                                value={assist2}
                                onChange={(val) =>
                                  updateMatchEvent(event.id, {
                                    assistIds: [assist1, val].filter(Boolean)
                                  })
                                }
                                options={[
                                  { value: "", label: "-" },
                                  ...teamPlayers
                                    .filter(p => isHome ? matchSheetForm.homeRoster.includes(p.id) : matchSheetForm.awayRoster.includes(p.id))
                                    .map(player => ({
                                      value: player.id,
                                      label: `${player.lastName}`
                                    }))
                                ]}
                                placeholder="-"
                                className="w-full"
                              />
                            </div>
                          </div>

                                <div className="md:col-span-1 flex justify-end">
                                  <button
                                    onClick={() => removeMatchEvent(event.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Supprimer l'événement"
                                  >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {matchSheetTab === 'summary' && (
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Validation des Scores</h3>
                    <div className="flex items-center justify-center gap-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">{selectedMatch.homeTeamName}</label>
                        <input
                          type="number"
                          min="0"
                          value={String(derivedMatchScore.home)}
                          readOnly
                          className="w-24 h-24 text-center text-4xl font-black text-gray-900 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
                        />
                      </div>
                      <div className="text-4xl font-light text-gray-300 pt-6">-</div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">{selectedMatch.awayTeamName}</label>
                        <input
                          type="number"
                          min="0"
                          value={String(derivedMatchScore.away)}
                          readOnly
                          className="w-24 h-24 text-center text-4xl font-black text-gray-900 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-left flex gap-3">
                      <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Attention avant de valider :</p>
                        <ul className="list-disc list-inside space-y-1 text-yellow-700">
                          <li>Vérifiez que tous les joueurs participants sont cochés.</li>
                          <li>Assurez-vous que tous les buts et passes sont correctement attribués.</li>
                          <li>Le score final doit correspondre aux événements saisis.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center rounded-b-2xl">
              <button 
                onClick={() => {
                  setShowMatchSheet(false);
                  setSelectedMatch(null);
                }}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                type="button"
              >
                Annuler
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => saveMatchSheet("draft")}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
                  disabled={matchSheetSaving}
                  type="button"
                >
                  Sauvegarder brouillon
                </button>
                <button
                  onClick={() => saveMatchSheet("validated")}
                  className="px-6 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-medium shadow-lg shadow-brand-200 transition-all disabled:opacity-50 hover:shadow-xl hover:-translate-y-0.5"
                  disabled={matchSheetSaving}
                  type="button"
                >
                  Valider le match
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
