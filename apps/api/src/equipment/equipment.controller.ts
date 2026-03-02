import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentItemDto, CreateEquipmentMovementDto } from './dto/equipment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post('items')
  @UseGuards(JwtAuthGuard)
  async createItem(@Body() dto: CreateEquipmentItemDto) {
    return this.equipmentService.createItem(dto);
  }

  @Get('items')
  @UseGuards(JwtAuthGuard)
  async listItems() {
    const items = await this.equipmentService.findAllItems();
    return items.map(item => ({
      id: item.id,
      name: item.name,
      reference: item.reference,
      description: item.description,
      quantity: item.quantity,
      min_quantity: item.minQuantity,
      condition: item.condition,
      location: item.location,
      owner_org_id: item.ownerOrgId,
      owner_org_name: item.ownerOrg?.name ?? null,
      photo_document_id: item.photoDocumentId,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    }));
  }

  @Post('movements')
  @UseGuards(JwtAuthGuard)
  async createMovement(
    @Body() dto: CreateEquipmentMovementDto,
    @CurrentUser() user: AuthUser
  ) {
    if (user.roles.includes('club_admin')) {
      throw new ForbiddenException('FORBIDDEN');
    }
    const movement = await this.equipmentService.createMovement(dto, user.displayName);
    const toMemberName = movement.toMember
      ? `${movement.toMember.lastName} ${movement.toMember.firstName}`.trim()
      : null;
    const fromOrgName = movement.fromOrg?.name ?? 'Fédération Royale';
    return {
      id: movement.id,
      equipment_id: movement.equipmentId,
      equipment_name: movement.equipment.name,
      equipment_reference: movement.equipment.reference,
      equipment_photo_document_id: movement.equipment.photoDocumentId,
      from_org_id: movement.fromOrgId,
      from_org_name: fromOrgName,
      to_org_id: movement.toOrgId,
      to_org_name: movement.toOrg?.name ?? toMemberName,
      movement_type: movement.movementType,
      quantity: movement.quantity,
      reason: movement.reason,
      status: movement.status,
      requested_by: movement.requestedBy,
      approved_by: movement.approvedBy,
      requested_at: movement.requestedAt,
      approved_at: movement.approvedAt,
      completed_at: movement.completedAt,
    };
  }

  @Get('movements')
  @UseGuards(JwtAuthGuard)
  async listMovements(@CurrentUser() user: AuthUser) {
    if (user.roles.includes('club_admin') && !user.orgId) {
      return [];
    }
    const orgId = user.roles.includes('club_admin') ? user.orgId : undefined;
    const movements = await this.equipmentService.findAllMovements(orgId);
    return movements.map(movement => {
      const toMemberName = movement.toMember
        ? `${movement.toMember.lastName} ${movement.toMember.firstName}`.trim()
        : null;
      const fromOrgName = movement.fromOrg?.name ?? 'Fédération Royale';
      return {
        id: movement.id,
        equipment_id: movement.equipmentId,
        equipment_name: movement.equipment.name,
        equipment_reference: movement.equipment.reference,
        equipment_photo_document_id: movement.equipment.photoDocumentId,
        from_org_id: movement.fromOrgId,
        from_org_name: fromOrgName,
        to_org_id: movement.toOrgId,
        to_org_name: movement.toOrg?.name ?? toMemberName,
        movement_type: movement.movementType,
        quantity: movement.quantity,
        reason: movement.reason,
        status: movement.status,
        requested_by: movement.requestedBy,
        approved_by: movement.approvedBy,
        requested_at: movement.requestedAt,
        approved_at: movement.approvedAt,
        completed_at: movement.completedAt,
      };
    });
  }

  @Patch('movements/:id/complete')
  @UseGuards(JwtAuthGuard)
  async completeMovement(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    if (user.roles.includes('club_admin')) {
      throw new ForbiddenException('FORBIDDEN');
    }
    const movement = await this.equipmentService.completeMovement(id, user.displayName);
    const toMemberName = movement.toMember
      ? `${movement.toMember.lastName} ${movement.toMember.firstName}`.trim()
      : null;
    const fromOrgName = movement.fromOrg?.name ?? 'Fédération Royale';
    return {
      id: movement.id,
      equipment_id: movement.equipmentId,
      equipment_name: movement.equipment.name,
      equipment_reference: movement.equipment.reference,
      equipment_photo_document_id: movement.equipment.photoDocumentId,
      from_org_id: movement.fromOrgId,
      from_org_name: fromOrgName,
      to_org_id: movement.toOrgId,
      to_org_name: movement.toOrg?.name ?? toMemberName,
      movement_type: movement.movementType,
      quantity: movement.quantity,
      reason: movement.reason,
      status: movement.status,
      requested_by: movement.requestedBy,
      approved_by: movement.approvedBy,
      requested_at: movement.requestedAt,
      approved_at: movement.approvedAt,
      completed_at: movement.completedAt,
    };
  }

  @Get('movements/history')
  @UseGuards(JwtAuthGuard)
  async listMovementHistory(@CurrentUser() user: AuthUser) {
    if (user.roles.includes('club_admin') && !user.orgId) {
      return [];
    }
    const orgId = user.roles.includes('club_admin') ? user.orgId : undefined;
    const history = await this.equipmentService.findMovementHistory(orgId);
    return history.map(entry => ({
      id: entry.id,
      movement_id: entry.movementId,
      action: entry.action,
      performed_by: entry.performedBy,
      notes: entry.notes,
      created_at: entry.createdAt,
      movement_status: entry.movement.status,
      equipment_id: entry.movement.equipmentId,
      equipment_name: entry.movement.equipment.name,
      equipment_reference: entry.movement.equipment.reference,
      equipment_photo_document_id: entry.movement.equipment.photoDocumentId,
      from_org_id: entry.movement.fromOrgId,
      from_org_name: entry.movement.fromOrg?.name ?? 'Fédération Royale',
      to_org_id: entry.movement.toOrgId,
      to_org_name: entry.movement.toOrg?.name ?? (
        entry.movement.toMember ? `${entry.movement.toMember.lastName} ${entry.movement.toMember.firstName}`.trim() : null
      ),
      movement_type: entry.movement.movementType,
      quantity: entry.movement.quantity,
      reason: entry.movement.reason,
      requested_by: entry.movement.requestedBy,
      requested_at: entry.movement.requestedAt,
      completed_at: entry.movement.completedAt,
    }));
  }
}
