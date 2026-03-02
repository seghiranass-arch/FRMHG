import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateIamUserDto, ResetPasswordDto, UpdateIamUserDto } from './dto/iam-user.dto';
import { IamService } from './iam.service';

@Controller('iam')
@UseGuards(JwtAuthGuard)
export class IamController {
  constructor(private readonly iamService: IamService) {}

  @Get('users')
  listUsers(@Query('includeInactive') includeInactive?: string) {
    const flag = includeInactive !== 'false';
    return this.iamService.listUsers(flag);
  }

  @Post('users')
  createUser(@Body() dto: CreateIamUserDto) {
    return this.iamService.createUser(dto);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateIamUserDto) {
    return this.iamService.updateUser(id, dto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string, @Query('hard') hard?: string) {
    const hardDelete = hard === 'true';
    return this.iamService.deleteUser(id, hardDelete);
  }

  @Post('users/:id/restore')
  restoreUser(@Param('id') id: string) {
    return this.iamService.restoreUser(id);
  }

  @Post('users/:id/reset-password')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.iamService.resetPassword(id, dto);
  }

  @Get('roles')
  listRoles() {
    return this.iamService.listRoles();
  }

  @Get('permissions')
  listPermissions() {
    return this.iamService.listPermissions();
  }
}
