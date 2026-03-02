import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  amount_cents: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  duration_months?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  amount_cents?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  duration_months?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
