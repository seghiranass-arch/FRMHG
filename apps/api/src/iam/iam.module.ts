import { Module } from '@nestjs/common';
import { IamController } from './iam.controller';
import { IamService } from './iam.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IamController],
  providers: [IamService],
})
export class IamModule {}
