import { Controller, Get, Param } from '@nestjs/common';
import { SportService } from './sport.service';

@Controller('public/sport')
export class PublicSportController {
  constructor(private sportService: SportService) {}

  @Get('competitions/active')
  getActiveCompetitions() {
    return this.sportService.getActiveCompetitionsOverview();
  }

  @Get('competitions/active/standings')
  getActiveStandings() {
    return this.sportService.getActiveCompetitionsStandings();
  }

  @Get('matches')
  getPublicMatches() {
    return this.sportService.getPublicMatches();
  }

  @Get('clubs')
  getPublicClubs() {
    return this.sportService.getPublicClubs();
  }

  @Get('players')
  getPublicPlayers() {
    return this.sportService.getPublicPlayers();
  }

  @Get('players/:id')
  getPlayer(@Param('id') id: string) {
    return this.sportService.getPublicPlayerProfile(id);
  }

  @Get('clubs/:id')
  getClub(@Param('id') id: string) {
    return this.sportService.getPublicClubProfile(id);
  }
}
