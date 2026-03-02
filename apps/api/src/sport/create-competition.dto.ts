import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

const teamCategories = ['U7', 'U9', 'U11', 'U13', 'U15', 'U17', 'U20', 'Seniors'];

export class CreateCompetitionDto {
  @IsString()
  name!: string;

  @IsString()
  season!: string;

  @IsOptional()
  @IsString()
  @IsIn(teamCategories)
  category?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @IsIn(['league', 'cup'])
  type!: string;

  @IsOptional()
  @IsString()
  @IsIn(['league_double_round_robin', 'cup_single_elimination'])
  format?: string;

  @ValidateIf((value) => value.type === 'cup')
  @IsInt()
  @Min(2)
  @Type(() => Number)
  cupTeamCount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  clubIds?: string[];

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateCompetitionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @IsString()
  @IsIn(teamCategories)
  category?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @IsIn(['league', 'cup'])
  type?: string;

  @IsOptional()
  @IsString()
  @IsIn(['league_double_round_robin', 'cup_single_elimination'])
  format?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Type(() => Number)
  cupTeamCount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  clubIds?: string[];

  @IsOptional()
  @IsString()
  status?: string;
}
