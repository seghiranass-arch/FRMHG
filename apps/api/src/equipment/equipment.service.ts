import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentItemDto, CreateEquipmentMovementDto } from './dto/equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  private buildMovementOrgFilter(orgId?: string | null) {
    if (!orgId) return undefined;
    return {
      OR: [
        { fromOrgId: orgId },
        { toOrgId: orgId },
        { toMember: { orgId } },
      ],
    };
  }

  async createItem(dto: CreateEquipmentItemDto) {
    return this.prisma.equipmentItem.create({
      data: {
        name: dto.name,
        reference: dto.reference || null,
        description: dto.description || null,
        quantity: dto.quantity,
        minQuantity: dto.min_quantity ?? 0,
        condition: dto.condition,
        location: dto.location,
        ownerOrgId: dto.owner_org_id || null,
        notes: dto.notes || null,
        photoDocumentId: dto.photo_document_id || null,
      },
    });
  }

  async findAllItems() {
    return this.prisma.equipmentItem.findMany({
      include: {
        ownerOrg: {
          select: {
            id: true,
            name: true,
            acronym: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMovement(dto: CreateEquipmentMovementDto, requestedBy: string) {
    const equipment = await this.prisma.equipmentItem.findUnique({
      where: { id: dto.equipment_id },
    });
    if (!equipment) {
      throw new BadRequestException('Équipement introuvable');
    }
    if (dto.quantity > equipment.quantity) {
      throw new BadRequestException('Quantité demandée supérieure au stock disponible');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const movement = await tx.equipmentMovement.create({
        data: {
          equipmentId: equipment.id,
          movementType: dto.movement_type,
          quantity: dto.quantity,
          reason: dto.reason,
          status: 'pending',
          fromOrgId: equipment.ownerOrgId,
          toOrgId: dto.to_org_id || null,
          toMemberId: dto.to_member_id || null,
          requestedBy,
        },
        include: {
          equipment: true,
          fromOrg: true,
          toOrg: true,
          toMember: true,
        },
      });
      await tx.equipmentMovementHistory.create({
        data: {
          movementId: movement.id,
          action: 'created',
          performedBy: requestedBy,
        },
      });
      return movement;
    });
  }

  async findAllMovements(orgId?: string | null) {
    return this.prisma.equipmentMovement.findMany({
      where: this.buildMovementOrgFilter(orgId),
      include: {
        equipment: true,
        fromOrg: true,
        toOrg: true,
        toMember: true,
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async completeMovement(id: string, performedBy: string) {
    const movement = await this.prisma.equipmentMovement.findUnique({
      where: { id },
    });
    if (!movement) {
      throw new BadRequestException('Déplacement introuvable');
    }
    if (movement.status === 'completed' || movement.status === 'cancelled') {
      throw new BadRequestException('Déplacement déjà terminé');
    }
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.equipmentMovement.update({
        where: { id },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
        include: {
          equipment: true,
          fromOrg: true,
          toOrg: true,
          toMember: true,
        },
      });
      await tx.equipmentMovementHistory.create({
        data: {
          movementId: updated.id,
          action: 'completed',
          performedBy,
        },
      });
      return updated;
    });
  }

  async findMovementHistory(orgId?: string | null) {
    const orgFilter = this.buildMovementOrgFilter(orgId);
    const history = await this.prisma.equipmentMovementHistory.findMany({
      where: {
        action: { in: ['completed', 'cancelled'] },
        movement: orgFilter,
      },
      include: {
        movement: {
          include: {
            equipment: true,
            fromOrg: true,
            toOrg: true,
            toMember: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (history.length > 0) {
      return history;
    }
    const fallbackMovements = await this.prisma.equipmentMovement.findMany({
      where: {
        status: { in: ['completed', 'cancelled'] },
        ...(orgFilter ?? {}),
      },
      include: {
        equipment: true,
        fromOrg: true,
        toOrg: true,
        toMember: true,
      },
      orderBy: { completedAt: 'desc' },
    });
    return fallbackMovements.map((movement: Prisma.EquipmentMovementGetPayload<{
      include: {
        equipment: true;
        fromOrg: true;
        toOrg: true;
        toMember: true;
      };
    }>) => ({
      id: movement.id,
      movementId: movement.id,
      action: movement.status === 'cancelled' ? 'cancelled' : 'completed',
      performedBy: movement.requestedBy,
      notes: null,
      createdAt: movement.completedAt ?? movement.requestedAt,
      movement,
    }));
  }
}
