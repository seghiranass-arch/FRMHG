import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async findAll(
    @Query('orgId') orgId?: string,
    @Query('memberId') memberId?: string,
  ) {
    return this.documentsService.findAll(orgId, memberId);
  }

  @Get('view')
  @Header('Cache-Control', 'no-store, must-revalidate')
  async viewDocument(
    @Query('id') id: string,
    @Res() res: Response
  ) {
    try {
      // First, get the document record to verify it exists
      const document = await this.documentsService.findOne(id);
      if (!document) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Document not found'
        });
      }

      // Construct file path
      const filePath = join(process.cwd(), 'uploads', document.filename);
      
      // Check if file exists
      if (!existsSync(filePath)) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'File not found on disk'
        });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
      
      // Stream the file
      const fileStream = createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error serving document:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error serving document'
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateDocumentDto) {
    return this.documentsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.documentsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.documentsService.delete(id);
  }
}
