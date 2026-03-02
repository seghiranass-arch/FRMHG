import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { UploadController } from './upload.controller';
import { DocumentsService } from './documents.service';

@Module({
  controllers: [DocumentsController, UploadController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
