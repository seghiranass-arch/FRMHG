import { IsInt, IsString, Min } from 'class-validator';

export class UpsertManualPlayerStatsDto {
  @IsString()
  memberId!: string;

  @IsString()
  competitionId!: string;

  @IsInt()
  @Min(0)
  matchesPlayed!: number;

  @IsInt()
  @Min(0)
  goals!: number;

  @IsInt()
  @Min(0)
  assists!: number;
}
