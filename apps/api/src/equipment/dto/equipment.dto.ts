import { IsIn, IsInt, IsOptional, IsString, IsUUID, Min, Length } from 'class-validator';

export class CreateEquipmentItemDto {
  @IsString()
  @Length(1, 200)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  reference?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  min_quantity?: number;

  @IsString()
  @Length(1, 50)
  condition: string;

  @IsString()
  @Length(1, 50)
  location: string;

  @IsOptional()
  @IsUUID()
  owner_org_id?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;

  @IsOptional()
  @IsUUID()
  photo_document_id?: string;
}

export class CreateEquipmentMovementDto {
  @IsUUID()
  equipment_id: string;

  @IsString()
  @IsIn(['transfer', 'loan', 'repair', 'disposal'])
  movement_type: 'transfer' | 'loan' | 'repair' | 'disposal';

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @Length(1, 1000)
  reason: string;

  @IsOptional()
  @IsIn(['organization', 'member'])
  destination_type?: 'organization' | 'member';

  @IsOptional()
  @IsUUID()
  to_org_id?: string;

  @IsOptional()
  @IsUUID()
  to_member_id?: string;
}
