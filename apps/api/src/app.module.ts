import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrgsModule } from './orgs/orgs.module';
import { MembersModule } from './members/members.module';
import { DocumentsModule } from './documents/documents.module';
import { TeamsModule } from './teams/teams.module';
import { SettingsModule } from './settings/settings.module';
import { LicensingModule } from './licensing/licensing.module';
import { EquipmentModule } from './equipment/equipment.module';
import { SportModule } from './sport/sport.module';
import { IamModule } from './iam/iam.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    OrgsModule,
    MembersModule,
    DocumentsModule,
    TeamsModule,
    SettingsModule,
    LicensingModule,
    EquipmentModule,
    SportModule,
    IamModule,
    EventsModule,
  ],
})
export class AppModule {}
