import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthUser } from '../auth/auth.service';
import { CreateCompetitionDto, UpdateCompetitionDto } from './create-competition.dto';
import { UpsertManualPlayerStatsDto } from './upsert-manual-player-stats.dto';
import { SportService } from './sport.service';

class UpdateCompetitionClubsDto {
  @IsArray()
  @IsString({ each: true })
  clubIds: string[];
}

class CompetitionScheduleDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  roundIntervalDays?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  matchIntervalMinutes?: number;

  @IsOptional()
  @IsString()
  venue?: string;
}

class CupFirstRoundPairDto {
  @IsString()
  homeTeamId!: string;

  @IsString()
  awayTeamId!: string;
}

class PrepareCompetitionDto extends CompetitionScheduleDto {}

class LockCompetitionDto extends CompetitionScheduleDto {
  @IsOptional()
  @IsString()
  @IsIn(['auto', 'manual'])
  mode?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CupFirstRoundPairDto)
  firstRoundPairs?: CupFirstRoundPairDto[];
}

class RegenerateCompetitionDrawDto extends LockCompetitionDto {}

class CreateMatchDto {
  @IsString()
  competitionId: string;

  @IsOptional()
  @IsString()
  homeTeamId?: string;

  @IsOptional()
  @IsString()
  awayTeamId?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsString()
  round?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

class UpdateMatchDto {
  @IsOptional()
  @IsString()
  competitionId?: string;

  @IsOptional()
  @IsString()
  homeTeamId?: string;

  @IsOptional()
  @IsString()
  awayTeamId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsString()
  round?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

class MatchEventDto {
  @IsString()
  type: string;

  @IsString()
  teamId: string;

  @IsString()
  playerId: string;

  @IsArray()
  @IsString({ each: true })
  assistIds: string[];

  @IsOptional()
  @IsString()
  @IsIn(['regulation', 'overtime'])
  period?: string;
}

class UpdateMatchSheetDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsArray()
  @IsString({ each: true })
  homeRoster: string[];

  @IsArray()
  @IsString({ each: true })
  awayRoster: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchEventDto)
  events: MatchEventDto[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  homeScore?: number | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  awayScore?: number | null;

  @IsOptional()
  @IsString()
  matchStatus?: string;
}

@Controller('sport')
export class SportController {
  constructor(private sportService: SportService) {}

  @Get('competitions')
  @UseGuards(JwtAuthGuard)
  listCompetitions() {
    return this.sportService.listCompetitions();
  }

  @Post('competitions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('federation_admin')
  createCompetition(@Body() dto: CreateCompetitionDto) {
    return this.sportService.createCompetition(dto);
  }

  @Put('competitions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('federation_admin')
  updateCompetition(@Param('id') id: string, @Body() dto: UpdateCompetitionDto) {
    return this.sportService.updateCompetition(id, dto);
  }

  @Post('competitions/:id/prepare')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('federation_admin')
  prepareCompetition(@Param('id') id: string, @Body() dto: PrepareCompetitionDto) {
    return this.sportService.prepareCompetition(id, dto);
  }

  @Post('competitions/:id/lock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('federation_admin')
  lockCompetition(@Param('id') id: string, @Body() dto: LockCompetitionDto) {
    return this.sportService.lockCompetition(id, dto);
  }

  @Post('competitions/:id/regenerate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('federation_admin')
  regenerateCompetition(@Param('id') id: string, @Body() dto: RegenerateCompetitionDrawDto) {
    return this.sportService.regenerateCompetitionDraw(id, dto);
  }

  @Delete('competitions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('federation_admin')
  deleteCompetition(@Param('id') id: string) {
    return this.sportService.deleteCompetition(id);
  }

  @Get('competitions/:id/clubs')
  @UseGuards(JwtAuthGuard)
  listCompetitionClubs(@Param('id') id: string) {
    return this.sportService.listCompetitionClubs(id);
  }

  @Put('competitions/:id/clubs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('federation_admin')
  updateCompetitionClubs(@Param('id') id: string, @Body() dto: UpdateCompetitionClubsDto) {
    return this.sportService.updateCompetitionClubs(id, dto.clubIds || []);
  }

  @Get('competitions/:id/standings')
  @UseGuards(JwtAuthGuard)
  getCompetitionStandings(@Param('id') id: string) {
    return this.sportService.getCompetitionStandings(id);
  }

  @Get('competitions/:id/player-stats')
  @UseGuards(JwtAuthGuard)
  getCompetitionPlayerStats(@Param('id') id: string) {
    return this.sportService.getCompetitionPlayerStats(id);
  }

  @Get('clubs')
  @UseGuards(JwtAuthGuard)
  listClubs() {
    return this.sportService.listClubs();
  }

  @Get('matches')
  @UseGuards(JwtAuthGuard)
  listMatches() {
    return this.sportService.listMatches();
  }

  @Post('matches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('federation_admin')
  createMatch(@Body() dto: CreateMatchDto) {
    return this.sportService.createMatch(dto);
  }

  @Put('matches/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('federation_admin')
  updateMatch(@Param('id') id: string, @Body() dto: UpdateMatchDto) {
    return this.sportService.updateMatch(id, dto);
  }

  @Delete('matches/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('federation_admin')
  deleteMatch(@Param('id') id: string) {
    return this.sportService.deleteMatch(id);
  }

  @Get('players')
  @UseGuards(JwtAuthGuard)
  listPlayers() {
    return this.sportService.listPlayers();
  }

  @Get('match-sheets')
  @UseGuards(JwtAuthGuard)
  listMatchSheets() {
    return this.sportService.listMatchSheets();
  }

  @Put('match-sheets/:matchId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('federation_admin')
  upsertMatchSheet(@Param('matchId') matchId: string, @Body() dto: UpdateMatchSheetDto) {
    return this.sportService.upsertMatchSheet(matchId, dto);
  }

  @Get('manual-player-stats')
  @UseGuards(JwtAuthGuard)
  listManualPlayerStats() {
    return this.sportService.listManualPlayerStats();
  }

  @Put('manual-player-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('federation_admin')
  upsertManualPlayerStats(@Body() dto: UpsertManualPlayerStatsDto, @CurrentUser() user: AuthUser) {
    return this.sportService.upsertManualPlayerStats({
      memberId: dto.memberId,
      competitionId: dto.competitionId,
      gamesPlayed: dto.matchesPlayed,
      goals: dto.goals,
      assists: dto.assists,
      updatedById: user.id,
    });
  }
}
