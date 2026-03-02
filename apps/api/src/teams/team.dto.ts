import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  orgId: string;
}

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  description?: string;
}