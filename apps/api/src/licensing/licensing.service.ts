import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

type Season = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class LicensingService {
  private seasons: Season[] = [];

  private ensureSeasons() {
    if (this.seasons.length > 0) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const makeSeason = (year: number, isActive: boolean): Season => ({
      id: `season-${year}`,
      code: year.toString(),
      name: `Saison ${year}/${year + 1}`,
      isActive,
      startDate: `${year}-09-01`,
      endDate: `${year + 1}-08-31`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    this.seasons = [
      makeSeason(currentYear, true),
      makeSeason(currentYear - 1, false),
      makeSeason(currentYear - 2, false),
    ];
  }

  getSeasons() {
    this.ensureSeasons();
    return [...this.seasons].sort((a, b) => b.startDate.localeCompare(a.startDate));
  }

  createSeason(data: {
    code: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  }) {
    this.ensureSeasons();

    const id = `season-${data.code}`;
    if (this.seasons.some(season => season.id === id || season.code === data.code)) {
      throw new BadRequestException('Season already exists');
    }

    const now = new Date().toISOString();
    const season: Season = {
      id,
      code: data.code,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive ?? false,
      createdAt: now,
      updatedAt: now,
    };

    if (season.isActive) {
      this.seasons = this.seasons.map(s => ({ ...s, isActive: false, updatedAt: now }));
    }

    this.seasons = [season, ...this.seasons];
    return season;
  }

  updateSeason(id: string, data: {
    code?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }) {
    this.ensureSeasons();
    const index = this.seasons.findIndex(season => season.id === id);
    if (index === -1) {
      throw new NotFoundException('Season not found');
    }

    const nextCode = data.code ?? this.seasons[index].code;
    const nextId = `season-${nextCode}`;
    if (nextId !== id && this.seasons.some(season => season.id === nextId || season.code === nextCode)) {
      throw new BadRequestException('Season already exists');
    }

    const now = new Date().toISOString();
    const nextSeason: Season = {
      ...this.seasons[index],
      ...data,
      id: nextId,
      code: nextCode,
      updatedAt: now,
    };

    if (data.isActive) {
      this.seasons = this.seasons.map(season =>
        season.id === id ? season : { ...season, isActive: false, updatedAt: now },
      );
    }

    this.seasons[index] = nextSeason;
    return nextSeason;
  }

  deleteSeason(id: string) {
    this.ensureSeasons();
    const index = this.seasons.findIndex(season => season.id === id);
    if (index === -1) {
      throw new NotFoundException('Season not found');
    }
    const [removed] = this.seasons.splice(index, 1);
    return removed;
  }
}
