import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto } from './team.dto';

@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  async findAll(@Query('orgId') orgId: string) {
    return this.teamsService.findAll(orgId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateTeamDto) {
    return this.teamsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.teamsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.teamsService.delete(id);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string) {
    return this.teamsService.getMembers(id);
  }

  @Post(':id/members/:memberId')
  async addMember(
    @Param('id') teamId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.teamsService.addMember(teamId, memberId);
  }
}