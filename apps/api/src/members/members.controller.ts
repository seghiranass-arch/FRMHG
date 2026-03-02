import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto, UpdateMemberDto, MemberFilterDto } from './dto/member.dto';
import { AddMemberPaymentDto, CreateMemberSubscriptionDto, RenewMemberSubscriptionDto } from './dto/member-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() filters: MemberFilterDto) {
    return this.membersService.findAll(filters);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    return this.membersService.getStats();
  }

  @Get('school-payments')
  @UseGuards(JwtAuthGuard)
  async getSchoolPayments() {
    return this.membersService.getSchoolPayments();
  }

  @Get(':id([0-9a-fA-F-]{36})')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateMemberDto) {
    return this.membersService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.membersService.update(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async partialUpdate(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.membersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.membersService.delete(id);
  }

  @Post(':id/renew-license')
  @UseGuards(JwtAuthGuard)
  async renewLicense(
    @Param('id') id: string,
    @Body('expiryDate') expiryDate: string,
  ) {
    return this.membersService.renewLicense(id, expiryDate);
  }

  @Get('licensing/list')
  @UseGuards(JwtAuthGuard)
  async getLicensingList() {
    return this.membersService.getLicensingList();
  }

  @Post(':id/license/approve')
  @UseGuards(JwtAuthGuard)
  async approveLicense(@Param('id') id: string) {
    return this.membersService.approveLicense(id);
  }

  @Post(':id/license/reject')
  @UseGuards(JwtAuthGuard)
  async rejectLicense(@Param('id') id: string) {
    return this.membersService.rejectLicense(id);
  }

  @Post(':id/license/renew')
  @UseGuards(JwtAuthGuard)
  async renewMemberLicense(@Param('id') id: string) {
    return this.membersService.renewMemberLicense(id);
  }

  @Get('subscriptions/:subscriptionId/verify')
  async verifyMemberSubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.membersService.verifyMemberSubscription(subscriptionId);
  }

  @Get(':id/subscriptions')
  @UseGuards(JwtAuthGuard)
  async getMemberSubscriptions(@Param('id') id: string) {
    return this.membersService.getMemberSubscriptions(id);
  }

  @Post(':id/subscriptions')
  @UseGuards(JwtAuthGuard)
  async createMemberSubscription(
    @Param('id') id: string,
    @Body() dto: CreateMemberSubscriptionDto,
  ) {
    return this.membersService.createMemberSubscription(id, dto);
  }

  @Post(':id/subscriptions/:subscriptionId/renew')
  @UseGuards(JwtAuthGuard)
  async renewMemberSubscription(
    @Param('id') id: string,
    @Param('subscriptionId') subscriptionId: string,
    @Body() dto: RenewMemberSubscriptionDto,
  ) {
    return this.membersService.renewMemberSubscription(id, subscriptionId, dto);
  }

  @Post(':id/subscriptions/:subscriptionId/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelMemberSubscription(
    @Param('id') id: string,
    @Param('subscriptionId') subscriptionId: string,
  ) {
    return this.membersService.cancelMemberSubscription(id, subscriptionId);
  }

  @Delete(':id/subscriptions/:subscriptionId')
  @UseGuards(JwtAuthGuard)
  async deleteMemberSubscription(
    @Param('id') id: string,
    @Param('subscriptionId') subscriptionId: string,
  ) {
    return this.membersService.deleteMemberSubscription(id, subscriptionId);
  }

  @Post(':id/subscriptions/:subscriptionId/payments')
  @UseGuards(JwtAuthGuard)
  async addMemberPayment(
    @Param('id') id: string,
    @Param('subscriptionId') subscriptionId: string,
    @Body() dto: AddMemberPaymentDto,
  ) {
    return this.membersService.addMemberPayment(id, subscriptionId, dto);
  }
}
