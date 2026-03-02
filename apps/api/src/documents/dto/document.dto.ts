import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
} from 'class-validator';
import { DocumentType } from '.prisma/client';

export class CreateDocumentDto {
  @IsString()
  filename: string;

  @IsString()
  originalName: string;

  @IsString()
  mimeType: string;

  @IsInt()
  size: number;

  @IsOptional()
  type?: DocumentType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  orgId?: string;

  @IsUUID()
  @IsOptional()
  memberId?: string;
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  filename?: string;

  @IsOptional()
  type?: DocumentType;

  @IsString()
  @IsOptional()
  description?: string;
}
