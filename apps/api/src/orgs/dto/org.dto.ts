import { IsString, IsOptional, IsEnum, IsEmail, IsArray, IsDateString, IsObject } from 'class-validator';

export enum OrgType {
  club = 'club',
  national_team = 'national_team',
}

export enum OrgStatus {
  pending = 'pending',
  active = 'active',
  suspended = 'suspended',
  archived = 'archived',
}

export class CreateOrgDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  acronym?: string;

  @IsOptional()
  @IsEnum(OrgType)
  type?: OrgType;

  @IsOptional()
  @IsEnum(OrgStatus)
  status?: OrgStatus;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  organizationType?: string;

  @IsOptional()
  @IsDateString()
  establishmentDate?: string;

  @IsOptional()
  @IsString()
  federalRegistrationNumber?: string;

  @IsOptional()
  @IsString()
  referenceSeason?: string;

  @IsOptional()
  @IsString()
  fullAddress?: string;

  @IsOptional()
  @IsString()
  primaryPhone?: string;

  @IsOptional()
  @IsString()
  secondaryPhone?: string;

  @IsOptional()
  @IsEmail()
  officialEmail?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsObject()
  socialMedia?: Record<string, string>;

  @IsOptional()
  @IsString()
  presidentName?: string;

  @IsOptional()
  @IsEmail()
  presidentEmail?: string;

  @IsOptional()
  @IsString()
  presidentPhone?: string;

  @IsOptional()
  @IsString()
  secretaryGeneralName?: string;

  @IsOptional()
  @IsString()
  treasurerName?: string;

  @IsOptional()
  @IsString()
  primaryContactName?: string;

  @IsOptional()
  @IsString()
  primaryContactPhone?: string;

  @IsOptional()
  @IsArray()
  activeCategories?: string[];

  @IsOptional()
  @IsArray()
  practicedDisciplines?: string[];

  @IsOptional()
  @IsObject()
  clubColors?: Record<string, string>;

  @IsOptional()
  @IsString()
  logoDocumentId?: string;

  @IsOptional()
  @IsString()
  ribIban?: string;
}

export class UpdateOrgDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  acronym?: string;

  @IsOptional()
  @IsEnum(OrgType)
  type?: OrgType;

  @IsOptional()
  @IsEnum(OrgStatus)
  status?: OrgStatus;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  organizationType?: string;

  @IsOptional()
  @IsDateString()
  establishmentDate?: string;

  @IsOptional()
  @IsString()
  federalRegistrationNumber?: string;

  @IsOptional()
  @IsString()
  referenceSeason?: string;

  @IsOptional()
  @IsString()
  fullAddress?: string;

  @IsOptional()
  @IsString()
  primaryPhone?: string;

  @IsOptional()
  @IsString()
  secondaryPhone?: string;

  @IsOptional()
  @IsEmail()
  officialEmail?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsObject()
  socialMedia?: Record<string, string>;

  @IsOptional()
  @IsString()
  presidentName?: string;

  @IsOptional()
  @IsEmail()
  presidentEmail?: string;

  @IsOptional()
  @IsString()
  presidentPhone?: string;

  @IsOptional()
  @IsString()
  secretaryGeneralName?: string;

  @IsOptional()
  @IsString()
  treasurerName?: string;

  @IsOptional()
  @IsString()
  primaryContactName?: string;

  @IsOptional()
  @IsString()
  primaryContactPhone?: string;

  @IsOptional()
  @IsArray()
  activeCategories?: string[];

  @IsOptional()
  @IsArray()
  practicedDisciplines?: string[];

  @IsOptional()
  @IsObject()
  clubColors?: Record<string, string>;

  @IsOptional()
  @IsString()
  logoDocumentId?: string;

  @IsOptional()
  @IsString()
  ribIban?: string;

  @IsOptional()
  @IsString()
  suspensionReason?: string;
}
