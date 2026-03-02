import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

enum MemberPaymentStatus {
  pending = 'pending',
  paid = 'paid',
  canceled = 'canceled',
}

export class CreateMemberSubscriptionDto {
  @IsUUID()
  @IsOptional()
  subscriptionId?: string;

  @IsString()
  @IsOptional()
  seasonId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  amountCents?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;
}

export class RenewMemberSubscriptionDto extends CreateMemberSubscriptionDto {}

export class AddMemberPaymentDto {
  @IsInt()
  @Min(0)
  amountCents: number;

  @IsString()
  @IsOptional()
  method?: string;

  @IsEnum(MemberPaymentStatus)
  @IsOptional()
  status?: MemberPaymentStatus;

  @IsDateString()
  @IsOptional()
  paidAt?: string;

  @IsString()
  @IsOptional()
  reference?: string;
}
