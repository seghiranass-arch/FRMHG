import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';
import { LicensingService } from './licensing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class CreateSeasonDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class UpdateSeasonDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Controller('licensing')
export class LicensingController {
  constructor(private readonly licensingService: LicensingService) {}

  @Get('seasons')
  async getSeasons() {
    return this.licensingService.getSeasons();
  }

  @Post('seasons')
  @UseGuards(JwtAuthGuard)
  async createSeason(@Body() dto: CreateSeasonDto) {
    return this.licensingService.createSeason(dto);
  }

  @Patch('seasons/:id')
  @UseGuards(JwtAuthGuard)
  async updateSeason(@Param('id') id: string, @Body() dto: UpdateSeasonDto) {
    return this.licensingService.updateSeason(id, dto);
  }

  @Delete('seasons/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSeason(@Param('id') id: string) {
    return this.licensingService.deleteSeason(id);
  }
}
