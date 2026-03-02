import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';

class CreateDisciplineDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

class UpdateDisciplineDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('disciplines')
  async getDisciplines() {
    return this.settingsService.getDisciplines();
  }

  @Post('disciplines')
  @UseGuards(JwtAuthGuard)
  async createDiscipline(@Body() dto: CreateDisciplineDto) {
    return this.settingsService.createDiscipline(dto);
  }

  @Patch('disciplines/:id')
  @UseGuards(JwtAuthGuard)
  async updateDiscipline(@Param('id') id: string, @Body() dto: UpdateDisciplineDto) {
    return this.settingsService.updateDiscipline(id, dto);
  }

  @Delete('disciplines/:id')
  @UseGuards(JwtAuthGuard)
  async deleteDiscipline(@Param('id') id: string) {
    return this.settingsService.deleteDiscipline(id);
  }

  @Get('subscriptions')
  async getSubscriptionTypes() {
    return this.settingsService.getSubscriptionTypes();
  }

  @Post('subscriptions')
  @UseGuards(JwtAuthGuard)
  async createSubscriptionType(@Body() dto: CreateSubscriptionDto) {
    return this.settingsService.createSubscriptionType(dto);
  }

  @Patch('subscriptions/:id')
  @UseGuards(JwtAuthGuard)
  async updateSubscriptionType(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.settingsService.updateSubscriptionType(id, dto);
  }

  @Delete('subscriptions/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSubscriptionType(@Param('id') id: string) {
    return this.settingsService.deleteSubscriptionType(id);
  }

  @Get('categories')
  async getCategories() {
    return this.settingsService.getCategories();
  }
}
