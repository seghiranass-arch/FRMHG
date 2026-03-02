import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('admin', 'superadmin', 'federation_admin') 
  create(@Body() createEventDto: CreateEventDto, @Request() req: any) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @Get()
  findAll(@Request() req: any) {
    // If no roles on user object, default to empty array
    const roles = req.user.roles || [];
    return this.eventsService.findAll(roles, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'superadmin', 'federation_admin')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @Roles('admin', 'superadmin', 'federation_admin')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
