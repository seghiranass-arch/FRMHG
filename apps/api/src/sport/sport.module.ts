import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PublicSportController } from './public-sport.controller';
import { SportController } from './sport.controller';
import { SportService } from './sport.service';

@Module({
  imports: [AuthModule],
  controllers: [SportController, PublicSportController],
  providers: [SportService],
})
export class SportModule {}
