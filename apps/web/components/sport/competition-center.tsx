"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock3, Lock, Pencil, Plus, Shuffle, Trash2, Trophy } from "lucide-react";

type CompetitionType = "league" | "cup";
type CompetitionPhase = "draft" | "prepared" | "locked" | "active" | "completed";
type CompetitionFormat = "league_double_round_robin" | "cup_single_elimination";

const teamCategories = ["U7", "U9", "U11", "U13", "U15", "U17", "U20", "Seniors"];

type Season = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

type Competition = {
  id: string;
  name: string;
  season: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  category?: string | null;
  type: CompetitionType;
  format: CompetitionFormat;
  phase: CompetitionPhase;
  lockedAt: string | null;
  participantCount: number;
};

type Club = {
  id: string;
  name: string;
  acronym: string;
  status: "active" | "inactive";
  assignedCompetitions: string[];
  logoDocumentId?: string;
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

type Match = {
  id: string;
  competitionId: string;
  competitionName: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeTeamName: string;
  awayTeamName: string;
  date: string;
  time: string;
  venue: string;
  round?: string | null;
  roundNumber?: number | null;
  leg?: number | null;
  bracketPosition?: number | null;
  status: "scheduled" | "in_progress" | "completed" | "postponed" | "cancelled";
  homeScore: number | null;
  awayScore: number | null;
  resultType?: "regulation" | "overtime" | "shootout" | "bye";
  winnerTeamId?: string | null;
};

type MatchEvent = {
  id: string;
  type: "goal" | "shot" | "penalty";
  teamId: string;
  playerId: string;
  assistIds?: string[];
  period?: "regulation" | "overtime";
};

type MatchSheet = {
  id: string;
  matchId: string;
  status: "draft" | "validated";
  updatedAt: string;
  homeTeamId: string;
  awayTeamId: string;
  homeRoster: string[];
  awayRoster: string[];
  events: MatchEvent[];
};

type StandingRow = {
  rank: number;
  clubId: string;
  clubName: string;
  clubAcronym: string;
  logoDocumentId: string | null;
  gp: number;
  w: number;
  l: number;
  ot: number;
  pts: number;
  gf: number;
  ga: number;
  gd: number;
};

type PlayerLeaderboardRow = {
  playerId: string;
  playerName: string;
  jerseyNumber: number | null;
  clubId: string | null;
  clubName: string;
  clubAcronym: string;
  clubLogoId: string | null;
  matchesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  source: "manual" | "auto";
  lastUpdated: string | null;
};

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatDateTime(dateIso: string) {
  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
}

function toDateInputValue(dateIso: string) {
  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function nextPow2(n: number) {
  if (n <= 1) return 1;
  return 1 << Math.ceil(Math.log2(n));
}

function createLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function deriveScores(events: MatchEvent[], homeTeamId: string | null, awayTeamId: string | null) {
  return events.reduce(
    (acc, e) => {
      if ((e.period || "regulation") === "overtime") acc.hasOvertime = true;
      if (e.type !== "goal") return acc;
      if (homeTeamId && e.teamId === homeTeamId) acc.home += 1;
      if (awayTeamId && e.teamId === awayTeamId) acc.away += 1;
      return acc;
    },
    { home: 0, away: 0, hasOvertime: false },
  );
}

export function CompetitionCenter({
  initialCompetitions,
  initialClubs,
  initialMatches,
  initialPlayers,
  initialMatchSheets,
  isAdmin,
}: {
  initialCompetitions: Competition[];
  initialClubs: Club[];
  initialMatches: Match[];
  initialPlayers: Player[];
  initialMatchSheets: MatchSheet[];
  isAdmin?: boolean;
}) {
  const [competitions, setCompetitions] = React.useState(initialCompetitions);
  const [clubs, setClubs] = React.useState(initialClubs);
  const [matches, setMatches] = React.useState(initialMatches);
  const [players] = React.useState(initialPlayers);
  const [matchSheets, setMatchSheets] = React.useState(initialMatchSheets);

  const [selectedCompetitionId, setSelectedCompetitionId] = React.useState<string | null>(
    initialCompetitions[0]?.id || null,
  );

  const selectedCompetition = React.useMemo(
    () => competitions.find((c) => c.id === selectedCompetitionId) || null,
    [competitions, selectedCompetitionId],
  );

  const clubById = React.useMemo(() => new Map(clubs.map((c) => [c.id, c])), [clubs]);

  const getTeamDisplay = React.useCallback(
    (teamId: string | null, fallbackName: string) => {
      if (!teamId) {
        return { name: fallbackName || "À définir", acronym: fallbackName || "—", logoId: null as string | null };
      }
      const club = clubById.get(teamId);
      return {
        name: club?.name || fallbackName || "À définir",
        acronym: club?.acronym || club?.name || fallbackName || "—",
        logoId: club?.logoDocumentId || null,
      };
    },
    [clubById],
  );

  const competitionClubs = React.useMemo(() => {
    if (!selectedCompetition) return [];
    return clubs
      .filter((c) => c.status === "active" && (c.assignedCompetitions || []).includes(selectedCompetition.id))
      .sort((a, b) => (a.acronym || a.name).localeCompare(b.acronym || b.name));
  }, [clubs, selectedCompetition]);

  const competitionMatches = React.useMemo(() => {
    if (!selectedCompetition) return [];
    return matches
      .filter((m) => m.competitionId === selectedCompetition.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [matches, selectedCompetition]);

  const hasAnyMatchSheetInCompetition = React.useMemo(() => {
    if (!selectedCompetition) return false;
    const ids = new Set(competitionMatches.map((m) => m.id));
    return matchSheets.some((s) => ids.has(s.matchId));
  }, [competitionMatches, matchSheets, selectedCompetition]);

  const leagueRounds = React.useMemo(() => {
    if (!selectedCompetition || selectedCompetition.type !== "league") return [];
    const byRound = new Map<number, Match[]>();
    competitionMatches.forEach((m) => {
      const rn = m.roundNumber ?? null;
      if (!rn) return;
      if (!byRound.has(rn)) byRound.set(rn, []);
      byRound.get(rn)!.push(m);
    });
    return Array.from(byRound.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([roundNumber, ms]) => ({
        roundNumber,
        leg: ms[0]?.leg ?? null,
        date: ms[0]?.date ?? null,
        matches: ms,
      }));
  }, [competitionMatches, selectedCompetition]);

  const cupRounds = React.useMemo(() => {
    if (!selectedCompetition || selectedCompetition.type !== "cup") return [];
    const byRound = new Map<number, Match[]>();
    competitionMatches.forEach((m) => {
      const rn = m.roundNumber ?? null;
      if (!rn) return;
      if (!byRound.has(rn)) byRound.set(rn, []);
      byRound.get(rn)!.push(m);
    });
    return Array.from(byRound.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([roundNumber, ms]) => ({
        roundNumber,
        label: ms[0]?.round || `Tour ${roundNumber}`,
        date: ms[0]?.date ?? null,
        matches: [...ms].sort((a, b) => (a.bracketPosition ?? 0) - (b.bracketPosition ?? 0)),
      }));
  }, [competitionMatches, selectedCompetition]);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [createSaving, setCreateSaving] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    name: "",
    season: "",
    category: "",
    startDate: "",
    endDate: "",
    type: "league" as CompetitionType,
    clubIds: [] as string[],
  });
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [seasonsError, setSeasonsError] = React.useState<string | null>(null);

  const [editOpen, setEditOpen] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);
  const [editSaving, setEditSaving] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    id: "",
    name: "",
    season: "",
    category: "",
    startDate: "",
    endDate: "",
    type: "league" as CompetitionType,
    clubIds: [] as string[],
  });

  const [lockOpen, setLockOpen] = React.useState(false);
  const [lockError, setLockError] = React.useState<string | null>(null);
  const [lockSaving, setLockSaving] = React.useState(false);
  const [lockForm, setLockForm] = React.useState({
    startDate: "",
    time: "19:00",
    roundIntervalDays: 7,
    matchIntervalMinutes: 120,
    venue: "",
  });
  const [lockDrawMode, setLockDrawMode] = React.useState<"auto" | "manual">("auto");
  const [lockPairs, setLockPairs] = React.useState<Array<{ homeTeamId: string; awayTeamId: string }>>([]);
  const [lockPairDraft, setLockPairDraft] = React.useState({ homeTeamId: "", awayTeamId: "" });

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [sheetError, setSheetError] = React.useState<string | null>(null);
  const [sheetSuccess, setSheetSuccess] = React.useState<string | null>(null);
  const [sheetSaving, setSheetSaving] = React.useState(false);
  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(null);
  const [sheetForm, setSheetForm] = React.useState({
    status: "draft" as MatchSheet["status"],
    homeRoster: [] as string[],
    awayRoster: [] as string[],
    events: [] as MatchEvent[],
  });
  const [homeRosterSearch, setHomeRosterSearch] = React.useState("");
  const [awayRosterSearch, setAwayRosterSearch] = React.useState("");

  const [standings, setStandings] = React.useState<StandingRow[]>([]);
  const [leaderboard, setLeaderboard] = React.useState<PlayerLeaderboardRow[]>([]);
  const [statsLoading, setStatsLoading] = React.useState(false);
  const [statsError, setStatsError] = React.useState<string | null>(null);
  const [statsRefreshToken, setStatsRefreshToken] = React.useState(0);
  const [leagueRankingTab, setLeagueRankingTab] = React.useState<"teams" | "players">("teams");

  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [scheduleError, setScheduleError] = React.useState<string | null>(null);
  const [scheduleSaving, setScheduleSaving] = React.useState(false);
  const [scheduleMatch, setScheduleMatch] = React.useState<Match | null>(null);
  const [scheduleForm, setScheduleForm] = React.useState({
    date: "",
    time: "19:00",
    venue: "",
  });

  const activeClubs = React.useMemo(
    () => clubs.filter((c) => c.status === "active").sort((a, b) => (a.acronym || a.name).localeCompare(b.acronym || b.name)),
    [clubs],
  );

  React.useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    const loadSeasons = async () => {
      try {
        setSeasonsError(null);
        const res = await fetch("/api/licensing/seasons");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (cancelled) return;
        const normalized: Season[] = (data || []).map((s: any) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          isActive: s.is_active ?? s.isActive,
        }));
        setSeasons(normalized);
        setCreateForm((prev) => {
          if (prev.season || normalized.length === 0) return prev;
          const active = normalized.find((s) => s.isActive) || normalized[0];
          return { ...prev, season: active.code };
        });
      } catch (e) {
        if (!cancelled) setSeasonsError("Impossible de charger les saisons.");
      }
    };
    void loadSeasons();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const reloadAll = React.useCallback(async () => {
    const [cRes, clRes, mRes, sRes] = await Promise.all([
      fetch("/api/sport/competitions"),
      fetch("/api/sport/clubs"),
      fetch("/api/sport/matches"),
      fetch("/api/sport/match-sheets"),
    ]);
    if (cRes.ok) setCompetitions(await cRes.json());
    if (clRes.ok) setClubs(await clRes.json());
    if (mRes.ok) setMatches(await mRes.json());
    if (sRes.ok) setMatchSheets(await sRes.json());
  }, []);

  const openEdit = React.useCallback(() => {
    if (!selectedCompetition) return;
    const clubsForCompetition = clubs
      .filter((c) => c.status === "active" && (c.assignedCompetitions || []).includes(selectedCompetition.id))
      .map((c) => c.id);
    setEditForm({
      id: selectedCompetition.id,
      name: selectedCompetition.name,
      season: selectedCompetition.season,
      category: selectedCompetition.category || "",
      startDate: toDateInputValue(selectedCompetition.startDate),
      endDate: toDateInputValue(selectedCompetition.endDate),
      type: selectedCompetition.type,
      clubIds: clubsForCompetition,
    });
    setEditError(null);
    setEditOpen(true);
  }, [clubs, selectedCompetition]);

  const submitEdit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isAdmin) return;
      setEditError(null);
      const clubIds = Array.from(new Set((editForm.clubIds || []).filter(Boolean)));
      if (!editForm.name || !editForm.season || !editForm.startDate || !editForm.endDate) {
        setEditError("Veuillez remplir tous les champs.");
        return;
      }
      const start = new Date(editForm.startDate);
      const end = new Date(editForm.endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setEditError("Dates invalides.");
        return;
      }
      if (end.getTime() < start.getTime()) {
        setEditError("La date de fin doit être après la date de début.");
        return;
      }
      const canEditClubs = selectedCompetition?.phase === "draft" || selectedCompetition?.phase === "prepared";
      if (canEditClubs && !editForm.category) {
        setEditError("Veuillez sélectionner une catégorie.");
        return;
      }
      if (clubIds.length < 2) {
        setEditError("Veuillez sélectionner au moins 2 clubs.");
        return;
      }

      setEditSaving(true);
      try {
        const payload: any = {
          name: editForm.name,
          season: editForm.season,
          startDate: editForm.startDate,
          endDate: editForm.endDate,
        };
        if (canEditClubs) {
          payload.type = editForm.type;
          payload.category = editForm.category || undefined;
          payload.clubIds = clubIds;
          payload.cupTeamCount = editForm.type === "cup" ? clubIds.length : undefined;
        }
        const res = await fetch(`/api/sport/competitions/${editForm.id}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const t = await res.text();
          setEditError(t || "Impossible de modifier la compétition.");
          return;
        }
        await reloadAll();
        setEditOpen(false);
      } finally {
        setEditSaving(false);
      }
    },
    [editForm, isAdmin, reloadAll, selectedCompetition?.phase],
  );

  const deleteCompetition = React.useCallback(async () => {
    if (!isAdmin || !selectedCompetition) return;
    const ok = window.confirm("Supprimer cette compétition ? Cette action supprimera aussi ses matchs et feuilles.");
    if (!ok) return;
    const res = await fetch(`/api/sport/competitions/${selectedCompetition.id}`, { method: "DELETE" });
    if (!res.ok) return;
    await reloadAll();
    setSelectedCompetitionId((prev) => {
      if (prev !== selectedCompetition.id) return prev;
      const remaining = competitions.filter((c) => c.id !== selectedCompetition.id);
      return remaining[0]?.id || null;
    });
  }, [competitions, isAdmin, reloadAll, selectedCompetition]);

  const openLock = React.useCallback(() => {
    if (!selectedCompetition) return;
    const d = new Date(selectedCompetition.startDate);
    const date = !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "";
    setLockForm((prev) => ({ ...prev, startDate: date || prev.startDate }));
    setLockDrawMode("auto");
    setLockPairs([]);
    setLockPairDraft({ homeTeamId: "", awayTeamId: "" });
    setLockError(null);
    setLockOpen(true);
  }, [selectedCompetition]);

  const seasonOptions = React.useMemo(() => {
    return [...seasons].sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
  }, [seasons]);

  React.useEffect(() => {
    if (!selectedCompetition) {
      setStandings([]);
      setLeaderboard([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setStatsError(null);
      setStatsLoading(true);
      try {
        const [standingsRes, leaderboardRes] = await Promise.all([
          selectedCompetition.type === "league"
            ? fetch(`/api/sport/competitions/${selectedCompetition.id}/standings`)
            : Promise.resolve(null),
          fetch(`/api/sport/competitions/${selectedCompetition.id}/player-stats`),
        ]);

        if (cancelled) return;

        if (standingsRes && standingsRes.ok) {
          const data = await standingsRes.json();
          setStandings((data?.standings || []) as StandingRow[]);
        } else {
          setStandings([]);
        }

        if (!leaderboardRes.ok) throw new Error();
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard((leaderboardData?.leaderboard || []) as PlayerLeaderboardRow[]);
      } catch (e) {
        if (!cancelled) setStatsError("Impossible de charger les classements.");
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedCompetition, statsRefreshToken]);

  const submitCreate = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isAdmin) return;
      setCreateError(null);
      const clubIds = Array.from(new Set((createForm.clubIds || []).filter(Boolean)));
      if (!createForm.name || !createForm.season || !createForm.startDate || !createForm.endDate) {
        setCreateError("Veuillez remplir tous les champs.");
        return;
      }
      if (!createForm.category) {
        setCreateError("Veuillez sélectionner une catégorie.");
        return;
      }
      if (clubIds.length < 2) {
        setCreateError("Veuillez sélectionner au moins 2 clubs.");
        return;
      }
      setCreateSaving(true);
      try {
        const res = await fetch("/api/sport/competitions", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: createForm.name,
            season: createForm.season,
            category: createForm.category,
            startDate: createForm.startDate,
            endDate: createForm.endDate,
            type: createForm.type,
            clubIds,
            cupTeamCount: createForm.type === "cup" ? clubIds.length : undefined,
          }),
        });
        if (!res.ok) {
          const t = await res.text();
          setCreateError(t || "Impossible de créer la compétition.");
          return;
        }
        await reloadAll();
        setCreateOpen(false);
        setCreateForm({ name: "", season: "", category: "", startDate: "", endDate: "", type: "league", clubIds: [] });
      } finally {
        setCreateSaving(false);
      }
    },
    [createForm, isAdmin, reloadAll],
  );

  const submitLock = React.useCallback(async () => {
    if (!isAdmin || !selectedCompetition) return;
    setLockError(null);
    if (!lockForm.startDate || !lockForm.time) {
      setLockError("Renseignez une date et une heure.");
      return;
    }

    if (selectedCompetition.type === "cup" && lockDrawMode === "manual") {
      const n = competitionClubs.length;
      const P = nextPow2(n);
      const requiredPairs = n === P ? n / 2 : n - P / 2;
      if (lockPairs.length !== requiredPairs) {
        setLockError("Tirage manuel incomplet pour le 1er tour.");
        return;
      }
      const flat = lockPairs.flatMap((p) => [p.homeTeamId, p.awayTeamId]).filter(Boolean);
      const unique = new Set(flat);
      if (unique.size !== flat.length) {
        setLockError("Équipe dupliquée dans le tirage manuel.");
        return;
      }
    }

    setLockSaving(true);
    try {
      const endpoint =
        selectedCompetition.type === "cup" && (selectedCompetition.phase === "locked" || selectedCompetition.phase === "active")
          ? `/api/sport/competitions/${selectedCompetition.id}/regenerate`
          : `/api/sport/competitions/${selectedCompetition.id}/lock`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          startDate: lockForm.startDate,
          time: lockForm.time,
          roundIntervalDays: lockForm.roundIntervalDays,
          matchIntervalMinutes: lockForm.matchIntervalMinutes,
          venue: lockForm.venue || undefined,
          mode: selectedCompetition.type === "cup" ? lockDrawMode : "auto",
          firstRoundPairs: selectedCompetition.type === "cup" && lockDrawMode === "manual" ? lockPairs : undefined,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        setLockError(t || "Impossible de verrouiller.");
        return;
      }
      await reloadAll();
      setLockOpen(false);
    } finally {
      setLockSaving(false);
    }
  }, [competitionClubs.length, isAdmin, lockDrawMode, lockForm, lockPairs, reloadAll, selectedCompetition]);

  const openSchedule = React.useCallback((match: Match) => {
    const date = toDateInputValue(match.date);
    const time = match.time || "19:00";
    setScheduleMatch(match);
    setScheduleForm({ date, time, venue: match.venue || "" });
    setScheduleError(null);
    setScheduleOpen(true);
  }, []);

  const submitSchedule = React.useCallback(async () => {
    if (!isAdmin || !scheduleMatch) return;
    setScheduleError(null);
    if (!scheduleForm.date || !scheduleForm.time) {
      setScheduleError("Renseignez une date et une heure.");
      return;
    }
    const dt = new Date(`${scheduleForm.date}T${scheduleForm.time}`);
    if (isNaN(dt.getTime())) {
      setScheduleError("Date/heure invalide.");
      return;
    }
    setScheduleSaving(true);
    try {
      const res = await fetch(`/api/sport/matches/${scheduleMatch.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          date: dt.toISOString(),
          venue: scheduleForm.venue || undefined,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        setScheduleError(t || "Impossible de modifier l'horaire.");
        return;
      }
      const updated = await res.json();
      setMatches((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
      setScheduleOpen(false);
    } finally {
      setScheduleSaving(false);
    }
  }, [isAdmin, scheduleForm.date, scheduleForm.time, scheduleForm.venue, scheduleMatch]);

  const openSheet = React.useCallback(
    (match: Match) => {
      const existing = matchSheets.find((s) => s.matchId === match.id) || null;
      const normalizedEvents = (existing?.events || []).map((ev) => ({
        ...ev,
        id: ev.id || createLocalId(),
        period: ev.period || "regulation",
      }));
      setSelectedMatch(match);
      setSheetForm({
        status: existing?.status || "draft",
        homeRoster: existing?.homeRoster || [],
        awayRoster: existing?.awayRoster || [],
        events: normalizedEvents,
      });
      setHomeRosterSearch("");
      setAwayRosterSearch("");
      setSheetError(null);
      setSheetSuccess(null);
      setSheetOpen(true);
    },
    [matchSheets],
  );

  const sheetDerived = React.useMemo(() => {
    if (!selectedMatch) return { home: 0, away: 0, hasOvertime: false };
    return deriveScores(sheetForm.events, selectedMatch.homeTeamId, selectedMatch.awayTeamId);
  }, [selectedMatch, sheetForm.events]);

  const toggleRoster = React.useCallback((side: "home" | "away", playerId: string) => {
    setSheetForm((prev) => {
      const key = side === "home" ? "homeRoster" : "awayRoster";
      const current = prev[key];
      const next = current.includes(playerId) ? current.filter((id) => id !== playerId) : [...current, playerId];
      return { ...prev, [key]: next };
    });
  }, []);

  const addGoal = React.useCallback((teamId: string, period: MatchEvent["period"]) => {
    if (!selectedMatch) return;
    const teamPlayers = players.filter((p) => p.clubId === teamId);
    const defaultPlayer = teamPlayers[0]?.id || "";
    setSheetForm((prev) => ({
      ...prev,
      events: [
        {
          id: createLocalId(),
          type: "goal",
          teamId,
          playerId: defaultPlayer,
          assistIds: [],
          period,
        },
        ...prev.events,
      ],
    }));
  }, [players, selectedMatch]);

  const updateEvent = React.useCallback((eventId: string, patch: Partial<MatchEvent>) => {
    setSheetForm((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === eventId
          ? { ...e, ...patch, assistIds: patch.assistIds ? patch.assistIds.filter(Boolean) : e.assistIds }
          : e,
      ),
    }));
  }, []);

  const removeEvent = React.useCallback((eventId: string) => {
    setSheetForm((prev) => ({ ...prev, events: prev.events.filter((e) => e.id !== eventId) }));
  }, []);

  const saveSheet = React.useCallback(
    async (nextStatus: MatchSheet["status"]) => {
      if (!isAdmin || !selectedMatch) return;
      setSheetError(null);
      setSheetSuccess(null);
      const sanitizedEvents = sheetForm.events.filter((e) => e.playerId && e.teamId);
      const hasIncomplete = sheetForm.events.some((e) => !e.playerId || !e.teamId);
      if (nextStatus === "validated") {
        if (!selectedMatch.homeTeamId || !selectedMatch.awayTeamId) {
          setSheetError("Les deux équipes doivent être définies pour valider.");
          return;
        }
        if (hasIncomplete) {
          setSheetError("Complétez tous les buteurs et équipes avant de valider.");
          return;
        }
        if (sheetForm.homeRoster.length === 0 || sheetForm.awayRoster.length === 0) {
          setSheetError("Sélectionnez les joueurs des deux équipes.");
          return;
        }
        const rosterSet = new Set([...sheetForm.homeRoster, ...sheetForm.awayRoster]);
        const invalidScorer = sanitizedEvents.find((e) => !rosterSet.has(e.playerId));
        if (invalidScorer) {
          setSheetError("Les buteurs doivent appartenir aux effectifs sélectionnés.");
          return;
        }
        const invalidAssist = sanitizedEvents.find((e) => (e.assistIds || []).some((id) => id && !rosterSet.has(id)));
        if (invalidAssist) {
          setSheetError("Les passeurs doivent appartenir aux effectifs sélectionnés.");
          return;
        }
        const derived = deriveScores(sanitizedEvents, selectedMatch.homeTeamId, selectedMatch.awayTeamId);
        if (derived.home === derived.away) {
          setSheetError("Match nul interdit. Ajoutez un but en prolongation.");
          return;
        }
      }

      setSheetSaving(true);
      try {
        const res = await fetch(`/api/sport/match-sheets/${selectedMatch.id}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            status: nextStatus,
            homeRoster: sheetForm.homeRoster,
            awayRoster: sheetForm.awayRoster,
            events: sanitizedEvents.map((e) => ({
              type: e.type,
              teamId: e.teamId,
              playerId: e.playerId,
              assistIds: e.assistIds || [],
              period: e.period || "regulation",
            })),
          }),
        });
        if (!res.ok) {
          const t = await res.text();
          setSheetError(t || "Impossible d’enregistrer la feuille.");
          return;
        }
        const data = await res.json();
        if (data?.sheet) {
          setMatchSheets((prev) => {
            const idx = prev.findIndex((s) => s.matchId === data.sheet.matchId);
            if (idx === -1) return [data.sheet, ...prev];
            const next = [...prev];
            next[idx] = data.sheet;
            return next;
          });
        }
        if (data?.match) {
          setMatches((prev) => prev.map((m) => (m.id === data.match.id ? { ...m, ...data.match } : m)));
          setSelectedMatch(data.match);
        }
        setSheetForm((prev) => ({ ...prev, status: nextStatus }));
        setSheetSuccess(nextStatus === "validated" ? "Feuille de match validée avec succès." : "Brouillon enregistré.");
        setTimeout(() => setSheetSuccess(null), 2500);
        if (nextStatus === "validated") {
          await reloadAll();
          setStatsRefreshToken((v) => v + 1);
        }
      } finally {
        setSheetSaving(false);
      }
    },
    [isAdmin, reloadAll, selectedMatch, sheetForm, setMatches],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">Compétitions</div>
            <div className="mt-1 text-xs font-medium text-gray-500">L2 (aller/retour) • C1 (élimination directe)</div>
          </div>
          {isAdmin ? (
            <button
              onClick={() => {
                setCreateError(null);
                setCreateOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
              type="button"
            >
              <Plus className="h-4 w-4" />
              Créer
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {competitions.map((c) => {
            const active = c.id === selectedCompetitionId;
            const icon = c.type === "cup" ? Trophy : CalendarDays;
            const Icon = icon;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCompetitionId(c.id)}
                className={cn(
                  "flex min-w-[260px] shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                  active ? "border-brand-200 bg-brand-50" : "border-gray-200 bg-white hover:bg-gray-50",
                )}
                type="button"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-2xl",
                    c.type === "cup" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-gray-900">{c.name}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs font-medium text-gray-500">
                    <span>{c.season}</span>
                    <span>•</span>
                    <span>{c.type === "cup" ? "Coupe" : "Ligue"}</span>
                    <span>•</span>
                    <span className="uppercase">{c.phase}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-900">{c.participantCount}</div>
                  <div className="text-[10px] font-semibold text-gray-500">équipes</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedCompetition ? (
        <motion.div
          key={selectedCompetition.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xl font-bold text-gray-900">{selectedCompetition.name}</div>
                  <div className="mt-1 text-sm font-medium text-gray-500">
                    {selectedCompetition.type === "cup" ? "Coupe (C1)" : "Ligue (L2 aller/retour)"} •{" "}
                    {formatDateTime(selectedCompetition.startDate)} → {formatDateTime(selectedCompetition.endDate)}
                  </div>
                </div>
                {isAdmin ? (
                  <div className="flex gap-2">
                    <button
                      onClick={openEdit}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                      Modifier
                    </button>
                    <button
                      onClick={deleteCompetition}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                    <button
                      onClick={openLock}
                      disabled={selectedCompetition.phase === "locked" || selectedCompetition.phase === "active"}
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      type="button"
                    >
                      <Lock className="h-4 w-4" />
                      Verrouiller & Générer
                    </button>
                    {selectedCompetition.type === "cup" &&
                    (selectedCompetition.phase === "locked" || selectedCompetition.phase === "active") &&
                    !hasAnyMatchSheetInCompetition ? (
                      <button
                        onClick={openLock}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                        type="button"
                      >
                        <Shuffle className="h-4 w-4" />
                        Régénérer tirage
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-bold text-gray-500">Participants</div>
                  <div className="mt-1 text-2xl font-black text-gray-900">{competitionClubs.length}</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-bold text-gray-500">Matchs</div>
                  <div className="mt-1 text-2xl font-black text-gray-900">{competitionMatches.length}</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-bold text-gray-500">Phase</div>
                  <div className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-800">
                    {selectedCompetition.phase.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm font-bold text-gray-800">Clubs</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {competitionClubs.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700"
                    >
                      {c.acronym || c.name}
                    </div>
                  ))}
                  {competitionClubs.length === 0 ? (
                    <div className="text-sm font-medium text-gray-500">Aucun club affecté.</div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-gray-800">
                  {selectedCompetition.type === "cup" ? "Tableau" : "Calendrier"}
                </div>
                <div className="text-xs font-semibold text-gray-500">
                  {selectedCompetition.type === "cup"
                    ? "C1 — qualifiés automatiques à la validation"
                    : "L2 — aller/retour généré automatiquement"}
                </div>
              </div>

              {selectedCompetition.type === "league" ? (
                <div className="mt-4 space-y-4">
                  {leagueRounds.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm font-semibold text-gray-600">
                      Aucun match. Verrouille la compétition pour générer les tours.
                    </div>
                  ) : (
                    leagueRounds.map((r) => (
                      <div key={r.roundNumber} className="rounded-2xl border border-gray-200 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                          <div className="text-sm font-bold text-gray-900">
                            Tour {r.roundNumber}{" "}
                            <span className="text-xs font-semibold text-gray-500">
                              {r.leg === 2 ? "Retour" : "Aller"}
                            </span>
                          </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {r.matches.map((m) => {
                            const home = getTeamDisplay(m.homeTeamId, m.homeTeamName);
                            const away = getTeamDisplay(m.awayTeamId, m.awayTeamName);
                            return (
                              <div key={m.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                  <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                      {home.logoId ? (
                                        <img
                                          src={`/api/documents/view?id=${home.logoId}`}
                                          alt={home.name}
                                          className="h-8 w-8 rounded-xl border border-gray-200 object-cover"
                                        />
                                      ) : (
                                        <div className="h-8 w-8 rounded-xl border border-gray-200 bg-gray-50" />
                                      )}
                                      <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-gray-900">{home.name}</div>
                                        <div className="truncate text-[11px] font-semibold text-gray-500">{home.acronym}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 min-w-0">
                                      {away.logoId ? (
                                        <img
                                          src={`/api/documents/view?id=${away.logoId}`}
                                          alt={away.name}
                                          className="h-8 w-8 rounded-xl border border-gray-200 object-cover"
                                        />
                                      ) : (
                                        <div className="h-8 w-8 rounded-xl border border-gray-200 bg-gray-50" />
                                      )}
                                      <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-gray-900">{away.name}</div>
                                        <div className="truncate text-[11px] font-semibold text-gray-500">{away.acronym}</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-2 truncate text-xs font-medium text-gray-500">
                                    {m.competitionName} • {formatDateTime(m.date)} • {m.time} • {m.venue || "—"}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-3 sm:justify-end">
                                  <div className="text-sm font-black text-gray-900">
                                    {m.homeScore ?? "—"} - {m.awayScore ?? "—"}
                                  </div>
                                  {isAdmin ? (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => openSchedule(m)}
                                        className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                        type="button"
                                      >
                                        <span className="inline-flex items-center gap-1">
                                          <Clock3 className="h-3.5 w-3.5" />
                                          Horaire
                                        </span>
                                      </button>
                                      <button
                                        onClick={() => openSheet(m)}
                                        className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                        type="button"
                                      >
                                        Feuille
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {cupRounds.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm font-semibold text-gray-600">
                      Aucun match. Verrouille la compétition pour générer le tableau.
                    </div>
                  ) : (
                    cupRounds.map((r) => (
                      <div key={r.roundNumber} className="rounded-2xl border border-gray-200 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                          <div className="text-sm font-bold text-gray-900">{r.label}</div>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {r.matches.map((m) => {
                            const home = getTeamDisplay(m.homeTeamId, m.homeTeamName);
                            const away = getTeamDisplay(m.awayTeamId, m.awayTeamName);
                            return (
                              <div key={m.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                  <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                      {home.logoId ? (
                                        <img
                                          src={`/api/documents/view?id=${home.logoId}`}
                                          alt={home.name}
                                          className="h-8 w-8 rounded-xl border border-gray-200 object-cover"
                                        />
                                      ) : (
                                        <div className="h-8 w-8 rounded-xl border border-gray-200 bg-gray-50" />
                                      )}
                                      <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-gray-900">{home.name}</div>
                                        <div className="truncate text-[11px] font-semibold text-gray-500">{home.acronym}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 min-w-0">
                                      {away.logoId ? (
                                        <img
                                          src={`/api/documents/view?id=${away.logoId}`}
                                          alt={away.name}
                                          className="h-8 w-8 rounded-xl border border-gray-200 object-cover"
                                        />
                                      ) : (
                                        <div className="h-8 w-8 rounded-xl border border-gray-200 bg-gray-50" />
                                      )}
                                      <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-gray-900">{away.name}</div>
                                        <div className="truncate text-[11px] font-semibold text-gray-500">{away.acronym}</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-2 truncate text-xs font-medium text-gray-500">
                                    {m.competitionName} • {formatDateTime(m.date)} • {m.time} • {m.venue || "—"}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-3 sm:justify-end">
                                  <div className="text-sm font-black text-gray-900">
                                    {m.homeScore ?? "—"} - {m.awayScore ?? "—"}
                                  </div>
                                  {isAdmin ? (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => openSchedule(m)}
                                        className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                        type="button"
                                      >
                                        <span className="inline-flex items-center gap-1">
                                          <Clock3 className="h-3.5 w-3.5" />
                                          Horaire
                                        </span>
                                      </button>
                                      <button
                                        onClick={() => openSheet(m)}
                                        className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                        type="button"
                                      >
                                        Feuille
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {selectedCompetition.type === "league" ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-800">Classements</div>
                    <div className="mt-1 text-xs font-semibold text-gray-500">
                      {leagueRankingTab === "teams" ? "Équipes" : "Joueurs"}
                    </div>
                  </div>
                  <div className="inline-flex rounded-2xl border border-gray-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setLeagueRankingTab("teams")}
                      className={cn(
                        "rounded-2xl px-4 py-2 text-xs font-bold",
                        leagueRankingTab === "teams" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50",
                      )}
                    >
                      Classement équipes
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeagueRankingTab("players")}
                      className={cn(
                        "rounded-2xl px-4 py-2 text-xs font-bold",
                        leagueRankingTab === "players" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50",
                      )}
                    >
                      Classement joueurs
                    </button>
                  </div>
                </div>

                {statsError ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {statsError}
                  </div>
                ) : null}
                {statsLoading ? (
                  <div className="mt-4 text-sm font-semibold text-gray-600">Chargement…</div>
                ) : leagueRankingTab === "teams" ? (
                  standings.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm font-semibold text-gray-600">
                      Aucun classement (aucun match complété).
                    </div>
                  ) : (
                    <div className="mt-4 overflow-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                          <tr>
                            <th className="py-2 pr-2">#</th>
                            <th className="py-2 pr-2">Équipe</th>
                            <th className="py-2 pr-2 text-right">MJ</th>
                            <th className="py-2 pr-2 text-right">V</th>
                            <th className="py-2 pr-2 text-right">D</th>
                            <th className="py-2 pr-2 text-right">OT</th>
                            <th className="py-2 pr-0 text-right">PTS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {standings.map((row) => {
                            const club = clubById.get(row.clubId);
                            const logoId = row.logoDocumentId || club?.logoDocumentId || null;
                            const name = club?.name || row.clubName;
                            const acronym = club?.acronym || row.clubAcronym;
                            return (
                              <tr key={row.clubId} className="text-sm font-semibold text-gray-800">
                                <td className="py-3 pr-2">{row.rank}</td>
                                <td className="py-3 pr-2">
                                  <div className="flex items-center gap-3 min-w-0">
                                    {logoId ? (
                                      <img
                                        src={`/api/documents/view?id=${logoId}`}
                                        alt={name}
                                        className="h-8 w-8 rounded-xl border border-gray-200 object-cover"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded-xl border border-gray-200 bg-gray-50" />
                                    )}
                                    <div className="min-w-0">
                                      <div className="truncate text-sm font-bold text-gray-900">{name}</div>
                                      <div className="truncate text-[11px] font-semibold text-gray-500">{acronym}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 pr-2 text-right">{row.gp}</td>
                                <td className="py-3 pr-2 text-right">{row.w}</td>
                                <td className="py-3 pr-2 text-right">{row.l}</td>
                                <td className="py-3 pr-2 text-right">{row.ot}</td>
                                <td className="py-3 pr-0 text-right font-black text-gray-900">{row.pts}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : leaderboard.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm font-semibold text-gray-600">
                    Aucune statistique (aucun match validé).
                  </div>
                ) : (
                  <div className="mt-4 overflow-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                        <tr>
                          <th className="py-2 pr-2">#</th>
                          <th className="py-2 pr-2">Joueur</th>
                          <th className="py-2 pr-2">Club</th>
                          <th className="py-2 pr-2 text-right">MJ</th>
                          <th className="py-2 pr-2 text-right">B</th>
                          <th className="py-2 pr-2 text-right">P</th>
                          <th className="py-2 pr-0 text-right">PTS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {leaderboard.slice(0, 30).map((row, index) => (
                          <tr key={row.playerId} className="text-sm font-semibold text-gray-800">
                            <td className="py-3 pr-2">{index + 1}</td>
                            <td className="py-3 pr-2">
                              <div className="truncate text-sm font-bold text-gray-900">
                                {row.playerName}{row.jerseyNumber ? ` (#${row.jerseyNumber})` : ""}
                              </div>
                            </td>
                            <td className="py-3 pr-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {row.clubLogoId ? (
                                  <img
                                    src={`/api/documents/view?id=${row.clubLogoId}`}
                                    alt={row.clubName}
                                    className="h-7 w-7 rounded-xl border border-gray-200 object-cover"
                                  />
                                ) : (
                                  <div className="h-7 w-7 rounded-xl border border-gray-200 bg-gray-50" />
                                )}
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-semibold text-gray-900">{row.clubName || "—"}</div>
                                  <div className="truncate text-[11px] font-semibold text-gray-500">{row.clubAcronym || ""}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pr-2 text-right">{row.matchesPlayed}</td>
                            <td className="py-3 pr-2 text-right">{row.goals}</td>
                            <td className="py-3 pr-2 text-right">{row.assists}</td>
                            <td className="py-3 pr-0 text-right font-black text-gray-900">{row.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-800">Classement joueurs</div>
                  <div className="text-xs font-semibold text-gray-500">Buts • Passes • Points</div>
                </div>
                {statsError ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {statsError}
                  </div>
                ) : null}
                {statsLoading ? (
                  <div className="mt-4 text-sm font-semibold text-gray-600">Chargement…</div>
                ) : leaderboard.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm font-semibold text-gray-600">
                    Aucune statistique (aucun match validé).
                  </div>
                ) : (
                  <div className="mt-4 overflow-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                        <tr>
                          <th className="py-2 pr-2">#</th>
                          <th className="py-2 pr-2">Joueur</th>
                          <th className="py-2 pr-2">Club</th>
                          <th className="py-2 pr-2 text-right">MJ</th>
                          <th className="py-2 pr-2 text-right">B</th>
                          <th className="py-2 pr-2 text-right">P</th>
                          <th className="py-2 pr-0 text-right">PTS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {leaderboard.slice(0, 30).map((row, index) => (
                          <tr key={row.playerId} className="text-sm font-semibold text-gray-800">
                            <td className="py-3 pr-2">{index + 1}</td>
                            <td className="py-3 pr-2">
                              <div className="truncate text-sm font-bold text-gray-900">
                                {row.playerName}{row.jerseyNumber ? ` (#${row.jerseyNumber})` : ""}
                              </div>
                            </td>
                            <td className="py-3 pr-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {row.clubLogoId ? (
                                  <img
                                    src={`/api/documents/view?id=${row.clubLogoId}`}
                                    alt={row.clubName}
                                    className="h-7 w-7 rounded-xl border border-gray-200 object-cover"
                                  />
                                ) : (
                                  <div className="h-7 w-7 rounded-xl border border-gray-200 bg-gray-50" />
                                )}
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-semibold text-gray-900">{row.clubName || "—"}</div>
                                  <div className="truncate text-[11px] font-semibold text-gray-500">{row.clubAcronym || ""}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pr-2 text-right">{row.matchesPlayed}</td>
                            <td className="py-3 pr-2 text-right">{row.goals}</td>
                            <td className="py-3 pr-2 text-right">{row.assists}</td>
                            <td className="py-3 pr-0 text-right font-black text-gray-900">{row.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm font-semibold text-gray-600">
            Aucune compétition.
          </div>
        )}

      {createOpen ? (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="text-lg font-bold text-gray-900">Créer une compétition</div>
              <button
                onClick={() => setCreateOpen(false)}
                className="rounded-xl px-2 py-1 text-gray-500 hover:bg-gray-100"
                type="button"
              >
                ✕
              </button>
            </div>
            <form onSubmit={submitCreate} className="space-y-4 px-6 py-5">
              {createError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {createError}
                </div>
              ) : null}
              {seasonsError ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  {seasonsError}
                </div>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-gray-700">Nom</div>
                  <input
                    value={createForm.name}
                    onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                    className="h-11 rounded-2xl border border-gray-200 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-200/50"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-gray-700">Saison</div>
                  <select
                    value={createForm.season}
                    onChange={(e) => setCreateForm((p) => ({ ...p, season: e.target.value }))}
                    className="h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-4 focus:ring-brand-200/50"
                  >
                    <option value="">Sélectionner une saison</option>
                    {seasonOptions.map((s) => (
                      <option key={s.id} value={s.code}>
                        {s.name} ({s.code}){s.isActive ? " • Active" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-gray-700">Type</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCreateForm((p) => ({ ...p, type: "league" }))}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold",
                        createForm.type === "league"
                          ? "border-brand-200 bg-brand-50 text-brand-700"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                      )}
                    >
                      <CalendarDays className="h-4 w-4" />
                      Ligue (L2)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateForm((p) => ({ ...p, type: "cup" }))}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold",
                        createForm.type === "cup"
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                      )}
                    >
                      <Trophy className="h-4 w-4" />
                      Coupe (C1)
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-gray-700">Catégorie d'équipe</div>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))}
                    className="h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-4 focus:ring-brand-200/50"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {teamCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2 md:grid-cols-2 md:col-span-1">
                  <div className="grid gap-2">
                    <div className="text-sm font-semibold text-gray-700">Date début</div>
                    <input
                      type="date"
                      value={createForm.startDate}
                      onChange={(e) => setCreateForm((p) => ({ ...p, startDate: e.target.value }))}
                      className="h-11 rounded-2xl border border-gray-200 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-200/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="text-sm font-semibold text-gray-700">Date fin</div>
                    <input
                      type="date"
                      value={createForm.endDate}
                      onChange={(e) => setCreateForm((p) => ({ ...p, endDate: e.target.value }))}
                      className="h-11 rounded-2xl border border-gray-200 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-200/50"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-gray-800">Clubs participants</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCreateForm((p) => ({
                          ...p,
                          clubIds: activeClubs.map((c) => c.id),
                        }))
                      }
                      className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Tout
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateForm((p) => ({ ...p, clubIds: [] }))}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Aucun
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid max-h-64 gap-2 overflow-auto pr-1 sm:grid-cols-2">
                  {activeClubs.map((club) => {
                    const checked = createForm.clubIds.includes(club.id);
                    return (
                      <label
                        key={club.id}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-2xl border px-3 py-3",
                          checked ? "border-brand-200 bg-white" : "border-gray-200 bg-white/70",
                        )}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-gray-900">{club.acronym || club.name}</div>
                          <div className="truncate text-xs font-medium text-gray-500">{club.name}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked;
                            setCreateForm((p) => {
                              const set = new Set(p.clubIds);
                              if (next) set.add(club.id);
                              else set.delete(club.id);
                              return { ...p, clubIds: Array.from(set) };
                            });
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                      </label>
                    );
                  })}
                </div>

                <div className="mt-3 text-xs font-semibold text-gray-600">
                  Sélectionnés : {createForm.clubIds.length} •{" "}
                  {createForm.type === "cup"
                    ? `tableau basé sur ${createForm.clubIds.length} équipes`
                    : "aller/retour (L2)"}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createSaving}
                  className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {createSaving ? "..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editOpen ? (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="text-lg font-bold text-gray-900">Modifier la compétition</div>
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-xl px-2 py-1 text-gray-500 hover:bg-gray-100"
                type="button"
              >
                ✕
              </button>
            </div>
            <form onSubmit={submitEdit} className="space-y-4 px-6 py-5">
              {editError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {editError}
                </div>
              ) : null}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-semibold text-gray-700">
                {selectedCompetition && (selectedCompetition.phase === "draft" || selectedCompetition.phase === "prepared")
                  ? "Vous pouvez modifier les clubs et le type avant verrouillage."
                  : "Compétition verrouillée : modification des clubs et du type désactivée."}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-gray-700">Nom</div>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    className="h-11 rounded-2xl border border-gray-200 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-200/50"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-gray-700">Saison</div>
                  <select
                    value={editForm.season}
                    onChange={(e) => setEditForm((p) => ({ ...p, season: e.target.value }))}
                    className="h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-4 focus:ring-brand-200/50"
                  >
                    <option value="">Sélectionner une saison</option>
                    {seasonOptions.map((s) => (
                      <option key={s.id} value={s.code}>
                        {s.name} ({s.code}){s.isActive ? " • Active" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-gray-700">Date début</div>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm((p) => ({ ...p, startDate: e.target.value }))}
                    className="h-11 rounded-2xl border border-gray-200 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-200/50"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-gray-700">Date fin</div>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="h-11 rounded-2xl border border-gray-200 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-200/50"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-semibold text-gray-700">Type</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditForm((p) => ({ ...p, type: "league" }))}
                    disabled={!(selectedCompetition && (selectedCompetition.phase === "draft" || selectedCompetition.phase === "prepared"))}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold",
                      editForm.type === "league"
                        ? "border-brand-200 bg-brand-50 text-brand-700"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                      !(selectedCompetition && (selectedCompetition.phase === "draft" || selectedCompetition.phase === "prepared")) && "opacity-50",
                    )}
                  >
                    <CalendarDays className="h-4 w-4" />
                    Ligue (L2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm((p) => ({ ...p, type: "cup" }))}
                    disabled={!(selectedCompetition && (selectedCompetition.phase === "draft" || selectedCompetition.phase === "prepared"))}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold",
                      editForm.type === "cup"
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                      !(selectedCompetition && (selectedCompetition.phase === "draft" || selectedCompetition.phase === "prepared")) && "opacity-50",
                    )}
                  >
                    <Trophy className="h-4 w-4" />
                    Coupe (C1)
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-semibold text-gray-700">Catégorie d'équipe</div>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                  disabled={!(selectedCompetition && (selectedCompetition.phase === "draft" || selectedCompetition.phase === "prepared"))}
                  className="h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-4 focus:ring-brand-200/50 disabled:opacity-50"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {teamCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-gray-800">Clubs participants</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!(selectedCompetition && (selectedCompetition.phase === "draft" || selectedCompetition.phase === "prepared"))}
                      onClick={() =>
                        setEditForm((p) => ({
                          ...p,
                          clubIds: activeClubs.map((c) => c.id),
                        }))
                      }
                      className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Tout
                    </button>
                    <button
                      type="button"
                      disabled={!(selectedCompetition && (selectedCompetition.phase === "draft" || selectedCompetition.phase === "prepared"))}
                      onClick={() => setEditForm((p) => ({ ...p, clubIds: [] }))}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Aucun
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid max-h-64 gap-2 overflow-auto pr-1 sm:grid-cols-2">
                  {activeClubs.map((club) => {
                    const checked = editForm.clubIds.includes(club.id);
                    const disabled = !(selectedCompetition && (selectedCompetition.phase === "draft" || selectedCompetition.phase === "prepared"));
                    return (
                      <label
                        key={club.id}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-2xl border px-3 py-3",
                          checked ? "border-brand-200 bg-white" : "border-gray-200 bg-white/70",
                          disabled && "opacity-50",
                        )}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-gray-900">{club.acronym || club.name}</div>
                          <div className="truncate text-xs font-medium text-gray-500">{club.name}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={(e) => {
                            const next = e.target.checked;
                            setEditForm((p) => {
                              const set = new Set(p.clubIds);
                              if (next) set.add(club.id);
                              else set.delete(club.id);
                              return { ...p, clubIds: Array.from(set) };
                            });
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50"
                        />
                      </label>
                    );
                  })}
                </div>

                <div className="mt-3 text-xs font-semibold text-gray-600">
                  Sélectionnés : {editForm.clubIds.length}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {editSaving ? "..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {lockOpen && selectedCompetition ? (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Shuffle className="h-5 w-5" />
                Verrouiller & Générer
              </div>
              <button
                onClick={() => setLockOpen(false)}
                className="rounded-xl px-2 py-1 text-gray-500 hover:bg-gray-100"
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              {lockError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {lockError}
                </div>
              ) : null}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-semibold text-gray-700">
                {selectedCompetition.type === "cup"
                  ? "Coupe C1 : bracket généré + qualifiés automatiques à la validation."
                  : "Ligue L2 : aller/retour généré selon les équipes affectées."}
              </div>
              {selectedCompetition.type === "cup"
                ? (() => {
                    const n = competitionClubs.length;
                    const P = nextPow2(n);
                    const requiredPairs = n === P ? n / 2 : n - P / 2;
                    const byes = n - requiredPairs * 2;
                    const used = new Set(lockPairs.flatMap((p) => [p.homeTeamId, p.awayTeamId]).filter(Boolean));
                    const remaining = competitionClubs.filter((c) => !used.has(c.id));
                    return (
                      <div className="rounded-2xl border border-gray-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-bold text-gray-900">Tirage au sort</div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setLockDrawMode("auto");
                                setLockPairs([]);
                                setLockPairDraft({ homeTeamId: "", awayTeamId: "" });
                              }}
                              className={cn(
                                "rounded-xl border px-3 py-1.5 text-xs font-bold",
                                lockDrawMode === "auto"
                                  ? "border-gray-900 bg-gray-900 text-white"
                                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                              )}
                            >
                              Automatique
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setLockDrawMode("manual");
                                setLockPairs([]);
                                setLockPairDraft({ homeTeamId: "", awayTeamId: "" });
                              }}
                              className={cn(
                                "rounded-xl border px-3 py-1.5 text-xs font-bold",
                                lockDrawMode === "manual"
                                  ? "border-gray-900 bg-gray-900 text-white"
                                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                              )}
                            >
                              Manuel
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 text-xs font-semibold text-gray-600">
                          {n === P
                            ? `1er tour : ${requiredPairs} matchs`
                            : `Tour préliminaire : ${requiredPairs} matchs • Exemptés : ${byes}`}
                        </div>

                        {lockDrawMode === "manual" ? (
                          <div className="mt-4 space-y-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="grid gap-1">
                                <div className="text-xs font-bold text-gray-500">Domicile</div>
                                <select
                                  value={lockPairDraft.homeTeamId}
                                  onChange={(e) =>
                                    setLockPairDraft((p) => ({ ...p, homeTeamId: e.target.value }))
                                  }
                                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold outline-none"
                                >
                                  <option value="">Sélectionner…</option>
                                  {remaining.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name} ({c.acronym})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="grid gap-1">
                                <div className="text-xs font-bold text-gray-500">Extérieur</div>
                                <select
                                  value={lockPairDraft.awayTeamId}
                                  onChange={(e) =>
                                    setLockPairDraft((p) => ({ ...p, awayTeamId: e.target.value }))
                                  }
                                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold outline-none"
                                >
                                  <option value="">Sélectionner…</option>
                                  {remaining
                                    .filter((c) => c.id !== lockPairDraft.homeTeamId)
                                    .map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.name} ({c.acronym})
                                      </option>
                                    ))}
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="text-xs font-semibold text-gray-600">
                                Paires : {lockPairs.length}/{requiredPairs}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const home = lockPairDraft.homeTeamId;
                                  const away = lockPairDraft.awayTeamId;
                                  if (!home || !away || home === away) return;
                                  if (lockPairs.length >= requiredPairs) return;
                                  setLockPairs((prev) => [...prev, { homeTeamId: home, awayTeamId: away }]);
                                  setLockPairDraft({ homeTeamId: "", awayTeamId: "" });
                                }}
                                disabled={
                                  !lockPairDraft.homeTeamId ||
                                  !lockPairDraft.awayTeamId ||
                                  lockPairDraft.homeTeamId === lockPairDraft.awayTeamId ||
                                  lockPairs.length >= requiredPairs
                                }
                                className="rounded-xl bg-gray-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                              >
                                Ajouter la paire
                              </button>
                            </div>

                            {lockPairs.length > 0 ? (
                              <div className="max-h-36 overflow-auto rounded-2xl border border-gray-200 bg-gray-50 p-3 pr-2">
                                <div className="space-y-2">
                                  {lockPairs.map((p, idx) => {
                                    const home = clubById.get(p.homeTeamId);
                                    const away = clubById.get(p.awayTeamId);
                                    return (
                                      <div
                                        key={`${p.homeTeamId}-${p.awayTeamId}-${idx}`}
                                        className="flex h-12 items-center justify-between gap-2 rounded-xl bg-white px-3 py-2"
                                      >
                                        <div className="min-w-0 text-xs font-semibold text-gray-800">
                                          <span className="font-bold">{home?.acronym || home?.name || "—"}</span>{" "}
                                          <span className="text-gray-400">vs</span>{" "}
                                          <span className="font-bold">{away?.acronym || away?.name || "—"}</span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setLockPairs((prev) => prev.filter((_v, i) => i !== idx))
                                          }
                                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-50"
                                        >
                                          Retirer
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}

                            {n !== P && byes > 0 ? (
                              <div className="text-xs font-semibold text-gray-600">
                                Les équipes non utilisées dans ces paires seront qualifiées d'office (exemptées).
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })()
                : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-gray-700">Date (Tour 1)</div>
                  <input
                    type="date"
                    value={lockForm.startDate}
                    onChange={(e) => setLockForm((p) => ({ ...p, startDate: e.target.value }))}
                    className="h-11 rounded-2xl border border-gray-200 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-200/50"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-gray-700">Heure</div>
                  <input
                    value={lockForm.time}
                    onChange={(e) => setLockForm((p) => ({ ...p, time: e.target.value }))}
                    className="h-11 rounded-2xl border border-gray-200 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-200/50"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-gray-700">Intervalle tours (jours)</div>
                  <input
                    type="number"
                    min={1}
                    value={lockForm.roundIntervalDays}
                    onChange={(e) => setLockForm((p) => ({ ...p, roundIntervalDays: Number(e.target.value) }))}
                    className="h-11 rounded-2xl border border-gray-200 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-200/50"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-gray-700">Intervalle matchs (minutes)</div>
                  <input
                    type="number"
                    min={0}
                    value={lockForm.matchIntervalMinutes}
                    onChange={(e) => setLockForm((p) => ({ ...p, matchIntervalMinutes: Number(e.target.value) }))}
                    className="h-11 rounded-2xl border border-gray-200 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-200/50"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-semibold text-gray-700">Lieu (optionnel)</div>
                <input
                  value={lockForm.venue}
                  onChange={(e) => setLockForm((p) => ({ ...p, venue: e.target.value }))}
                  className="h-11 rounded-2xl border border-gray-200 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-200/50"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLockOpen(false)}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={submitLock}
                  disabled={lockSaving}
                  className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {lockSaving
                    ? "..."
                    : selectedCompetition.type === "cup" &&
                      (selectedCompetition.phase === "locked" || selectedCompetition.phase === "active")
                      ? "Régénérer"
                      : "Verrouiller"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {scheduleOpen && scheduleMatch ? (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Clock3 className="h-5 w-5" />
                Modifier l'horaire
              </div>
              <button
                onClick={() => {
                  setScheduleOpen(false);
                  setScheduleMatch(null);
                }}
                className="rounded-xl px-2 py-1 text-gray-500 hover:bg-gray-100"
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              {scheduleError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {scheduleError}
                </div>
              ) : null}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-semibold text-gray-700">
                {scheduleMatch.homeTeamName} vs {scheduleMatch.awayTeamName}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-gray-700">Date</div>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm((p) => ({ ...p, date: e.target.value }))}
                    className="h-11 rounded-2xl border border-gray-200 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-200/50"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-gray-700">Heure</div>
                  <input
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm((p) => ({ ...p, time: e.target.value }))}
                    className="h-11 rounded-2xl border border-gray-200 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-200/50"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-semibold text-gray-700">Lieu</div>
                <input
                  value={scheduleForm.venue}
                  onChange={(e) => setScheduleForm((p) => ({ ...p, venue: e.target.value }))}
                  className="h-11 rounded-2xl border border-gray-200 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-200/50"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScheduleOpen(false);
                    setScheduleMatch(null);
                  }}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={submitSchedule}
                  disabled={scheduleSaving}
                  className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {scheduleSaving ? "..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {sheetOpen && selectedMatch ? (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="min-w-0">
                  <div className="truncate text-lg font-bold text-gray-900">Feuille de match</div>
                  <div className="mt-0.5 truncate text-xs font-semibold text-gray-500">
                    {selectedMatch.round ? `${selectedMatch.round} • ` : ""}
                    {formatDateTime(selectedMatch.date)} • {selectedMatch.time} • {selectedMatch.venue || "—"}
                  </div>
                </div>
                <div className="shrink-0">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                      sheetForm.status === "validated"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-50 text-gray-700 border border-gray-200",
                    )}
                  >
                    {sheetForm.status === "validated" ? "Validée" : "Brouillon"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSheetOpen(false);
                  setSelectedMatch(null);
                }}
                className="rounded-xl px-2 py-1 text-gray-500 hover:bg-gray-100"
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[78vh] overflow-auto">
              {(() => {
                const homeId = selectedMatch.homeTeamId;
                const awayId = selectedMatch.awayTeamId;
                const home = getTeamDisplay(homeId, selectedMatch.homeTeamName);
                const away = getTeamDisplay(awayId, selectedMatch.awayTeamName);
                const homeEvents = sheetForm.events.filter((e) => !!homeId && e.teamId === homeId);
                const awayEvents = sheetForm.events.filter((e) => !!awayId && e.teamId === awayId);
                const homeRosterPlayers = players
                  .filter((p) => p.clubId === homeId)
                  .filter((p) => {
                    const q = homeRosterSearch.trim().toLowerCase();
                    if (!q) return true;
                    return `${p.firstName} ${p.lastName} #${p.jerseyNumber}`.toLowerCase().includes(q);
                  })
                  .sort((a, b) => (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName));
                const awayRosterPlayers = players
                  .filter((p) => p.clubId === awayId)
                  .filter((p) => {
                    const q = awayRosterSearch.trim().toLowerCase();
                    if (!q) return true;
                    return `${p.firstName} ${p.lastName} #${p.jerseyNumber}`.toLowerCase().includes(q);
                  })
                  .sort((a, b) => (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName));

                const renderGoal = (ev: MatchEvent, index: number, teamId: string | null, side: "home" | "away") => {
                  const rosterPlayers = side === "home" ? sheetForm.homeRoster : sheetForm.awayRoster;
                  const teamPlayers = players
                    .filter((p) => p.clubId === teamId)
                    .filter((p) => rosterPlayers.includes(p.id))
                    .sort((a, b) => (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName));
                  const assist1 = ev.assistIds?.[0] || "";
                  const assist2 = ev.assistIds?.[1] || "";
                  return (
                    <div
                      key={ev.id}
                      className={cn(
                        "rounded-2xl border p-4",
                        side === "home" ? "border-blue-200 bg-blue-50/40" : "border-red-200 bg-red-50/40",
                      )}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-xs font-bold text-gray-800">
                          But #{index + 1}{" "}
                          <span className="ml-2 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-bold text-gray-700">
                            {ev.period === "overtime" ? "OT" : "R"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEvent(ev.id)}
                          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50"
                        >
                          Supprimer
                        </button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-12 md:items-center">
                        <div className="md:col-span-3">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Période</div>
                          <select
                            value={ev.period || "regulation"}
                            onChange={(e) => updateEvent(ev.id, { period: e.target.value as any })}
                            className="mt-1 h-10 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm font-semibold outline-none"
                          >
                            <option value="regulation">Réglementaire</option>
                            <option value="overtime">Prolongation</option>
                          </select>
                        </div>
                        <div className="md:col-span-4">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Buteur</div>
                          <select
                            value={ev.playerId}
                            onChange={(e) => updateEvent(ev.id, { playerId: e.target.value })}
                            className="mt-1 h-10 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm font-semibold outline-none"
                          >
                            <option value="">Sélectionner…</option>
                            {teamPlayers.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.lastName} {p.firstName} #{p.jerseyNumber}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-5 grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Passeur 1</div>
                            <select
                              value={assist1}
                              onChange={(e) => updateEvent(ev.id, { assistIds: [e.target.value, assist2].filter(Boolean) })}
                              className="mt-1 h-10 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm font-semibold outline-none"
                            >
                              <option value="">-</option>
                              {teamPlayers.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.lastName} #{p.jerseyNumber}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Passeur 2</div>
                            <select
                              value={assist2}
                              onChange={(e) => updateEvent(ev.id, { assistIds: [assist1, e.target.value].filter(Boolean) })}
                              className="mt-1 h-10 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm font-semibold outline-none"
                            >
                              <option value="">-</option>
                              {teamPlayers.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.lastName} #{p.jerseyNumber}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="px-6 py-5">
                    {sheetError ? (
                      <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {sheetError}
                      </div>
                    ) : null}

                    <div className="rounded-3xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-4 sm:p-5">
                      <div className="grid gap-3 md:grid-cols-12 md:items-center">
                        <div className="md:col-span-5">
                          <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-3">
                            {home.logoId ? (
                              <img
                                src={`/api/documents/view?id=${home.logoId}`}
                                alt={home.name}
                                className="h-10 w-10 rounded-2xl border border-blue-200 object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-2xl border border-blue-200 bg-white" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-black text-gray-900">{home.name}</div>
                              <div className="mt-0.5 truncate text-xs font-semibold text-gray-600">
                                Effectif : {sheetForm.homeRoster.length}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
                            <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Score</div>
                            <div className="mt-1 text-3xl font-black text-gray-900">
                              {sheetDerived.home} <span className="text-gray-300">-</span> {sheetDerived.away}
                            </div>
                            <div className="mt-1 text-[11px] font-semibold text-gray-500">
                              {sheetDerived.hasOvertime ? "OT" : "R"}
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-5">
                          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/60 p-3">
                            {away.logoId ? (
                              <img
                                src={`/api/documents/view?id=${away.logoId}`}
                                alt={away.name}
                                className="h-10 w-10 rounded-2xl border border-red-200 object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-2xl border border-red-200 bg-white" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-black text-gray-900">{away.name}</div>
                              <div className="mt-0.5 truncate text-xs font-semibold text-gray-600">
                                Effectif : {sheetForm.awayRoster.length}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs font-semibold text-gray-600">
                        {sheetDerived.hasOvertime ? "Prolongation : oui" : "Prolongation : non"}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                      <div className="rounded-3xl border border-blue-200 bg-blue-50/30">
                        <div className="flex items-center justify-between border-b border-blue-100 px-5 py-4">
                          <div>
                            <div className="text-xs font-extrabold uppercase tracking-wider text-blue-700">Domicile</div>
                            <div className="mt-0.5 text-sm font-black text-gray-900">{home.name}</div>
                          </div>
                          <div className="text-xs font-semibold text-blue-700">
                            {homeEvents.length} buts • {sheetForm.homeRoster.length} joueurs
                          </div>
                        </div>

                        <div className="space-y-4 px-5 py-4">
                          <div className="rounded-2xl border border-blue-100 bg-white p-4">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-bold text-gray-900">Effectif</div>
                              <div className="text-xs font-semibold text-gray-500">{sheetForm.homeRoster.length}</div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <input
                                value={homeRosterSearch}
                                onChange={(e) => setHomeRosterSearch(e.target.value)}
                                placeholder="Rechercher…"
                                className="h-10 w-full rounded-2xl border border-gray-200 px-3 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-200/60"
                              />
                              <button
                                type="button"
                                onClick={() => setSheetForm((prev) => ({ ...prev, homeRoster: homeRosterPlayers.map((p) => p.id) }))}
                                className="shrink-0 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50"
                              >
                                Tout
                              </button>
                              <button
                                type="button"
                                onClick={() => setSheetForm((prev) => ({ ...prev, homeRoster: [] }))}
                                className="shrink-0 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50"
                              >
                                Aucun
                              </button>
                            </div>
                            <div className="mt-3 max-h-56 space-y-1 overflow-auto pr-1">
                              {homeRosterPlayers.map((p) => (
                                <label
                                  key={p.id}
                                  className={cn(
                                    "flex items-center justify-between gap-2 rounded-xl px-2 py-1",
                                    sheetForm.homeRoster.includes(p.id) ? "bg-blue-50" : "hover:bg-gray-50",
                                  )}
                                >
                                  <div className="truncate text-xs font-semibold text-gray-700">
                                    {p.lastName} {p.firstName} #{p.jerseyNumber}
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={sheetForm.homeRoster.includes(p.id)}
                                    onChange={() => toggleRoster("home", p.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-blue-100 bg-white p-4">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-bold text-gray-900">Buts</div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => addGoal(homeId || "", "regulation")}
                                  className="rounded-2xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                                  type="button"
                                  disabled={!homeId}
                                >
                                  + R
                                </button>
                                <button
                                  onClick={() => addGoal(homeId || "", "overtime")}
                                  className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                                  type="button"
                                  disabled={!homeId}
                                >
                                  + OT
                                </button>
                              </div>
                            </div>

                            <div className="mt-3 space-y-2">
                              {homeEvents.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm font-semibold text-gray-600">
                                  Aucun but.
                                </div>
                              ) : (
                                homeEvents.map((ev, idx) => renderGoal(ev, idx, homeId, "home"))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-red-200 bg-red-50/30">
                        <div className="flex items-center justify-between border-b border-red-100 px-5 py-4">
                          <div>
                            <div className="text-xs font-extrabold uppercase tracking-wider text-red-700">Extérieur</div>
                            <div className="mt-0.5 text-sm font-black text-gray-900">{away.name}</div>
                          </div>
                          <div className="text-xs font-semibold text-red-700">
                            {awayEvents.length} buts • {sheetForm.awayRoster.length} joueurs
                          </div>
                        </div>

                        <div className="space-y-4 px-5 py-4">
                          <div className="rounded-2xl border border-red-100 bg-white p-4">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-bold text-gray-900">Effectif</div>
                              <div className="text-xs font-semibold text-gray-500">{sheetForm.awayRoster.length}</div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <input
                                value={awayRosterSearch}
                                onChange={(e) => setAwayRosterSearch(e.target.value)}
                                placeholder="Rechercher…"
                                className="h-10 w-full rounded-2xl border border-gray-200 px-3 text-sm font-medium outline-none focus:ring-4 focus:ring-red-200/60"
                              />
                              <button
                                type="button"
                                onClick={() => setSheetForm((prev) => ({ ...prev, awayRoster: awayRosterPlayers.map((p) => p.id) }))}
                                className="shrink-0 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50"
                              >
                                Tout
                              </button>
                              <button
                                type="button"
                                onClick={() => setSheetForm((prev) => ({ ...prev, awayRoster: [] }))}
                                className="shrink-0 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50"
                              >
                                Aucun
                              </button>
                            </div>
                            <div className="mt-3 max-h-56 space-y-1 overflow-auto pr-1">
                              {awayRosterPlayers.map((p) => (
                                <label
                                  key={p.id}
                                  className={cn(
                                    "flex items-center justify-between gap-2 rounded-xl px-2 py-1",
                                    sheetForm.awayRoster.includes(p.id) ? "bg-red-50" : "hover:bg-gray-50",
                                  )}
                                >
                                  <div className="truncate text-xs font-semibold text-gray-700">
                                    {p.lastName} {p.firstName} #{p.jerseyNumber}
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={sheetForm.awayRoster.includes(p.id)}
                                    onChange={() => toggleRoster("away", p.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                  />
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-red-100 bg-white p-4">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-bold text-gray-900">Buts</div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => addGoal(awayId || "", "regulation")}
                                  className="rounded-2xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                                  type="button"
                                  disabled={!awayId}
                                >
                                  + R
                                </button>
                                <button
                                  onClick={() => addGoal(awayId || "", "overtime")}
                                  className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                                  type="button"
                                  disabled={!awayId}
                                >
                                  + OT
                                </button>
                              </div>
                            </div>

                            <div className="mt-3 space-y-2">
                              {awayEvents.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm font-semibold text-gray-600">
                                  Aucun but.
                                </div>
                              ) : (
                                awayEvents.map((ev, idx) => renderGoal(ev, idx, awayId, "away"))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-4">
              <div className="text-xs font-semibold text-gray-600">
                {sheetSuccess ? (
                  <span className="inline-flex rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                    {sheetSuccess}
                  </span>
                ) : (
                  "Renseigne les effectifs puis les buteurs/passeurs. La validation rend le tirage immuable."
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => saveSheet("draft")}
                  disabled={sheetSaving}
                  type="button"
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Brouillon
                </button>
                <button
                  onClick={() => saveSheet("validated")}
                  disabled={sheetSaving}
                  type="button"
                  className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
