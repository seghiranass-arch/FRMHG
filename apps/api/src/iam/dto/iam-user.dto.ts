import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateIamUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  displayName!: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  orgId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class UpdateIamUserDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  orgId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];
}

export class ResetPasswordDto {
  @IsOptional()
  @IsString()
  newPassword?: string;
}
