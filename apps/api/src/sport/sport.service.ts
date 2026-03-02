import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CompetitionRow = {
  id: string;
  name: string;
  season: string;
  startDate: Date;
  endDate: Date;
  status: string;
};

type MatchRow = {
  id: string;
  competitionId: string;
  date: Date;
  venue: string | null;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  resultType: string | null;
  competition: { name: string };
  homeTeam: { id: string; name: string; acronym: string | null };
  awayTeam: { id: string; name: string; acronym: string | null };
};

type StandingRow = {
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
};

type PlayerBaseStat = {
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
};

@Injectable()
export class SportService {
  constructor(private prisma: PrismaService) {}

  private getCompetitionStatus(row: CompetitionRow): 'upcoming' | 'active' | 'completed' {
    const now = new Date();
    if (row.status === 'completed') return 'completed';
    if (now > row.endDate) return 'completed';
    if (now >= row.startDate && now <= row.endDate) return 'active';
    return 'upcoming';
  }

  private isCategoryCompatibilityError(error: unknown) {
    const message = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
    if (!message) return false;
    const lower = message.toLowerCase();
    return (
      lower.includes('unknown argument `category`') ||
      lower.includes('unknown argument "category"') ||
      lower.includes('column "category"') ||
      (lower.includes('category') && lower.includes('does not exist'))
    );
  }

  async getPublicMatches() {
    const matches = await this.prisma.match.findMany({
      where: {
        // status: { in: ['completed', 'scheduled', 'live'] } 
      },
      include: {
        competition: { select: { name: true, season: true } },
        homeTeam: { select: { id: true, name: true, acronym: true, logoDocumentId: true } },
        awayTeam: { select: { id: true, name: true, acronym: true, logoDocumentId: true } },
      },
      orderBy: { date: 'desc' },
      take: 50,
    });

    return matches.map((m) => ({
      id: m.id,
      date: m.date,
      competitionName: m.competition.name,
      season: m.competition.season,
      homeTeamId: m.homeTeamId,
      homeTeam: m.homeTeam?.name || 'À définir',
      homeTeamAcronym: m.homeTeam?.acronym,
      homeScore: m.homeScore,
      awayTeamId: m.awayTeamId,
      awayTeam: m.awayTeam?.name || 'À définir',
      awayTeamAcronym: m.awayTeam?.acronym,
      awayScore: m.awayScore,
      status: m.status,
      venue: m.venue,
    }));
  }

  async getPublicClubs() {
    const clubs = await this.prisma.org.findMany({
      where: {
        type: 'club',
        status: 'active',
      },
      select: {
        id: true,
        name: true,
        acronym: true,
        city: true,
        logoDocumentId: true,
        website: true,
        establishmentDate: true,
      },
      orderBy: { name: 'asc' },
    });
    return clubs;
  }

  async getPublicPlayers() {
    const [players, matchSheets] = await Promise.all([
      this.prisma.member.findMany({
      where: {
        status: 'active',
        // licenseStatus: 'active', // Uncomment if LicenseStatus enum has 'active' and is required
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        org: { select: { id: true, name: true, acronym: true, logoDocumentId: true } },
        positions: true,
        jerseyNumber: true,
        nationality: true,
        gamesPlayed: true,
        goals: true,
        assists: true,
        ageCategory: true,
        documents: {
          where: { type: 'photo' },
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { id: true }
        },
        manualPlayerStats: {
          select: {
            gamesPlayed: true,
            goals: true,
            assists: true,
          }
        }
      },
      orderBy: { lastName: 'asc' },
      take: 100,
    }),
      this.prisma.matchSheet.findMany({
        where: { status: 'validated' },
        include: {
          events: true,
          match: { select: { status: true } },
        },
      }),
    ]);

    const autoStatsByPlayer = new Map<string, { gamesPlayed: number; goals: number; assists: number }>();
    const ensurePlayer = (playerId: string) => {
      if (!autoStatsByPlayer.has(playerId)) {
        autoStatsByPlayer.set(playerId, { gamesPlayed: 0, goals: 0, assists: 0 });
      }
      return autoStatsByPlayer.get(playerId)!;
    };

    matchSheets.forEach((sheet) => {
      if (sheet.match.status !== 'completed') return;
      const roster = [...sheet.homeRoster, ...sheet.awayRoster];
      roster.forEach((playerId) => {
        const stats = ensurePlayer(playerId);
        stats.gamesPlayed += 1;
      });
      sheet.events.forEach((event) => {
        if (event.type !== 'goal') return;
        const scorer = ensurePlayer(event.playerId);
        scorer.goals += 1;
        (event.assistIds || []).forEach((assistId) => {
          const assist = ensurePlayer(assistId);
          assist.assists += 1;
        });
      });
    });
    
    return players.map(p => {
      const isHockeySchool = (p.ageCategory && ['U7', 'U9', 'U11', 'U13'].includes(p.ageCategory)) || 
                             p.org?.name.toLowerCase().includes('ecole') || 
                             p.org?.name.toLowerCase().includes('école');

      let gamesPlayed = p.gamesPlayed;
      let goals = p.goals;
      let assists = p.assists;

      if (p.manualPlayerStats && p.manualPlayerStats.length > 0) {
        gamesPlayed = p.manualPlayerStats.reduce((sum, s) => sum + s.gamesPlayed, 0);
        goals = p.manualPlayerStats.reduce((sum, s) => sum + s.goals, 0);
        assists = p.manualPlayerStats.reduce((sum, s) => sum + s.assists, 0);
      } else if (autoStatsByPlayer.has(p.id)) {
        const auto = autoStatsByPlayer.get(p.id)!;
        gamesPlayed = auto.gamesPlayed;
        goals = auto.goals;
        assists = auto.assists;
      }

      return {
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        clubId: p.org?.id || null,
        clubName: p.org?.acronym || p.org?.name || 'Sans club',
        clubLogoId: p.org?.logoDocumentId || null,
        position: p.positions?.[0] || '-',
        jerseyNumber: p.jerseyNumber,
        nationality: p.nationality,
        photoDocumentId: p.documents[0]?.id || null,
        gamesPlayed,
        goals,
        assists,
        points: goals + assists,
        isHockeySchool: !!isHockeySchool,
      };
    });
  }

  async listCompetitions() {
    const competitions = await this.prisma.competition.findMany({
      orderBy: { startDate: 'desc' },
    });

    const matchRows = await this.prisma.match.findMany({
      select: { competitionId: true, homeTeamId: true, awayTeamId: true },
    });

    const assignmentRows = await this.prisma.competitionClub.findMany({
      select: { competitionId: true, clubId: true },
    });

    const participantsByCompetition = new Map<string, Set<string>>();
    matchRows.forEach((m) => {
      if (!participantsByCompetition.has(m.competitionId)) {
        participantsByCompetition.set(m.competitionId, new Set());
      }
      const set = participantsByCompetition.get(m.competitionId)!;
      if (m.homeTeamId) set.add(m.homeTeamId);
      if (m.awayTeamId) set.add(m.awayTeamId);
    });
    assignmentRows.forEach((row) => {
      if (!participantsByCompetition.has(row.competitionId)) {
        participantsByCompetition.set(row.competitionId, new Set());
      }
      participantsByCompetition.get(row.competitionId)!.add(row.clubId);
    });

    return competitions.map((c) => ({
      id: c.id,
      name: c.name,
      season: c.season,
      category: c.category ?? null,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
      status: this.getCompetitionStatus(c as unknown as CompetitionRow),
      type: c.type || 'league',
      format: c.type === 'cup' ? 'cup_single_elimination' : 'league_double_round_robin',
      phase: c.phase || 'draft',
      lockedAt: c.lockedAt ? c.lockedAt.toISOString() : null,
      cupTeamCount: c.cupTeamCount,
      participantCount: participantsByCompetition.get(c.id)?.size ?? 0,
    }));
  }

  async createCompetition(input: {
    name: string;
    season: string;
    category?: string;
    startDate: string;
    endDate: string;
    type: string;
    format?: string;
    cupTeamCount?: number;
    clubIds?: string[];
    status?: string;
  }) {
    const type = input.type || 'league';
    const format = type === 'cup' ? 'cup_single_elimination' : 'league_double_round_robin';
    if (input.format && input.format !== format) {
      throw new BadRequestException('Format incompatible avec le type de compétition.');
    }

    const category = input.category?.trim() || null;
    const uniqueClubIds = Array.from(new Set((input.clubIds || []).filter(Boolean)));
    if (uniqueClubIds.length > 0) {
      const clubs = await this.prisma.org.findMany({
        where: { id: { in: uniqueClubIds }, type: 'club', archived: false },
        select: { id: true },
      });
      if (clubs.length !== uniqueClubIds.length) {
        throw new BadRequestException('Clubs invalides');
      }
    }

    let eligibleClubIds = uniqueClubIds;
    if (category && uniqueClubIds.length > 0) {
      const teams = await this.prisma.team.findMany({
        where: {
          orgId: { in: uniqueClubIds },
          category: { equals: category, mode: 'insensitive' },
        },
        select: { orgId: true },
      });
      eligibleClubIds = Array.from(new Set(teams.map((t) => t.orgId)));
      if (eligibleClubIds.length < 2) {
        throw new BadRequestException('Veuillez sélectionner au moins 2 clubs pour cette catégorie.');
      }
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const baseData = {
        name: input.name,
        season: input.season,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        status: input.status || 'planned',
        type,
        format,
        phase: 'draft',
        cupTeamCount: type === 'cup' ? input.cupTeamCount ?? null : null,
        lockedAt: null,
      };
      let competition;
      try {
        competition = await tx.competition.create({
          data: category ? { ...baseData, category } : baseData,
        });
      } catch (error) {
        if (!this.isCategoryCompatibilityError(error)) {
          throw error;
        }
        competition = await tx.competition.create({ data: baseData });
      }

      if (eligibleClubIds.length > 0) {
        await tx.competitionClub.createMany({
          data: eligibleClubIds.map((clubId) => ({ competitionId: competition.id, clubId })),
          skipDuplicates: true,
        });
      }

      return competition;
    });

    return {
      id: created.id,
      name: created.name,
      season: created.season,
      category: created.category ?? null,
      startDate: created.startDate.toISOString(),
      endDate: created.endDate.toISOString(),
      status: this.getCompetitionStatus(created as unknown as CompetitionRow),
      type: created.type || 'league',
      format: created.type === 'cup' ? 'cup_single_elimination' : 'league_double_round_robin',
      phase: created.phase || 'draft',
      lockedAt: created.lockedAt ? created.lockedAt.toISOString() : null,
      cupTeamCount: created.cupTeamCount,
      participantCount: eligibleClubIds.length,
    };
  }

  async updateCompetition(
    id: string,
    input: {
      name?: string;
      season?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
      type?: string;
      format?: string;
      cupTeamCount?: number;
      clubIds?: string[];
      status?: string;
    },
  ) {
    const existing = await this.prisma.competition.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Competition not found');
    }
    const nextType = (input.type ?? existing.type) || 'league';
    const nextFormat = nextType === 'cup' ? 'cup_single_elimination' : 'league_double_round_robin';
    if (input.format && input.format !== nextFormat) {
      throw new BadRequestException('Format incompatible avec le type de compétition.');
    }
    const nextCategory = input.category !== undefined ? input.category?.trim() || null : (existing as any).category ?? null;
    const data: {
      name?: string;
      season?: string;
      category?: string | null;
      startDate?: Date;
      endDate?: Date;
      type?: string;
      format?: string;
      cupTeamCount?: number | null;
      status?: string;
    } = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.season !== undefined) data.season = input.season;
    if (input.category !== undefined) data.category = nextCategory;
    if (input.startDate !== undefined) data.startDate = new Date(input.startDate);
    if (input.endDate !== undefined) data.endDate = new Date(input.endDate);
    if (input.status !== undefined) data.status = input.status;
    data.type = nextType;
    data.format = nextFormat;
    data.cupTeamCount =
      nextType === 'cup' ? input.cupTeamCount ?? existing.cupTeamCount ?? null : null;

    const updated = await this.prisma.$transaction(async (tx) => {
      const hasCategoryUpdate = Object.prototype.hasOwnProperty.call(data, 'category');
      let competition;
      try {
        competition = await tx.competition.update({ where: { id }, data });
      } catch (error) {
        if (!hasCategoryUpdate || !this.isCategoryCompatibilityError(error)) {
          throw error;
        }
        const dataWithoutCategory = { ...data };
        delete dataWithoutCategory.category;
        competition = await tx.competition.update({ where: { id }, data: dataWithoutCategory });
      }
      if (input.clubIds) {
        const phase = competition.phase || 'draft';
        if (phase !== 'draft' && phase !== 'prepared') {
          throw new BadRequestException('Impossible de modifier les clubs après verrouillage');
        }
        const uniqueIds = Array.from(new Set(input.clubIds.filter(Boolean)));
        const clubs = await tx.org.findMany({
          where: { id: { in: uniqueIds }, type: 'club', archived: false },
          select: { id: true },
        });
        if (clubs.length !== uniqueIds.length) {
          throw new BadRequestException('Clubs invalides');
        }
        let filteredIds = uniqueIds;
        if (nextCategory && uniqueIds.length > 0) {
          const teams = await tx.team.findMany({
            where: {
              orgId: { in: uniqueIds },
              category: { equals: nextCategory, mode: 'insensitive' },
            },
            select: { orgId: true },
          });
          filteredIds = Array.from(new Set(teams.map((t) => t.orgId)));
          if (filteredIds.length < 2) {
            throw new BadRequestException('Veuillez sélectionner au moins 2 clubs pour cette catégorie.');
          }
        }
        await tx.competitionClub.deleteMany({
          where: { competitionId: id, clubId: { notIn: filteredIds } },
        });
        if (filteredIds.length > 0) {
          await tx.competitionClub.createMany({
            data: filteredIds.map((clubId) => ({ competitionId: id, clubId })),
            skipDuplicates: true,
          });
        }
      }
      return competition;
    });

    const matchRows = await this.prisma.match.findMany({
      where: { competitionId: id },
      select: { homeTeamId: true, awayTeamId: true },
    });
    const assignmentRows = await this.prisma.competitionClub.findMany({
      where: { competitionId: id },
      select: { clubId: true },
    });
    const participants = new Set<string>();
    matchRows.forEach((m) => {
      if (m.homeTeamId) participants.add(m.homeTeamId);
      if (m.awayTeamId) participants.add(m.awayTeamId);
    });
    assignmentRows.forEach((row) => participants.add(row.clubId));

    return {
      id: updated.id,
      name: updated.name,
      season: updated.season,
      category: updated.category ?? null,
      startDate: updated.startDate.toISOString(),
      endDate: updated.endDate.toISOString(),
      status: this.getCompetitionStatus(updated as unknown as CompetitionRow),
      type: updated.type || 'league',
      format: updated.type === 'cup' ? 'cup_single_elimination' : 'league_double_round_robin',
      phase: updated.phase || 'draft',
      lockedAt: updated.lockedAt ? updated.lockedAt.toISOString() : null,
      cupTeamCount: updated.cupTeamCount,
      participantCount: participants.size,
    };
  }

  private toSeed(input: string) {
    let seed = 0;
    for (let i = 0; i < input.length; i++) seed = (seed * 31 + input.charCodeAt(i)) >>> 0;
    return seed || 1;
  }

  private seededShuffle<T>(items: T[], seed: number) {
    const arr = [...items];
    let s = seed >>> 0;
    const next = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xffffffff;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private nextPow2(n: number) {
    if (n <= 1) return 1;
    return 1 << Math.ceil(Math.log2(n));
  }

  private getCupRoundLabel(matchCount: number) {
    if (matchCount === 1) return 'Finale';
    if (matchCount === 2) return 'Demi-finales';
    if (matchCount === 4) return 'Quarts de finale';
    if (matchCount === 8) return '8èmes de finale';
    if (matchCount === 16) return '16èmes de finale';
    if (matchCount === 32) return '32èmes de finale';
    return `Tour (${matchCount} matchs)`;
  }

  private parseStartDateTime(input: { startDate?: string; time?: string }, fallback: Date) {
    const datePart = input.startDate ? new Date(input.startDate) : new Date(fallback);
    if (isNaN(datePart.getTime())) throw new BadRequestException('Date invalide');
    const time = input.time || '19:00';
    const m = /^(\d{2}):(\d{2})$/.exec(time);
    if (!m) throw new BadRequestException('Heure invalide');
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) throw new BadRequestException('Heure invalide');
    datePart.setHours(hh, mm, 0, 0);
    return datePart;
  }

  private generateRoundRobinPairings(teamIds: string[]) {
    const ids = [...teamIds];
    if (ids.length < 2) return [];
    if (ids.length % 2 !== 0) ids.push('BYE');
    const n = ids.length;
    const rounds: { pairs: { home: string; away: string }[] }[] = [];
    let current = [...ids];
    for (let r = 0; r < n - 1; r++) {
      const pairs: { home: string; away: string }[] = [];
      for (let i = 0; i < n / 2; i++) {
        const home = current[i];
        const away = current[n - 1 - i];
        if (home !== 'BYE' && away !== 'BYE') pairs.push({ home, away });
      }
      rounds.push({ pairs });
      const moving = current.splice(1);
      const last = moving.pop();
      if (last) moving.unshift(last);
      current = [current[0], ...moving];
    }
    return rounds;
  }

  async prepareCompetition(
    competitionId: string,
    input: {
      startDate?: string;
      time?: string;
      roundIntervalDays?: number;
      matchIntervalMinutes?: number;
      venue?: string;
    },
  ) {
    const competition = await this.prisma.competition.findUnique({ where: { id: competitionId } });
    if (!competition) throw new NotFoundException('Compétition introuvable.');
    const phase = (competition as any).phase || 'draft';
    if (phase !== 'draft' && phase !== 'prepared') {
      throw new BadRequestException('Compétition déjà verrouillée.');
    }

    const assignments = await this.prisma.competitionClub.findMany({
      where: { competitionId },
      orderBy: { createdAt: 'asc' },
      select: { clubId: true },
    });
    const teamIds = assignments.map((a) => a.clubId);
    if (teamIds.length < 2) throw new BadRequestException('Veuillez affecter au moins 2 équipes.');

    const format =
      competition.type === 'cup' ? 'cup_single_elimination' : 'league_double_round_robin';
    const roundIntervalDays = input.roundIntervalDays ?? 7;
    const matchIntervalMinutes = input.matchIntervalMinutes ?? 120;
    const startDateTime = this.parseStartDateTime(input, competition.startDate);
    const venue = input.venue || null;

    if (format === 'league_double_round_robin') {
      const firstLeg = this.generateRoundRobinPairings(teamIds);
      const secondLeg = firstLeg.map((r) => ({
        pairs: r.pairs.map((p) => ({ home: p.away, away: p.home })),
      }));
      const rounds = [...firstLeg, ...secondLeg].map((r, idx) => ({
        roundNumber: idx + 1,
        leg: idx < firstLeg.length ? 1 : 2,
        date: new Date(startDateTime.getTime() + idx * roundIntervalDays * 24 * 60 * 60 * 1000).toISOString(),
        venue,
        matchIntervalMinutes,
        pairs: r.pairs,
      }));

      await this.prisma.competition.update({
        where: { id: competitionId },
        data: { phase: phase === 'draft' ? 'prepared' : phase },
      });

      return {
        competition: {
          id: competition.id,
          type: competition.type,
          format,
          phase: phase === 'draft' ? 'prepared' : phase,
        },
        teams: teamIds,
        rounds,
      };
    }

    if (format !== 'cup_single_elimination') {
      throw new BadRequestException('Format non supporté.');
    }

    const seed = this.toSeed(competitionId);
    const shuffled = this.seededShuffle(teamIds, seed);
    const P = this.nextPow2(shuffled.length);
    const roundsCount = Math.log2(P);
    const slots: (string | null)[] = [...shuffled, ...Array.from({ length: P - shuffled.length }, () => null)];

    const rounds = Array.from({ length: roundsCount }, (_, r) => {
      const matchCount = P / Math.pow(2, r + 1);
      const date = new Date(startDateTime.getTime() + r * roundIntervalDays * 24 * 60 * 60 * 1000).toISOString();
      return {
        roundNumber: r + 1,
        label: this.getCupRoundLabel(matchCount),
        date,
        venue,
        matchIntervalMinutes,
        matches: Array.from({ length: matchCount }, (_v, i) => {
          const home = r === 0 ? slots[i * 2] : null;
          const away = r === 0 ? slots[i * 2 + 1] : null;
          return { bracketPosition: i, homeTeamId: home, awayTeamId: away };
        }),
      };
    });

    await this.prisma.competition.update({
      where: { id: competitionId },
      data: { phase: phase === 'draft' ? 'prepared' : phase },
    });

    return {
      competition: {
        id: competition.id,
        type: competition.type,
        format,
        phase: phase === 'draft' ? 'prepared' : phase,
      },
      teams: teamIds,
      bracketSize: P,
      rounds,
    };
  }

  private async placeCupWinner(fromMatchId: string, winnerTeamId: string) {
    const link = await this.prisma.cupLink.findUnique({ where: { fromMatchId } });
    if (!link) return;
    const toMatch = await this.prisma.match.findUnique({ where: { id: link.toMatchId } });
    if (!toMatch) return;
    if (link.toSlot === 'home') {
      if (toMatch.homeTeamId && toMatch.homeTeamId !== winnerTeamId) {
        throw new BadRequestException('Conflit de qualifié (slot déjà rempli).');
      }
      if (!toMatch.homeTeamId) {
        await this.prisma.match.update({ where: { id: toMatch.id }, data: { homeTeamId: winnerTeamId } });
      }
    } else {
      if (toMatch.awayTeamId && toMatch.awayTeamId !== winnerTeamId) {
        throw new BadRequestException('Conflit de qualifié (slot déjà rempli).');
      }
      if (!toMatch.awayTeamId) {
        await this.prisma.match.update({ where: { id: toMatch.id }, data: { awayTeamId: winnerTeamId } });
      }
    }
  }

  async lockCompetition(
    competitionId: string,
    input: {
      startDate?: string;
      time?: string;
      roundIntervalDays?: number;
      matchIntervalMinutes?: number;
      venue?: string;
      mode?: string;
      firstRoundPairs?: { homeTeamId: string; awayTeamId: string }[];
    },
  ) {
    const competition = await this.prisma.competition.findUnique({ where: { id: competitionId } });
    if (!competition) throw new NotFoundException('Compétition introuvable.');
    const phase = (competition as any).phase || 'draft';
    if (phase !== 'draft' && phase !== 'prepared') {
      throw new BadRequestException('Compétition déjà verrouillée.');
    }

    const existingMatchesCount = await this.prisma.match.count({ where: { competitionId } });
    if (existingMatchesCount > 0) {
      throw new BadRequestException('Des matchs existent déjà pour cette compétition.');
    }

    const assignments = await this.prisma.competitionClub.findMany({
      where: { competitionId },
      orderBy: { createdAt: 'asc' },
      select: { clubId: true },
    });
    const teamIds = assignments.map((a) => a.clubId);
    if (teamIds.length < 2) throw new BadRequestException('Veuillez affecter au moins 2 équipes.');

    const format =
      competition.type === 'cup' ? 'cup_single_elimination' : 'league_double_round_robin';

    const roundIntervalDays = input.roundIntervalDays ?? 7;
    const matchIntervalMinutes = input.matchIntervalMinutes ?? 120;
    const startDateTime = this.parseStartDateTime(input, competition.startDate);
    const venue = input.venue || null;

    if (format === 'league_double_round_robin') {
      const firstLeg = this.generateRoundRobinPairings(teamIds);
      const secondLeg = firstLeg.map((r) => ({
        pairs: r.pairs.map((p) => ({ home: p.away, away: p.home })),
      }));
      const rounds = [...firstLeg, ...secondLeg];

      const matchesPayload: {
        competitionId: string;
        homeTeamId: string;
        awayTeamId: string;
        date: Date;
        venue: string | null;
        round: string;
        roundNumber: number;
        leg: number;
        status: string;
      }[] = [];

      rounds.forEach((round, idx) => {
        const roundNumber = idx + 1;
        const leg = idx < firstLeg.length ? 1 : 2;
        const base = new Date(startDateTime.getTime() + idx * roundIntervalDays * 24 * 60 * 60 * 1000);
        round.pairs.forEach((p, i) => {
          const date = new Date(base.getTime() + i * matchIntervalMinutes * 60 * 1000);
          matchesPayload.push({
            competitionId,
            homeTeamId: p.home,
            awayTeamId: p.away,
            date,
            venue,
            round: `Tour ${roundNumber}`,
            roundNumber,
            leg,
            status: 'scheduled',
          });
        });
      });

      await this.prisma.$transaction(async (tx) => {
        await tx.match.createMany({ data: matchesPayload as any });
        await tx.competition.update({
          where: { id: competitionId },
          data: { phase: 'locked', lockedAt: new Date(), format, type: 'league' },
        });
      });

      return { success: true, competitionId, format, matchesCreated: matchesPayload.length };
    }

    if (format !== 'cup_single_elimination') {
      throw new BadRequestException('Format non supporté.');
    }

    const mode = input.mode || 'auto';
    const now = new Date();
    const drawSeedTag = `${competitionId}:${now.getTime()}`;
    const seed = this.toSeed(drawSeedTag);
    const shuffled = mode === 'auto' ? this.seededShuffle(teamIds, seed) : [...teamIds];

    if (mode === 'manual') {
      const pairs = input.firstRoundPairs || [];
      const P = this.nextPow2(teamIds.length);
      const preliminaryMatchCount = teamIds.length === P ? P / 2 : teamIds.length - P / 2;
      if (pairs.length !== preliminaryMatchCount) {
        throw new BadRequestException('Tirage manuel incomplet pour le 1er tour.');
      }
      const flat = pairs.flatMap((p) => [p.homeTeamId, p.awayTeamId]);
      const unique = new Set(flat);
      if (unique.size !== flat.length) throw new BadRequestException('Équipe dupliquée dans le tirage manuel.');
      flat.forEach((id) => {
        if (!teamIds.includes(id)) throw new BadRequestException('Équipe invalide dans le tirage manuel.');
      });
    }

    const n = teamIds.length;
    const P = this.nextPow2(n);

    const created = await this.prisma.$transaction(async (tx) => {
      const matchesByKey = new Map<string, { id: string; homeTeamId: string | null; awayTeamId: string | null }>();
      const links: { competitionId: string; fromMatchId: string; toMatchId: string; toSlot: string }[] = [];

      const createMatchRow = async (args: {
        roundNumber: number;
        bracketPosition: number;
        label: string;
        date: Date;
        homeTeamId: string | null;
        awayTeamId: string | null;
      }) => {
        const match = await tx.match.create({
          data: {
            competitionId,
            homeTeamId: args.homeTeamId,
            awayTeamId: args.awayTeamId,
            date: args.date,
            venue,
            round: args.label,
            roundNumber: args.roundNumber,
            bracketPosition: args.bracketPosition,
            status: 'scheduled',
          } as any,
          select: { id: true, homeTeamId: true, awayTeamId: true },
        });
        matchesByKey.set(`${args.roundNumber}:${args.bracketPosition}`, match);
        return match;
      };

      if (n === P) {
        const roundsCount = Math.log2(P);
        const ordering =
          mode === 'manual'
            ? (input.firstRoundPairs || []).flatMap((p) => [p.homeTeamId, p.awayTeamId])
            : shuffled;

        for (let r = 1; r <= roundsCount; r++) {
          const matchCount = P / Math.pow(2, r);
          const label = this.getCupRoundLabel(matchCount);
          const base = new Date(startDateTime.getTime() + (r - 1) * roundIntervalDays * 24 * 60 * 60 * 1000);
          for (let i = 0; i < matchCount; i++) {
            const date = new Date(base.getTime() + i * matchIntervalMinutes * 60 * 1000);
            const homeTeamId = r === 1 ? ordering[i * 2] : null;
            const awayTeamId = r === 1 ? ordering[i * 2 + 1] : null;
            await createMatchRow({ roundNumber: r, bracketPosition: i, label, date, homeTeamId, awayTeamId });
          }
        }

        for (let r = 1; r < roundsCount; r++) {
          const matchCount = P / Math.pow(2, r);
          for (let i = 0; i < matchCount; i++) {
            const from = matchesByKey.get(`${r}:${i}`)!;
            const to = matchesByKey.get(`${r + 1}:${Math.floor(i / 2)}`)!;
            links.push({
              competitionId,
              fromMatchId: from.id,
              toMatchId: to.id,
              toSlot: i % 2 === 0 ? 'home' : 'away',
            });
          }
        }
      } else {
        const preliminaryMatchCount = n - P / 2;
        const teamsPlaying = preliminaryMatchCount * 2;
        const byesCount = P / 2 - preliminaryMatchCount;

        let prelimPairs: { homeTeamId: string; awayTeamId: string }[] = [];
        let byesTeams: string[] = [];

        if (mode === 'manual') {
          prelimPairs = input.firstRoundPairs || [];
          const used = new Set(prelimPairs.flatMap((p) => [p.homeTeamId, p.awayTeamId]));
          byesTeams = teamIds.filter((id) => !used.has(id));
          if (byesTeams.length !== byesCount) {
            throw new BadRequestException('Tirage manuel invalide (gestion des exemptés).');
          }
        } else {
          const ordered = shuffled;
          const playing = ordered.slice(0, teamsPlaying);
          byesTeams = ordered.slice(teamsPlaying);
          prelimPairs = Array.from({ length: preliminaryMatchCount }, (_v, i) => ({
            homeTeamId: playing[i * 2],
            awayTeamId: playing[i * 2 + 1],
          }));
        }

        const base1 = new Date(startDateTime.getTime());
        for (let i = 0; i < preliminaryMatchCount; i++) {
          const date = new Date(base1.getTime() + i * matchIntervalMinutes * 60 * 1000);
          await createMatchRow({
            roundNumber: 1,
            bracketPosition: i,
            label: 'Tour préliminaire',
            date,
            homeTeamId: prelimPairs[i].homeTeamId,
            awayTeamId: prelimPairs[i].awayTeamId,
          });
        }

        const slotsCount = P / 2;
        const byePositions = new Set(
          this.seededShuffle(
            Array.from({ length: slotsCount }, (_v, i) => i),
            this.toSeed(`${drawSeedTag}:byes-positions`),
          ).slice(0, byesCount),
        );
        const shuffledByes = this.seededShuffle(byesTeams, this.toSeed(`${drawSeedTag}:byes-teams`));

        const participants: Array<{ kind: 'team'; teamId: string } | { kind: 'winner'; fromIndex: number }> = [];
        let byeIndex = 0;
        let winnerIndex = 0;
        for (let i = 0; i < slotsCount; i++) {
          if (byePositions.has(i)) {
            participants.push({ kind: 'team', teamId: shuffledByes[byeIndex++] });
          } else {
            participants.push({ kind: 'winner', fromIndex: winnerIndex++ });
          }
        }

        const mainRoundsCount = Math.log2(P / 2);
        const totalRoundsCount = 1 + mainRoundsCount;

        for (let r = 2; r <= totalRoundsCount; r++) {
          const matchCount = P / Math.pow(2, r);
          const label = this.getCupRoundLabel(matchCount);
          const base = new Date(startDateTime.getTime() + (r - 1) * roundIntervalDays * 24 * 60 * 60 * 1000);
          for (let i = 0; i < matchCount; i++) {
            const date = new Date(base.getTime() + i * matchIntervalMinutes * 60 * 1000);
            const homeSlot = r === 2 ? participants[i * 2] : null;
            const awaySlot = r === 2 ? participants[i * 2 + 1] : null;

            const homeTeamId = homeSlot && homeSlot.kind === 'team' ? homeSlot.teamId : null;
            const awayTeamId = awaySlot && awaySlot.kind === 'team' ? awaySlot.teamId : null;

            await createMatchRow({ roundNumber: r, bracketPosition: i, label, date, homeTeamId, awayTeamId });

            if (r === 2) {
              const to = matchesByKey.get(`${r}:${i}`)!;
              if (homeSlot && homeSlot.kind === 'winner') {
                const from = matchesByKey.get(`1:${homeSlot.fromIndex}`)!;
                links.push({ competitionId, fromMatchId: from.id, toMatchId: to.id, toSlot: 'home' });
              }
              if (awaySlot && awaySlot.kind === 'winner') {
                const from = matchesByKey.get(`1:${awaySlot.fromIndex}`)!;
                links.push({ competitionId, fromMatchId: from.id, toMatchId: to.id, toSlot: 'away' });
              }
            }
          }
        }

        for (let r = 2; r < totalRoundsCount; r++) {
          const matchCount = P / Math.pow(2, r);
          for (let i = 0; i < matchCount; i++) {
            const from = matchesByKey.get(`${r}:${i}`)!;
            const to = matchesByKey.get(`${r + 1}:${Math.floor(i / 2)}`)!;
            links.push({
              competitionId,
              fromMatchId: from.id,
              toMatchId: to.id,
              toSlot: i % 2 === 0 ? 'home' : 'away',
            });
          }
        }
      }

      if (links.length > 0) {
        await tx.cupLink.createMany({ data: links });
      }

      await tx.competition.update({
        where: { id: competitionId },
        data: { phase: 'locked', lockedAt: now, format, type: 'cup' },
      });

      return { matchesByKey };
    });

    if (n < P) {
      return { success: true, competitionId, format, bracketSize: P };
    }

    return { success: true, competitionId, format, bracketSize: P };
  }

  async regenerateCompetitionDraw(
    competitionId: string,
    input: {
      startDate?: string;
      time?: string;
      roundIntervalDays?: number;
      matchIntervalMinutes?: number;
      venue?: string;
      mode?: string;
      firstRoundPairs?: { homeTeamId: string; awayTeamId: string }[];
    },
  ) {
    const competition = await this.prisma.competition.findUnique({ where: { id: competitionId } });
    if (!competition) throw new NotFoundException('Compétition introuvable.');
    if ((competition.type || 'league') !== 'cup') {
      throw new BadRequestException('La régénération est disponible uniquement pour les coupes.');
    }

    const anySheets = await this.prisma.matchSheet.count({
      where: {
        match: { competitionId },
      },
    });
    if (anySheets > 0) {
      throw new BadRequestException('Impossible de régénérer après saisie d’une feuille de match.');
    }

    const matchIds = await this.prisma.match.findMany({
      where: { competitionId },
      select: { id: true },
    });
    const matchIdList = matchIds.map((m) => m.id);
    const sheetIds = matchIdList.length
      ? await this.prisma.matchSheet.findMany({
          where: { matchId: { in: matchIdList } },
          select: { id: true },
        })
      : [];
    const sheetIdList = sheetIds.map((s) => s.id);

    await this.prisma.$transaction(async (tx) => {
      await tx.cupLink.deleteMany({ where: { competitionId } });
      if (sheetIdList.length) {
        await tx.matchEvent.deleteMany({ where: { sheetId: { in: sheetIdList } } });
      }
      if (matchIdList.length) {
        await tx.matchSheet.deleteMany({ where: { matchId: { in: matchIdList } } });
        await tx.match.deleteMany({ where: { id: { in: matchIdList } } });
      }
      await tx.competition.update({
        where: { id: competitionId },
        data: { phase: 'draft', lockedAt: null },
      });
    });

    return this.lockCompetition(competitionId, input);
  }

  async deleteCompetition(id: string) {
    const matchIds = await this.prisma.match.findMany({
      where: { competitionId: id },
      select: { id: true },
    });
    const matchIdList = matchIds.map((m) => m.id);
    const sheetIds = matchIdList.length
      ? await this.prisma.matchSheet.findMany({
          where: { matchId: { in: matchIdList } },
          select: { id: true },
        })
      : [];
    const sheetIdList = sheetIds.map((s) => s.id);

    const operations = [];
    operations.push(this.prisma.cupLink.deleteMany({ where: { competitionId: id } }));
    if (sheetIdList.length) {
      operations.push(
        this.prisma.matchEvent.deleteMany({ where: { sheetId: { in: sheetIdList } } }),
      );
    }
    if (matchIdList.length) {
      operations.push(
        this.prisma.matchSheet.deleteMany({ where: { matchId: { in: matchIdList } } }),
      );
    }
    operations.push(this.prisma.match.deleteMany({ where: { competitionId: id } }));
    operations.push(this.prisma.manualPlayerStats.deleteMany({ where: { competitionId: id } }));
    operations.push(this.prisma.competitionClub.deleteMany({ where: { competitionId: id } }));
    operations.push(this.prisma.competition.delete({ where: { id } }));

    await this.prisma.$transaction(operations);
    return { success: true };
  }

  async listClubs() {
    const clubs = await this.prisma.org.findMany({
      where: { type: 'club', archived: false },
      select: { id: true, name: true, acronym: true, status: true, logoDocumentId: true },
      orderBy: { name: 'asc' },
    });

    const matchRows = await this.prisma.match.findMany({
      select: { competitionId: true, homeTeamId: true, awayTeamId: true },
    });

    const assignmentRows = await this.prisma.competitionClub.findMany({
      select: { competitionId: true, clubId: true },
    });

    const competitionsByClub = new Map<string, Set<string>>();
    matchRows.forEach((m) => {
      [m.homeTeamId, m.awayTeamId].forEach((clubId) => {
        if (!clubId) return;
        if (!competitionsByClub.has(clubId)) competitionsByClub.set(clubId, new Set());
        competitionsByClub.get(clubId)!.add(m.competitionId);
      });
    });
    assignmentRows.forEach((row) => {
      if (!competitionsByClub.has(row.clubId)) {
        competitionsByClub.set(row.clubId, new Set());
      }
      competitionsByClub.get(row.clubId)!.add(row.competitionId);
    });

    return clubs.map((c) => ({
      id: c.id,
      name: c.name,
      acronym: c.acronym || c.name,
      status: c.status === 'active' ? 'active' : 'inactive',
      logoDocumentId: c.logoDocumentId,
      assignedCompetitions: Array.from(competitionsByClub.get(c.id) || []),
    }));
  }

  async listMatches() {
    const matches = await this.prisma.match.findMany({
      include: {
        competition: { select: { name: true } },
        homeTeam: { select: { id: true, name: true, acronym: true, logoDocumentId: true } },
        awayTeam: { select: { id: true, name: true, acronym: true, logoDocumentId: true } },
      },
      orderBy: { date: 'desc' },
    });

    return matches.map((m) => ({
      id: m.id,
      competitionId: m.competitionId,
      competitionName: m.competition.name,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      winnerTeamId: (m as any).winnerTeamId ?? null,
      homeTeamName: m.homeTeam?.acronym || m.homeTeam?.name || 'À définir',
      awayTeamName: m.awayTeam?.acronym || m.awayTeam?.name || 'À définir',
      homeLogo: m.homeTeam?.logoDocumentId || null,
      awayLogo: m.awayTeam?.logoDocumentId || null,
      date: m.date.toISOString(),
      time: m.date.toISOString().slice(11, 16),
      venue: m.venue || '',
      round: m.round || null,
      roundNumber: (m as any).roundNumber ?? null,
      leg: (m as any).leg ?? null,
      bracketPosition: (m as any).bracketPosition ?? null,
      status: m.status,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      resultType: m.resultType,
      refereeId: null,
      refereeName: null,
    }));
  }

  async createMatch(input: {
    competitionId: string;
    homeTeamId?: string;
    awayTeamId?: string;
    date: string;
    venue?: string;
    round?: string;
    status?: string;
  }) {
    if (input.homeTeamId && input.awayTeamId && input.homeTeamId === input.awayTeamId) {
      throw new BadRequestException('Les équipes doivent être différentes.');
    }

    const matchDate = new Date(input.date);
    if (isNaN(matchDate.getTime())) {
      throw new BadRequestException('Date invalide.');
    }

    const competition = await this.prisma.competition.findUnique({
      where: { id: input.competitionId },
      select: { id: true },
    });
    if (!competition) {
      throw new NotFoundException('Compétition introuvable.');
    }

    let homeTeam, awayTeam;
    if (input.homeTeamId && input.awayTeamId) {
      const teams = await this.prisma.org.findMany({
        where: {
          id: { in: [input.homeTeamId, input.awayTeamId] },
          type: 'club',
          archived: false,
        },
        select: { id: true, name: true, acronym: true },
      });
      const teamMap = new Map(teams.map((team) => [team.id, team]));
      homeTeam = teamMap.get(input.homeTeamId);
      awayTeam = teamMap.get(input.awayTeamId);
      if (!homeTeam || !awayTeam) {
        throw new NotFoundException('Équipe introuvable.');
      }
    } else if (input.homeTeamId) {
       homeTeam = await this.prisma.org.findUnique({
         where: { id: input.homeTeamId },
         select: { id: true, name: true, acronym: true },
       });
       if (!homeTeam) throw new NotFoundException('Équipe domicile introuvable.');
    } else if (input.awayTeamId) {
       awayTeam = await this.prisma.org.findUnique({
         where: { id: input.awayTeamId },
         select: { id: true, name: true, acronym: true },
       });
       if (!awayTeam) throw new NotFoundException('Équipe extérieure introuvable.');
    }

    const created = await this.prisma.match.create({
      data: {
        competitionId: input.competitionId,
        homeTeamId: input.homeTeamId || null,
        awayTeamId: input.awayTeamId || null,
        date: matchDate,
        venue: input.venue || null,
        round: input.round || null,
        status: input.status || 'scheduled',
      },
      include: {
        competition: { select: { name: true } },
        homeTeam: { select: { id: true, name: true, acronym: true } },
        awayTeam: { select: { id: true, name: true, acronym: true } },
      },
    });

    return {
      id: created.id,
      competitionId: created.competitionId,
      competitionName: created.competition.name,
      homeTeamId: created.homeTeamId,
      awayTeamId: created.awayTeamId,
      homeTeamName: created.homeTeam?.acronym || created.homeTeam?.name || 'À définir',
      awayTeamName: created.awayTeam?.acronym || created.awayTeam?.name || 'À définir',
      date: created.date.toISOString(),
      time: created.date.toISOString().slice(11, 16),
      venue: created.venue || '',
      round: created.round || null,
      status: created.status,
      homeScore: created.homeScore,
      awayScore: created.awayScore,
      resultType: created.resultType,
      refereeId: null,
      refereeName: null,
    };
  }

  async updateMatch(
    id: string,
    input: {
      competitionId?: string;
      homeTeamId?: string;
      awayTeamId?: string;
      date?: string;
      venue?: string;
      round?: string;
      status?: string;
    },
  ) {
    const existing = await this.prisma.match.findUnique({
      where: { id },
      include: {
        competition: { select: { name: true } },
        homeTeam: { select: { id: true, name: true, acronym: true } },
        awayTeam: { select: { id: true, name: true, acronym: true } },
      },
    });
    if (!existing) {
      throw new NotFoundException('Match introuvable.');
    }
    if (existing.status !== 'scheduled') {
      throw new BadRequestException('Seuls les matchs programmés peuvent être modifiés.');
    }

    const competitionId = input.competitionId ?? existing.competitionId;
    const homeTeamId = input.homeTeamId ?? existing.homeTeamId;
    const awayTeamId = input.awayTeamId ?? existing.awayTeamId;

    const changingOpponents =
      (input.homeTeamId !== undefined && input.homeTeamId !== existing.homeTeamId) ||
      (input.awayTeamId !== undefined && input.awayTeamId !== existing.awayTeamId) ||
      (input.competitionId !== undefined && input.competitionId !== existing.competitionId);

    if (changingOpponents) {
      const [competition, sheet] = await Promise.all([
        this.prisma.competition.findUnique({
          where: { id: competitionId },
          select: { phase: true, lockedAt: true },
        }),
        this.prisma.matchSheet.findUnique({ where: { matchId: id }, select: { id: true, status: true } }),
      ]);

      if (!competition) {
        throw new NotFoundException('Compétition introuvable.');
      }

      const phase = (competition as any).phase || 'draft';
      if (phase === 'locked' || phase === 'active' || competition.lockedAt) {
        throw new BadRequestException('Impossible de modifier les adversaires après verrouillage.');
      }
      if (sheet) {
        throw new BadRequestException('Impossible de modifier les adversaires après saisie de feuille.');
      }
    }

    if (homeTeamId === awayTeamId) {
      throw new BadRequestException('Les équipes doivent être différentes.');
    }

    if (input.competitionId) {
      const competition = await this.prisma.competition.findUnique({
        where: { id: competitionId },
        select: { id: true },
      });
      if (!competition) {
        throw new NotFoundException('Compétition introuvable.');
      }
    }

    if (input.homeTeamId || input.awayTeamId) {
      const teams = await this.prisma.org.findMany({
        where: {
          id: { in: [homeTeamId, awayTeamId].filter((id): id is string => !!id) },
          type: 'club',
          archived: false,
        },
        select: { id: true, name: true, acronym: true },
      });
      if (teams.length < 2) {
        throw new NotFoundException('Équipe introuvable.');
      }
    }

    let matchDate = existing.date;
    if (input.date) {
      matchDate = new Date(input.date);
      if (isNaN(matchDate.getTime())) {
        throw new BadRequestException('Date invalide.');
      }
    }

    const updated = await this.prisma.match.update({
      where: { id },
      data: {
        competitionId,
        homeTeamId,
        awayTeamId,
        date: matchDate,
        venue: input.venue !== undefined ? input.venue || null : existing.venue,
        round: input.round !== undefined ? input.round || null : existing.round,
        status: input.status ?? existing.status,
      },
      include: {
        competition: { select: { name: true } },
        homeTeam: { select: { id: true, name: true, acronym: true } },
        awayTeam: { select: { id: true, name: true, acronym: true } },
      },
    });

    return {
      id: updated.id,
      competitionId: updated.competitionId,
      competitionName: updated.competition.name,
      homeTeamId: updated.homeTeamId,
      awayTeamId: updated.awayTeamId,
      homeTeamName: updated.homeTeam?.acronym || updated.homeTeam?.name || 'À définir',
      awayTeamName: updated.awayTeam?.acronym || updated.awayTeam?.name || 'À définir',
      date: updated.date.toISOString(),
      time: updated.date.toISOString().slice(11, 16),
      venue: updated.venue || '',
      round: updated.round || null,
      status: updated.status,
      homeScore: updated.homeScore,
      awayScore: updated.awayScore,
      resultType: updated.resultType,
      refereeId: null,
      refereeName: null,
    };
  }

  async deleteMatch(id: string) {
    const existing = await this.prisma.match.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) {
      throw new NotFoundException('Match introuvable.');
    }
    if (existing.status !== 'scheduled') {
      throw new BadRequestException('Seuls les matchs programmés peuvent être supprimés.');
    }
    const sheet = await this.prisma.matchSheet.findUnique({
      where: { matchId: id },
      select: { id: true },
    });
    const operations = [];
    if (sheet) {
      operations.push(this.prisma.matchEvent.deleteMany({ where: { sheetId: sheet.id } }));
      operations.push(this.prisma.matchSheet.delete({ where: { matchId: id } }));
    }
    operations.push(this.prisma.match.delete({ where: { id } }));
    await this.prisma.$transaction(operations);
    return { success: true };
  }

  async listPlayers() {
    const members = await this.prisma.member.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        orgId: true,
        org: { select: { id: true, name: true, acronym: true } },
        positions: true,
        jerseyNumber: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    return members.map((m) => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      clubId: m.orgId || '',
      clubName: m.org?.acronym || m.org?.name || '',
      position: m.positions?.[0] || '',
      jerseyNumber: m.jerseyNumber || 0,
    }));
  }

  async listMatchSheets() {
    const sheets = await this.prisma.matchSheet.findMany({
      include: {
        events: true,
        match: { select: { homeTeamId: true, awayTeamId: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return sheets.map((s) => ({
      id: s.id,
      matchId: s.matchId,
      status: s.status,
      updatedAt: s.updatedAt.toISOString(),
      homeTeamId: s.match.homeTeamId,
      awayTeamId: s.match.awayTeamId,
      homeRoster: s.homeRoster,
      awayRoster: s.awayRoster,
      events: s.events.map((e) => ({
        id: e.id,
        type: e.type,
        teamId: e.teamId,
        playerId: e.playerId,
        assistIds: e.assistIds,
        period: (e as any).period ?? 'regulation',
        strength: e.strength,
        isGameWinningGoal: e.isGameWinning,
        pim: e.pim,
        plusMinusDelta: e.plusMinusDelta,
      })),
    }));
  }

  async upsertMatchSheet(
    matchId: string,
    input: {
      status?: string;
      homeRoster: string[];
      awayRoster: string[];
      events: { type: string; teamId: string; playerId: string; assistIds: string[]; period?: string }[];
      matchStatus?: string;
    },
  ) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        competition: { select: { name: true, type: true, format: true } },
        homeTeam: { select: { id: true, name: true, acronym: true } },
        awayTeam: { select: { id: true, name: true, acronym: true } },
      },
    });
    if (!match) {
      throw new NotFoundException('Match introuvable');
    }

    const status = input.status || 'draft';
    const validating = status === 'validated';

    if (validating) {
      if (!match.homeTeamId || !match.awayTeamId) {
        throw new BadRequestException('Les deux équipes doivent être définies pour valider.');
      }
    }

    const homeTeamId = match.homeTeamId || null;
    const awayTeamId = match.awayTeamId || null;

    let homeScore = 0;
    let awayScore = 0;
    let hasOvertimeGoal = false;

    (input.events || []).forEach((event) => {
      const period = event.period || 'regulation';
      if (period === 'overtime') hasOvertimeGoal = true;
      if (event.type !== 'goal') return;
      if (!homeTeamId || !awayTeamId) return;
      if (event.teamId === homeTeamId) homeScore += 1;
      else if (event.teamId === awayTeamId) awayScore += 1;
      else if (validating) throw new BadRequestException('But avec équipe invalide.');
    });

    if (validating) {
      if (homeScore === awayScore) {
        throw new BadRequestException('Match nul interdit. Ajoutez un but en prolongation.');
      }
      if (!hasOvertimeGoal) {
        hasOvertimeGoal = false;
      }
    }

    const resultType = validating ? (hasOvertimeGoal ? 'overtime' : 'regulation') : undefined;
    const winnerTeamId =
      validating && homeTeamId && awayTeamId
        ? homeScore > awayScore
          ? homeTeamId
          : awayTeamId
        : null;

    const matchStatus = validating ? 'completed' : input.matchStatus || undefined;
    const eventsPayload = (input.events || []).map((event) => ({
      type: event.type,
      teamId: event.teamId,
      playerId: event.playerId,
      assistIds: event.assistIds || [],
      period: event.period || 'regulation',
    }));

    const [sheet, updatedMatch] = await this.prisma.$transaction([
      this.prisma.matchSheet.upsert({
        where: { matchId },
        create: {
          matchId,
          status,
          homeRoster: input.homeRoster,
          awayRoster: input.awayRoster,
          events: { create: eventsPayload },
        },
        update: {
          status,
          homeRoster: input.homeRoster,
          awayRoster: input.awayRoster,
          events: { deleteMany: {}, create: eventsPayload },
        },
        include: {
          events: true,
          match: { select: { homeTeamId: true, awayTeamId: true } },
        },
      }),
      this.prisma.match.update({
        where: { id: matchId },
        data: {
          status: matchStatus,
          homeScore: homeTeamId && awayTeamId ? homeScore : null,
          awayScore: homeTeamId && awayTeamId ? awayScore : null,
          resultType,
          winnerTeamId: winnerTeamId || null,
        },
        include: {
          competition: { select: { name: true } },
          homeTeam: { select: { id: true, name: true, acronym: true } },
          awayTeam: { select: { id: true, name: true, acronym: true } },
        },
      }),
    ]);

    if (validating && winnerTeamId) {
      const compType = (match.competition as any).type || 'league';
      const compFormat =
        (match.competition as any).format ||
        (compType === 'cup' ? 'cup_single_elimination' : 'league_double_round_robin');
      if (compFormat === 'cup_single_elimination') {
        await this.placeCupWinner(matchId, winnerTeamId);
      }
    }

    return {
      sheet: {
        id: sheet.id,
        matchId: sheet.matchId,
        status: sheet.status,
        updatedAt: sheet.updatedAt.toISOString(),
        homeTeamId: sheet.match.homeTeamId,
        awayTeamId: sheet.match.awayTeamId,
        homeRoster: sheet.homeRoster,
        awayRoster: sheet.awayRoster,
        events: sheet.events.map((e) => ({
          id: e.id,
          type: e.type,
          teamId: e.teamId,
          playerId: e.playerId,
          assistIds: e.assistIds,
          period: (e as any).period ?? 'regulation',
          strength: e.strength,
          isGameWinningGoal: e.isGameWinning,
          pim: e.pim,
          plusMinusDelta: e.plusMinusDelta,
        })),
      },
      match: {
        id: updatedMatch.id,
        competitionId: updatedMatch.competitionId,
        competitionName: updatedMatch.competition.name,
        homeTeamId: updatedMatch.homeTeamId,
        awayTeamId: updatedMatch.awayTeamId,
        homeTeamName: updatedMatch.homeTeam?.acronym || updatedMatch.homeTeam?.name || 'À définir',
        awayTeamName: updatedMatch.awayTeam?.acronym || updatedMatch.awayTeam?.name || 'À définir',
        date: updatedMatch.date.toISOString(),
        time: updatedMatch.date.toISOString().slice(11, 16),
        venue: updatedMatch.venue || '',
        status: updatedMatch.status,
        homeScore: updatedMatch.homeScore,
        awayScore: updatedMatch.awayScore,
        resultType: updatedMatch.resultType,
        refereeId: null,
        refereeName: null,
      },
    };
  }

  async listManualPlayerStats() {
    const entries = await this.prisma.manualPlayerStats.findMany({
      select: {
        memberId: true,
        competitionId: true,
        gamesPlayed: true,
        goals: true,
        assists: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return entries.map((e) => ({
      memberId: e.memberId,
      competitionId: e.competitionId,
      updatedAt: e.updatedAt.toISOString(),
      stats: {
        matchesPlayed: e.gamesPlayed,
        goals: e.goals,
        assists: e.assists,
        points: e.goals + e.assists,
      },
    }));
  }

  async listCompetitionClubs(competitionId: string) {
    await this.prisma.competition.findUniqueOrThrow({ where: { id: competitionId } });
    const rows = await this.prisma.competitionClub.findMany({
      where: { competitionId },
      include: {
        club: { select: { id: true, name: true, acronym: true, status: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => ({
      id: row.club.id,
      name: row.club.name,
      acronym: row.club.acronym || row.club.name,
      status: row.club.status === 'active' ? 'active' : 'inactive',
    }));
  }

  async updateCompetitionClubs(competitionId: string, clubIds: string[]) {
    const competition = await this.prisma.competition.findUniqueOrThrow({ where: { id: competitionId } });
    const phase = (competition as any).phase || 'draft';
    if (phase !== 'draft' && phase !== 'prepared') {
      throw new BadRequestException('Impossible de modifier les clubs après verrouillage');
    }
    const uniqueIds = Array.from(new Set(clubIds.filter(Boolean)));
    const clubs = await this.prisma.org.findMany({
      where: { id: { in: uniqueIds }, type: 'club', archived: false },
      select: { id: true },
    });
    if (clubs.length !== uniqueIds.length) {
      throw new BadRequestException('Clubs invalides');
    }

    await this.prisma.competitionClub.deleteMany({
      where: {
        competitionId,
        clubId: { notIn: uniqueIds },
      },
    });

    if (uniqueIds.length > 0) {
      await this.prisma.competitionClub.createMany({
        data: uniqueIds.map((clubId) => ({ competitionId, clubId })),
        skipDuplicates: true,
      });
    }

    return this.listCompetitionClubs(competitionId);
  }

  async upsertManualPlayerStats(input: {
    memberId: string;
    competitionId: string;
    gamesPlayed: number;
    goals: number;
    assists: number;
    updatedById: string;
  }) {
    await this.prisma.member.findUniqueOrThrow({ where: { id: input.memberId } });
    await this.prisma.competition.findUniqueOrThrow({ where: { id: input.competitionId } });

    const entry = await this.prisma.manualPlayerStats.upsert({
      where: {
        memberId_competitionId: {
          memberId: input.memberId,
          competitionId: input.competitionId,
        },
      },
      create: {
        memberId: input.memberId,
        competitionId: input.competitionId,
        gamesPlayed: input.gamesPlayed,
        goals: input.goals,
        assists: input.assists,
        updatedById: input.updatedById,
      },
      update: {
        gamesPlayed: input.gamesPlayed,
        goals: input.goals,
        assists: input.assists,
        updatedById: input.updatedById,
      },
      select: {
        memberId: true,
        competitionId: true,
        gamesPlayed: true,
        goals: true,
        assists: true,
        updatedAt: true,
      },
    });

    return {
      memberId: entry.memberId,
      competitionId: entry.competitionId,
      updatedAt: entry.updatedAt.toISOString(),
      stats: {
        matchesPlayed: entry.gamesPlayed,
        goals: entry.goals,
        assists: entry.assists,
        points: entry.goals + entry.assists,
      },
    };
  }

  private computeStandings(matches: MatchRow[]) {
    const standings = new Map<string, StandingRow>();

    const ensure = (clubId: string, clubName: string) => {
      if (!standings.has(clubId)) {
        standings.set(clubId, {
          clubId,
          clubName,
          gp: 0,
          w: 0,
          l: 0,
          ot: 0,
          pts: 0,
          gf: 0,
          ga: 0,
          gd: 0,
        });
      }
      return standings.get(clubId)!;
    };

    matches.forEach((m) => {
      if (m.status !== 'completed' || m.homeScore === null || m.awayScore === null) return;

      const home = ensure(m.homeTeam.id, m.homeTeam.acronym || m.homeTeam.name);
      const away = ensure(m.awayTeam.id, m.awayTeam.acronym || m.awayTeam.name);

      home.gp += 1;
      away.gp += 1;
      home.gf += m.homeScore;
      home.ga += m.awayScore;
      away.gf += m.awayScore;
      away.ga += m.homeScore;

      const isOvertime = m.resultType === 'overtime' || m.resultType === 'shootout';
      if (m.homeScore > m.awayScore) {
        home.w += 1;
        home.pts += isOvertime ? 2 : 3;
        if (isOvertime) {
          away.ot += 1;
          away.pts += 1;
        } else {
          away.l += 1;
        }
      } else if (m.awayScore > m.homeScore) {
        away.w += 1;
        away.pts += isOvertime ? 2 : 3;
        if (isOvertime) {
          home.ot += 1;
          home.pts += 1;
        } else {
          home.l += 1;
        }
      }

      home.gd = home.gf - home.ga;
      away.gd = away.gf - away.ga;
    });

    return standings;
  }

  async getCompetitionStandings(competitionId: string) {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      select: { id: true, name: true, type: true },
    });
    if (!competition) throw new NotFoundException('Compétition introuvable.');
    if ((competition.type || 'league') !== 'league') {
      throw new BadRequestException('Classement disponible uniquement pour les ligues.');
    }

    const matches = await this.prisma.match.findMany({
      where: { competitionId },
      include: {
        homeTeam: { select: { id: true, name: true, acronym: true, logoDocumentId: true } },
        awayTeam: { select: { id: true, name: true, acronym: true, logoDocumentId: true } },
      },
      orderBy: { date: 'asc' },
    });

    const directory = new Map<string, { name: string; acronym: string | null; logoDocumentId: string | null }>();
    matches.forEach((m) => {
      if (m.homeTeam) directory.set(m.homeTeam.id, { name: m.homeTeam.name, acronym: m.homeTeam.acronym, logoDocumentId: m.homeTeam.logoDocumentId });
      if (m.awayTeam) directory.set(m.awayTeam.id, { name: m.awayTeam.name, acronym: m.awayTeam.acronym, logoDocumentId: m.awayTeam.logoDocumentId });
    });

    const matchRows = matches.filter((m) => m.homeTeam && m.awayTeam) as unknown as MatchRow[];
    const standingsMap = this.computeStandings(matchRows);
    const standings = Array.from(standingsMap.values())
      .sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      })
      .map((row, index) => {
        const club = directory.get(row.clubId);
        return {
          rank: index + 1,
          clubId: row.clubId,
          clubName: club?.name || row.clubName,
          clubAcronym: club?.acronym || row.clubName,
          logoDocumentId: club?.logoDocumentId || null,
          gp: row.gp,
          w: row.w,
          l: row.l,
          ot: row.ot,
          pts: row.pts,
          gf: row.gf,
          ga: row.ga,
          gd: row.gd,
        };
      });

    return {
      competition: { id: competition.id, name: competition.name, type: competition.type || 'league' },
      standings,
    };
  }

  private async computePlayerStatsByCompetition(competitionIds: string[]) {
    const matches = await this.prisma.match.findMany({
      where: { competitionId: { in: competitionIds }, status: 'completed' },
      select: { id: true, competitionId: true, status: true },
    });

    const matchMap = new Map(matches.map((m) => [m.id, m]));

    const sheets = await this.prisma.matchSheet.findMany({
      where: { matchId: { in: matches.map((m) => m.id) }, status: 'validated' },
      include: { events: true },
      orderBy: { updatedAt: 'desc' },
    });

    const autoStats = new Map<string, Map<string, PlayerBaseStat>>();
    const autoUpdatedAt = new Map<string, Map<string, Date>>();

    const ensure = (competitionId: string, memberId: string) => {
      if (!autoStats.has(competitionId)) autoStats.set(competitionId, new Map());
      const compMap = autoStats.get(competitionId)!;
      if (!compMap.has(memberId)) {
        compMap.set(memberId, { gamesPlayed: 0, goals: 0, assists: 0, points: 0 });
      }
      return compMap.get(memberId)!;
    };

    const registerUpdate = (competitionId: string, memberId: string, updatedAt: Date) => {
      if (!autoUpdatedAt.has(competitionId)) autoUpdatedAt.set(competitionId, new Map());
      const compMap = autoUpdatedAt.get(competitionId)!;
      const previous = compMap.get(memberId);
      if (!previous || updatedAt.getTime() > previous.getTime()) {
        compMap.set(memberId, updatedAt);
      }
    };

    sheets.forEach((sheet) => {
      const match = matchMap.get(sheet.matchId);
      if (!match) return;

      const roster = [...sheet.homeRoster, ...sheet.awayRoster];
      roster.forEach((memberId) => {
        const stat = ensure(match.competitionId, memberId);
        stat.gamesPlayed += 1;
        registerUpdate(match.competitionId, memberId, sheet.updatedAt);
      });

      sheet.events.forEach((event) => {
        if (event.type === 'goal') {
          const scorer = ensure(match.competitionId, event.playerId);
          scorer.goals += 1;
          registerUpdate(match.competitionId, event.playerId, sheet.updatedAt);

          event.assistIds.forEach((assistId) => {
            const assist = ensure(match.competitionId, assistId);
            assist.assists += 1;
            registerUpdate(match.competitionId, assistId, sheet.updatedAt);
          });
        }
      });
    });

    autoStats.forEach((compMap) => {
      compMap.forEach((stat) => {
        stat.points = stat.goals + stat.assists;
      });
    });

    const manual = await this.prisma.manualPlayerStats.findMany({
      where: { competitionId: { in: competitionIds } },
      select: {
        memberId: true,
        competitionId: true,
        gamesPlayed: true,
        goals: true,
        assists: true,
        updatedAt: true,
      },
    });

    const manualMap = new Map<string, Map<string, typeof manual[number]>>();
    manual.forEach((m) => {
      if (!manualMap.has(m.competitionId)) manualMap.set(m.competitionId, new Map());
      manualMap.get(m.competitionId)!.set(m.memberId, m);
    });

    return { autoStats, autoUpdatedAt, manualMap };
  }

  async getCompetitionPlayerStats(competitionId: string) {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      select: { id: true, name: true, type: true },
    });
    if (!competition) throw new NotFoundException('Compétition introuvable.');

    const { autoStats, autoUpdatedAt, manualMap } = await this.computePlayerStatsByCompetition([competitionId]);
    const compAuto = autoStats.get(competitionId) || new Map();
    const compAutoUpdated = autoUpdatedAt.get(competitionId) || new Map();
    const compManual = manualMap.get(competitionId) || new Map();

    const allPlayers = new Set<string>([...compAuto.keys(), ...compManual.keys()]);
    if (allPlayers.size === 0) {
      return { competition: { id: competition.id, name: competition.name, type: competition.type || 'league' }, leaderboard: [] };
    }

    const members = await this.prisma.member.findMany({
      where: { id: { in: Array.from(allPlayers) } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jerseyNumber: true,
        orgId: true,
        org: { select: { id: true, name: true, acronym: true, logoDocumentId: true } },
      },
    });

    const directory = new Map(
      members.map((m) => [
        m.id,
        {
          playerId: m.id,
          playerName: `${m.firstName} ${m.lastName}`,
          jerseyNumber: m.jerseyNumber ?? null,
          clubId: m.orgId || null,
          clubName: m.org?.name || '',
          clubAcronym: m.org?.acronym || m.org?.name || '',
          clubLogoId: m.org?.logoDocumentId || null,
        },
      ]),
    );

    const leaderboard = Array.from(allPlayers).map((memberId) => {
      const auto = compAuto.get(memberId) || { gamesPlayed: 0, goals: 0, assists: 0, points: 0 };
      const manual = compManual.get(memberId);
      const autoUpdatedAtForPlayer = compAutoUpdated.get(memberId);
      const useManual =
        !!manual && (!autoUpdatedAtForPlayer || manual.updatedAt.getTime() > autoUpdatedAtForPlayer.getTime());

      const chosen = useManual
        ? {
            gamesPlayed: manual!.gamesPlayed,
            goals: manual!.goals,
            assists: manual!.assists,
            points: manual!.goals + manual!.assists,
          }
        : auto;

      const info =
        directory.get(memberId) ||
        ({
          playerId: memberId,
          playerName: '—',
          jerseyNumber: null,
          clubId: null,
          clubName: '',
          clubAcronym: '',
          clubLogoId: null,
        } as const);

      return {
        playerId: info.playerId,
        playerName: info.playerName,
        jerseyNumber: info.jerseyNumber,
        clubId: info.clubId,
        clubName: info.clubName,
        clubAcronym: info.clubAcronym,
        clubLogoId: info.clubLogoId,
        matchesPlayed: chosen.gamesPlayed,
        goals: chosen.goals,
        assists: chosen.assists,
        points: chosen.points,
        source: useManual ? 'manual' : 'auto',
        lastUpdated: (useManual ? manual!.updatedAt : autoUpdatedAtForPlayer)?.toISOString() ?? null,
      };
    });

    leaderboard.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goals !== a.goals) return b.goals - a.goals;
      if (b.assists !== a.assists) return b.assists - a.assists;
      return b.matchesPlayed - a.matchesPlayed;
    });

    return {
      competition: { id: competition.id, name: competition.name, type: competition.type || 'league' },
      leaderboard,
    };
  }

  async getActiveCompetitionsOverview() {
    const competitions = await this.prisma.competition.findMany({
      orderBy: { startDate: 'asc' },
    });

    const active = competitions
      .map((c) => ({ ...c, derivedStatus: this.getCompetitionStatus(c as unknown as CompetitionRow) }))
      .filter((c) => c.derivedStatus === 'active');

    return active.map((c) => ({
      id: c.id,
      name: c.name,
      season: c.season,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
      type: c.type || 'league',
    }));
  }

  async getActiveCompetitionsStandings() {
    const activeCompetitions = await this.getActiveCompetitionsOverview();
    const leagueCompetitions = activeCompetitions.filter((c) => c.type === 'league');
    const competitionIds = leagueCompetitions.map((c) => c.id);
    if (competitionIds.length === 0) return [];

    const matches = await this.prisma.match.findMany({
      where: { competitionId: { in: competitionIds } },
      include: {
        competition: { select: { name: true } },
        homeTeam: { select: { id: true, name: true, acronym: true } },
        awayTeam: { select: { id: true, name: true, acronym: true } },
      },
      orderBy: { date: 'desc' },
    });

    const { autoStats, autoUpdatedAt, manualMap } = await this.computePlayerStatsByCompetition(competitionIds);

    const memberIds = new Set<string>();
    autoStats.forEach((compMap) => compMap.forEach((_v, memberId) => memberIds.add(memberId)));
    manualMap.forEach((compMap) => compMap.forEach((_v, memberId) => memberIds.add(memberId)));

    const members = await this.prisma.member.findMany({
      where: { id: { in: Array.from(memberIds) } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        org: { select: { acronym: true, name: true } },
      },
    });

    const memberDirectory = new Map(
      members.map((m) => [
        m.id,
        { name: `${m.firstName} ${m.lastName}`, clubName: m.org?.acronym || m.org?.name || '' },
      ]),
    );

    return leagueCompetitions.map((competition) => {
      const competitionMatches = matches.filter((m) => m.competitionId === competition.id) as unknown as MatchRow[];
      const standingsMap = this.computeStandings(competitionMatches);
      const standings = Array.from(standingsMap.values()).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
      });

      const compAuto = autoStats.get(competition.id) || new Map();
      const compAutoUpdated = autoUpdatedAt.get(competition.id) || new Map();
      const compManual = manualMap.get(competition.id) || new Map();

      const allPlayers = new Set<string>([...compAuto.keys(), ...compManual.keys()]);

      const leaderboard = Array.from(allPlayers).map((memberId) => {
        const auto = compAuto.get(memberId) || { gamesPlayed: 0, goals: 0, assists: 0, points: 0 };
        const manual = compManual.get(memberId);
        const autoUpdatedAtForPlayer = compAutoUpdated.get(memberId);
        const useManual =
          !!manual &&
          (!autoUpdatedAtForPlayer || manual.updatedAt.getTime() > autoUpdatedAtForPlayer.getTime());

        const chosen = useManual
          ? {
              gamesPlayed: manual!.gamesPlayed,
              goals: manual!.goals,
              assists: manual!.assists,
              points: manual!.goals + manual!.assists,
            }
          : auto;

        const info = memberDirectory.get(memberId) || { name: '—', clubName: '—' };

        return {
          playerId: memberId,
          playerName: info.name,
          clubName: info.clubName,
          matchesPlayed: chosen.gamesPlayed,
          goals: chosen.goals,
          assists: chosen.assists,
          points: chosen.points,
          source: useManual ? 'manual' : 'auto',
          lastUpdated: (useManual ? manual!.updatedAt : autoUpdatedAtForPlayer)?.toISOString(),
        };
      });

      leaderboard.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goals !== a.goals) return b.goals - a.goals;
        if (b.assists !== a.assists) return b.assists - a.assists;
        return b.matchesPlayed - a.matchesPlayed;
      });

      return {
        competition,
        standings,
        leaderboard,
      };
    });
  }

  async getPublicPlayerProfile(memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nationality: true,
        orgId: true,
        org: { select: { id: true, name: true, acronym: true, logoDocumentId: true } },
        documents: { select: { id: true, type: true } },
      },
    });

    if (!member) throw new NotFoundException('Member not found');

    const photoDocumentId = member.documents.find((d) => d.type === 'photo')?.id || null;
    const activeCompetitions = await this.getActiveCompetitionsOverview();
    const competitionIds = activeCompetitions.map((c) => c.id);

    const { autoStats, autoUpdatedAt, manualMap } = await this.computePlayerStatsByCompetition(competitionIds);

    const totals = { gamesPlayed: 0, goals: 0, assists: 0, points: 0 };
    competitionIds.forEach((competitionId) => {
      const auto = autoStats.get(competitionId)?.get(memberId) || { gamesPlayed: 0, goals: 0, assists: 0, points: 0 };
      const manual = manualMap.get(competitionId)?.get(memberId);
      const updated = autoUpdatedAt.get(competitionId)?.get(memberId);
      const useManual = !!manual && (!updated || manual.updatedAt.getTime() > updated.getTime());
      const chosen = useManual
        ? {
            gamesPlayed: manual!.gamesPlayed,
            goals: manual!.goals,
            assists: manual!.assists,
            points: manual!.goals + manual!.assists,
          }
        : auto;

      totals.gamesPlayed += chosen.gamesPlayed;
      totals.goals += chosen.goals;
      totals.assists += chosen.assists;
      totals.points += chosen.points;
    });

    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      nationality: member.nationality,
      club: member.org
        ? {
            id: member.org.id,
            name: member.org.name,
            acronym: member.org.acronym,
            logoDocumentId: member.org.logoDocumentId,
          }
        : null,
      photoDocumentId,
      stats: {
        matchesPlayed: totals.gamesPlayed,
        goals: totals.goals,
        assists: totals.assists,
        points: totals.points,
      },
    };
  }

  async getPublicClubProfile(orgId: string) {
    const club = await this.prisma.org.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        acronym: true,
        logoDocumentId: true,
        status: true,
        type: true,
      },
    });

    if (!club) throw new NotFoundException('Club not found');

    const allCompetitions = await this.prisma.competition.findMany({
      where: {
        endDate: { gte: new Date() }, // Active or Upcoming
      },
      orderBy: { startDate: 'asc' },
    });

    const assignments = await this.prisma.competitionClub.findMany({
      where: { clubId: orgId },
      select: { competitionId: true },
    });
    
    const assignedIds = new Set(assignments.map((a) => a.competitionId));

    const participationMatches = await this.prisma.match.findMany({
      where: {
        competitionId: { in: allCompetitions.map((c) => c.id) },
        OR: [{ homeTeamId: orgId }, { awayTeamId: orgId }],
      },
      select: { competitionId: true },
      distinct: ['competitionId'],
    });
    
    participationMatches.forEach((m) => assignedIds.add(m.competitionId));

    const competitions = allCompetitions
      .filter((c) => assignedIds.has(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        season: c.season,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate.toISOString(),
        status: this.getCompetitionStatus(c as unknown as CompetitionRow),
      }));

    const upcomingMatches = await this.prisma.match.findMany({
      where: {
        OR: [{ homeTeamId: orgId }, { awayTeamId: orgId }],
        date: { gte: new Date() },
        status: 'scheduled',
      },
      orderBy: { date: 'asc' },
      take: 5,
      include: {
        competition: { select: { name: true } },
        homeTeam: { select: { id: true, name: true, acronym: true, logoDocumentId: true } },
        awayTeam: { select: { id: true, name: true, acronym: true, logoDocumentId: true } },
      },
    });

    const recentResults = await this.prisma.match.findMany({
      where: {
        OR: [{ homeTeamId: orgId }, { awayTeamId: orgId }],
        status: 'completed',
      },
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        competition: { select: { name: true } },
        homeTeam: { select: { id: true, name: true, acronym: true, logoDocumentId: true } },
        awayTeam: { select: { id: true, name: true, acronym: true, logoDocumentId: true } },
      },
    });

    return {
      id: club.id,
      name: club.name,
      acronym: club.acronym,
      logoDocumentId: club.logoDocumentId,
      competitions,
      upcomingMatches: upcomingMatches.map(m => ({
        id: m.id,
        date: m.date,
        competitionName: m.competition.name,
        homeTeam: m.homeTeam?.acronym || m.homeTeam?.name || 'À définir',
        awayTeam: m.awayTeam?.acronym || m.awayTeam?.name || 'À définir',
        homeLogo: m.homeTeam?.logoDocumentId,
        awayLogo: m.awayTeam?.logoDocumentId,
        venue: m.venue
      })),
      recentResults: recentResults.map(m => ({
        id: m.id,
        date: m.date,
        competitionName: m.competition.name,
        homeTeam: m.homeTeam?.acronym || m.homeTeam?.name || 'À définir',
        awayTeam: m.awayTeam?.acronym || m.awayTeam?.name || 'À définir',
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        resultType: m.resultType,
        homeLogo: m.homeTeam?.logoDocumentId,
        awayLogo: m.awayTeam?.logoDocumentId,
      })),
    };
  }
}
