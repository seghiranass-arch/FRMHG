import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Controller('documents')
export class UploadController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = join(process.cwd(), 'uploads');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          callback(null, uploadPath);
        },
        filename: (req: any, file: any, callback: any) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        }
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, callback) => {
        const isAllowed = file.originalname.match(/\.(jpg|jpeg|png|gif|webp|avif|pdf|doc|docx)$/i);
        if (!isAllowed) {
          (req as any).fileValidationError = 'Only image/pdf/doc files are allowed!';
          return callback(null, false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: Request,
  ) {
    console.log('Received upload request');
    console.log('File:', file);
    console.log('Body:', body);
    
    const validationError = (req as any).fileValidationError;
    if (validationError) {
      throw new BadRequestException(validationError);
    }
    
    if (!file) {
      console.log('No file uploaded');
      throw new BadRequestException('No file uploaded');
    }
    
    console.log('Creating document record');
    // Create document record in database
    const documentType = body.type || body.documentType || this.getDocumentType(file.mimetype);
    const document = await this.documentsService.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      type: documentType,
      description: body.description || file.originalname,
      orgId: body.orgId || null,
      memberId: body.memberId || null,
    });
    
    console.log('Document created:', document);
    
    return {
      id: document.id,
      filename: document.filename,
      originalName: document.originalName,
      mimeType: document.mimeType,
      size: document.size,
      type: document.type,
      description: document.description,
      createdAt: document.createdAt,
    };
  }



  private getDocumentType(mimeType: string): any {
    if (mimeType.startsWith('image/')) {
      return 'photo'; // or we could create a specific 'logo' type
    } else if (mimeType === 'application/pdf') {
      return 'contract'; // or we could create a specific 'document' type
    } else if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return 'contract';
    }
    return 'other';
  }
}
