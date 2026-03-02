import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OrgsService } from './orgs.service';
import { CreateOrgDto, UpdateOrgDto } from './dto/org.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orgs')
export class OrgsController {
  constructor(private orgsService: OrgsService) {}

  @Get()
  async findAll() {
    return this.orgsService.findAll();
  }

  @Get('stats')
  async getStats() {
    return this.orgsService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orgsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateOrgDto) {
    return this.orgsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOrgDto) {
    return this.orgsService.update(id, dto);
  }

  @Patch(':id')
  async partialUpdate(@Param('id') id: string, @Body() dto: UpdateOrgDto) {
    return this.orgsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.orgsService.delete(id);
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string) {
    return this.orgsService.activate(id);
  }

  @Post(':id/suspend')
  async suspend(
    @Param('id') id: string,
    @Body('reason') reason?: string
  ) {
    return this.orgsService.suspend(id, reason);
  }

  @Post(':id/unsuspend')
  async unsuspend(@Param('id') id: string) {
    return this.orgsService.unsuspend(id);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string) {
    return this.orgsService.getMembers(id);
  }

  @Get(':id/documents')
  async getDocuments(@Param('id') id: string) {
    return this.orgsService.getDocuments(id);
  }
}
