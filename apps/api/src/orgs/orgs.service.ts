import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrgDto, UpdateOrgDto } from './dto/org.dto';

@Injectable()
export class OrgsService {
  constructor(private prisma: PrismaService) {}

  private buildAutoTeams(orgId: string) {
    const categories = ['U7', 'U9', 'U11', 'U13', 'U15', 'U17', 'U20', 'Seniors'];
    const genders = [
      { value: 'male', label: 'Masculine' },
      { value: 'female', label: 'Féminine' },
    ];
    return categories.flatMap((category) =>
      genders.map((gender) => ({
        name: `${category} ${gender.label}`,
        category,
        gender: gender.value,
        description: null,
        orgId,
      })),
    );
  }

  private normalizeOrgData(dto: CreateOrgDto | UpdateOrgDto) {
    const data: any = { ...dto };

    if (dto.establishmentDate) {
      data.establishmentDate = new Date(dto.establishmentDate);
    }

    if (dto.fullAddress && !dto.address) {
      data.address = dto.fullAddress;
    }

    if (dto.address && !dto.fullAddress) {
      data.fullAddress = dto.address;
    }

    return data;
  }

  async findAll() {
    return this.prisma.org.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.org.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!org) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return org;
  }

  async create(dto: CreateOrgDto) {
    const data = this.normalizeOrgData(dto);
    return this.prisma.$transaction(async (tx) => {
      const org = await tx.org.create({ data });
      if (org.type === 'club') {
        const teams = this.buildAutoTeams(org.id);
        if (teams.length > 0) {
          await tx.team.createMany({ data: teams });
        }
      }
      return org;
    });
  }

  async update(id: string, dto: UpdateOrgDto) {
    await this.findOne(id); // Check exists
    return this.prisma.org.update({
      where: { id },
      data: this.normalizeOrgData(dto),
    });
  }

  async delete(id: string) {
    await this.findOne(id); // Check exists
    return this.prisma.org.update({
      where: { id },
      data: {
        archived: true,
        status: 'archived',
      },
    });
  }

  async activate(id: string) {
    await this.findOne(id); // Check exists
    return this.prisma.org.update({
      where: { id },
      data: { status: 'active', suspensionReason: null },
    });
  }

  async suspend(id: string, reason?: string) {
    await this.findOne(id); // Check exists
    return this.prisma.org.update({
      where: { id },
      data: { 
        status: 'suspended', 
        suspensionReason: reason || null 
      },
    });
  }

  async unsuspend(id: string) {
    await this.findOne(id); // Check exists
    return this.prisma.org.update({
      where: { id },
      data: { 
        status: 'active', 
        suspensionReason: null 
      },
    });
  }

  async getMembers(id: string) {
    await this.findOne(id); // Check exists
    const members = await this.prisma.member.findMany({
      where: {
        OR: [
          { orgId: id },
          { assignedClubId: id },
        ],
      },
      include: {
        documents: {
          select: {
            id: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return members.map(member => {
      const photoId = member.documents?.find(doc => doc.type === 'photo')?.id || null;
      return {
        ...member,
        profilePhotoId: photoId,
        profile_photo_id: photoId,
      };
    });
  }

  async getDocuments(id: string) {
    await this.findOne(id); // Check exists
    return this.prisma.document.findMany({
      where: { orgId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const [
      totalClubs,
      activeClubs,
      pendingClubs,
      suspendedClubs,
      totalMembers,
      activeMembers,
      pendingMembers,
    ] = await Promise.all([
      this.prisma.org.count(),
      this.prisma.org.count({ where: { status: 'active' } }),
      this.prisma.org.count({ where: { status: 'pending' } }),
      this.prisma.org.count({ where: { status: 'suspended' } }),
      this.prisma.member.count(),
      this.prisma.member.count({ where: { licenseStatus: 'active' } }),
      this.prisma.member.count({ where: { licenseStatus: 'pending' } }),
    ]);

    // Clubs by region
    const clubsByRegion = await this.prisma.org.groupBy({
      by: ['region'],
      _count: { id: true },
      where: { region: { not: null } },
    });

    return {
      clubs: {
        total_clubs: totalClubs.toString(),
        active_clubs: activeClubs.toString(),
        pending_clubs: pendingClubs.toString(),
        suspended_clubs: suspendedClubs.toString(),
        financially_approved: activeClubs.toString(),
        financially_pending: pendingClubs.toString(),
      },
      members: {
        total_members: totalMembers.toString(),
        active_licenses: activeMembers.toString(),
        pending_licenses: pendingMembers.toString(),
        draft_licenses: '0',
      },
      payments: {
        total_payments: '0',
        approved_payments: '0',
        pending_review_payments: '0',
        rejected_payments: '0',
        approved_amount_cents: '0',
        pending_amount_cents: '0',
      },
      clubsByRegion: clubsByRegion.map((r: any) => ({
        region: r.region || 'Unknown',
        count: r._count.id,
        active_count: r._count.id,
      })),
      recentActivity: [],
      seasonalTrends: [],
    };
  }
}
