import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsDateString,
  IsInt,
  IsEnum,
  IsArray,
  IsBoolean,
  Length,
  Matches,
} from 'class-validator';

export class CreateMemberDto {
  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsEnum(['M', 'F'])
  sex: 'M' | 'F';

  @IsDateString()
  dateOfBirth: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @Matches(/^(\+212|0)[5-7]\d{8}$/, {
    message: 'Invalid Moroccan phone number format'
  })
  phone: string;

  @IsString()
  @Length(1, 200)
  address: string;

  @IsString()
  @Length(1, 100)
  city: string;

  @IsString()
  @Length(1, 100)
  region: string;

  @IsString()
  @Length(1, 100)
  nationality: string;

  @IsString()
  @Length(1, 50)
  idNumber: string;

  @IsEnum(['cin', 'passport'])
  idType: 'cin' | 'passport';

  @IsString()
  @Length(1, 100)
  emergencyContactName: string;

  @IsString()
  @Matches(/^(\+212|0)[5-7]\d{8}$/, {
    message: 'Invalid Moroccan phone number format'
  })
  emergencyContactPhone: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  discipline?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  ageCategory?: string;

  @IsArray()
  @IsOptional()
  positions?: string[];

  @IsInt()
  @IsOptional()
  jerseyNumber?: number;

  @IsEnum(['adherent', 'club_player'])
  memberStatus: 'adherent' | 'club_player';

  @IsUUID()
  @IsOptional()
  assignedClubId?: string;

  @IsUUID()
  @IsOptional()
  teamId?: string;

  @IsDateString()
  @IsOptional()
  assignmentStartDate?: string;

  @IsDateString()
  @IsOptional()
  assignmentEndDate?: string;

  @IsString()
  @IsOptional()
  subscriptionType?: string;

  @IsString()
  @IsOptional()
  seasonId?: string;

  @IsInt()
  @IsOptional()
  subscriptionAmount?: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsEnum(['pending', 'paid', 'overdue'])
  @IsOptional()
  paymentStatus?: 'pending' | 'paid' | 'overdue';

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsString()
  @IsOptional()
  paymentReference?: string;

  @IsString()
  @IsOptional()
  medicalStatus?: string;

  @IsDateString()
  @IsOptional()
  lastMedicalVisitDate?: string;

  @IsString()
  @IsOptional()
  federationDoctor?: string;

  @IsString()
  @IsOptional()
  medicalFitness?: string;

  @IsDateString()
  @IsOptional()
  fitnessExpirationDate?: string;

  @IsUUID()
  @IsOptional()
  medicalCertificateId?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  licenseSeason?: string;

  @IsString()
  @IsOptional()
  licenseType?: string;

  @IsEnum(['draft', 'pending_payment', 'pending_approval', 'active', 'archived'])
  @IsOptional()
  licenseStatus?: 'draft' | 'pending_payment' | 'pending_approval' | 'active' | 'archived';

  @IsDateString()
  @IsOptional()
  licenseIssueDate?: string;

  @IsDateString()
  @IsOptional()
  licenseExpirationDate?: string;

  @IsEnum(['active', 'inactive', 'suspended', 'archived'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'suspended' | 'archived';

  @IsDateString()
  @IsOptional()
  registrationDate?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;
}

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  firstName?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  lastName?: string;

  @IsEnum(['M', 'F'])
  @IsOptional()
  sex?: 'M' | 'F';

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(\+212|0)[5-7]\d{8}$/, {
    message: 'Invalid Moroccan phone number format'
  })
  phone?: string;

  @IsString()
  @IsOptional()
  @Length(1, 200)
  address?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  city?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  region?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  nationality?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  idNumber?: string;

  @IsEnum(['cin', 'passport'])
  @IsOptional()
  idType?: 'cin' | 'passport';

  @IsString()
  @IsOptional()
  @Length(1, 100)
  emergencyContactName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(\+212|0)[5-7]\d{8}$/, {
    message: 'Invalid Moroccan phone number format'
  })
  emergencyContactPhone?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  discipline?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  ageCategory?: string;

  @IsArray()
  @IsOptional()
  positions?: string[];

  @IsInt()
  @IsOptional()
  jerseyNumber?: number;

  @IsEnum(['adherent', 'club_player'])
  @IsOptional()
  memberStatus?: 'adherent' | 'club_player';

  @IsUUID()
  @IsOptional()
  assignedClubId?: string;

  @IsUUID()
  @IsOptional()
  teamId?: string;

  @IsDateString()
  @IsOptional()
  assignmentStartDate?: string;

  @IsDateString()
  @IsOptional()
  assignmentEndDate?: string;

  @IsString()
  @IsOptional()
  subscriptionType?: string;

  @IsString()
  @IsOptional()
  seasonId?: string;

  @IsInt()
  @IsOptional()
  subscriptionAmount?: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsEnum(['pending', 'paid', 'overdue'])
  @IsOptional()
  paymentStatus?: 'pending' | 'paid' | 'overdue';

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsString()
  @IsOptional()
  paymentReference?: string;

  @IsString()
  @IsOptional()
  medicalStatus?: string;

  @IsDateString()
  @IsOptional()
  lastMedicalVisitDate?: string;

  @IsString()
  @IsOptional()
  federationDoctor?: string;

  @IsString()
  @IsOptional()
  medicalFitness?: string;

  @IsDateString()
  @IsOptional()
  fitnessExpirationDate?: string;

  @IsUUID()
  @IsOptional()
  medicalCertificateId?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  licenseSeason?: string;

  @IsString()
  @IsOptional()
  licenseType?: string;

  @IsEnum(['draft', 'pending_payment', 'pending_approval', 'active', 'archived'])
  @IsOptional()
  licenseStatus?: 'draft' | 'pending_payment' | 'pending_approval' | 'active' | 'archived';

  @IsDateString()
  @IsOptional()
  licenseIssueDate?: string;

  @IsDateString()
  @IsOptional()
  licenseExpirationDate?: string;

  @IsEnum(['active', 'inactive', 'suspended', 'archived'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'suspended' | 'archived';

  @IsDateString()
  @IsOptional()
  registrationDate?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;
}

export class MemberFilterDto {
  @IsOptional()
  memberStatus?: string;

  @IsOptional()
  licenseStatus?: 'draft' | 'pending_payment' | 'pending_approval' | 'active' | 'archived';

  @IsUUID()
  @IsOptional()
  assignedClubId?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
