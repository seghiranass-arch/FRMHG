import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto, UpdateMemberDto, MemberFilterDto } from './dto/member.dto';
import { AddMemberPaymentDto, CreateMemberSubscriptionDto, RenewMemberSubscriptionDto } from './dto/member-subscription.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: MemberFilterDto) {
    const where: any = {};

    if (filters?.memberStatus) {
      where.memberStatus = filters.memberStatus;
    }

    if (filters?.licenseStatus) {
      where.licenseStatus = filters.licenseStatus;
    }

    if (filters?.assignedClubId) {
      where.assignedClubId = filters.assignedClubId;
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { licenseNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const members = await this.prisma.member.findMany({
      where,
      include: {
        org: {
          select: {
            id: true,
            name: true,
            acronym: true,
          },
        },
        documents: {
          select: {
            id: true,
            type: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { lastName: 'asc' },
    });
    return members.map(member => {
      const photoId = member.documents?.find(doc => doc.type === 'photo')?.id || null;
      const teamId = member.teamId || null;
      return {
        ...member,
        teamId,
        team_id: teamId,
        profilePhotoId: photoId,
        profile_photo_id: photoId,
      };
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        org: true,
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    const photoId = member.documents?.find(doc => doc.type === 'photo')?.id || null;
    const teamId = member.teamId || null;
    return {
      ...member,
      teamId,
      team_id: teamId,
      profilePhotoId: photoId,
      profile_photo_id: photoId,
    };
  }

  async findByOrg(orgId: string, filters?: MemberFilterDto) {
    const where: any = { assignedClubId: orgId };

    if (filters?.memberStatus) {
      where.memberStatus = filters.memberStatus;
    }

    if (filters?.licenseStatus) {
      where.licenseStatus = filters.licenseStatus;
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { licenseNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const members = await this.prisma.member.findMany({
      where,
      include: {
        documents: {
          select: {
            id: true,
            type: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { lastName: 'asc' },
    });
    return members.map(member => {
      const photoId = member.documents?.find(doc => doc.type === 'photo')?.id || null;
      const teamId = member.teamId || null;
      return {
        ...member,
        teamId,
        team_id: teamId,
        profilePhotoId: photoId,
        profile_photo_id: photoId,
      };
    });
  }

  async create(dto: CreateMemberDto) {
    // Verify org exists if provided
    if (dto.assignedClubId) {
      const org = await this.prisma.org.findUnique({
        where: { id: dto.assignedClubId },
      });

      if (!org) {
        throw new NotFoundException(`Organization with ID ${dto.assignedClubId} not found`);
      }
    }

    // Generate license number if not provided
    const licenseNumber = dto.licenseNumber || await this.generateLicenseNumber();
    
    // Set default registration date if not provided
    const registrationDate = dto.registrationDate ? new Date(dto.registrationDate) : new Date();
    
    // Convert positions array to JSON string for storage
    const positionsJson = dto.positions ? JSON.stringify(dto.positions) : null;

    return this.prisma.member.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        sex: dto.sex,
        dateOfBirth: new Date(dto.dateOfBirth),
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        region: dto.region,
        nationality: dto.nationality,
        idNumber: dto.idNumber,
        idType: dto.idType,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        discipline: dto.discipline,
        ageCategory: dto.ageCategory,
        positions: dto.positions || [],
        jerseyNumber: dto.jerseyNumber,
        memberStatus: dto.memberStatus,
        assignedClubId: dto.assignedClubId,
        assignmentStartDate: dto.assignmentStartDate ? new Date(dto.assignmentStartDate) : undefined,
        assignmentEndDate: dto.assignmentEndDate ? new Date(dto.assignmentEndDate) : undefined,
        subscriptionType: dto.subscriptionType,
        seasonId: dto.seasonId,
        subscriptionAmount: dto.subscriptionAmount,
        paymentMethod: dto.paymentMethod,
        paymentStatus: dto.paymentStatus,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
        paymentReference: dto.paymentReference,
        medicalStatus: dto.medicalStatus,
        lastMedicalVisitDate: dto.lastMedicalVisitDate ? new Date(dto.lastMedicalVisitDate) : undefined,
        federationDoctor: dto.federationDoctor,
        medicalFitness: dto.medicalFitness,
        fitnessExpirationDate: dto.fitnessExpirationDate ? new Date(dto.fitnessExpirationDate) : undefined,
        medicalCertificateId: dto.medicalCertificateId,
        licenseNumber,
        licenseSeason: dto.licenseSeason,
        licenseType: dto.licenseType,
        licenseStatus: this.mapLicenseStatus(dto.licenseStatus || 'pending_approval'),
        licenseIssueDate: dto.licenseIssueDate ? new Date(dto.licenseIssueDate) : undefined,
        licenseExpirationDate: dto.licenseExpirationDate ? new Date(dto.licenseExpirationDate) : undefined,
        status: dto.status || 'active',
        registrationDate,
        orgId: dto.assignedClubId,
        userId: dto.userId,
      },
      include: {
        org: {
          select: {
            id: true,
            name: true,
            acronym: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateMemberDto) {
    // Verify member exists
    await this.findOne(id);

    // If assignedClubId is being changed, verify new org exists
    if (dto.assignedClubId) {
      const org = await this.prisma.org.findUnique({
        where: { id: dto.assignedClubId },
      });

      if (!org) {
        throw new NotFoundException(`Organization with ID ${dto.assignedClubId} not found`);
      }
    }

    const updateData: any = { ...dto };
    if (dto.dateOfBirth) {
      updateData.dateOfBirth = new Date(dto.dateOfBirth);
    }
    
    // Map license status if provided
    if (dto.licenseStatus) {
      updateData.licenseStatus = this.mapLicenseStatus(dto.licenseStatus);
    }

    // Handle date conversions
    const dateFields = [
      'assignmentStartDate',
      'assignmentEndDate', 
      'paymentDate',
      'lastMedicalVisitDate',
      'fitnessExpirationDate',
      'licenseIssueDate',
      'licenseExpirationDate',
      'registrationDate'
    ];
    
    dateFields.forEach(field => {
      if (dto[field as keyof UpdateMemberDto]) {
        updateData[field] = new Date(dto[field as keyof UpdateMemberDto] as string);
      }
    });

    // Set orgId to assignedClubId for consistency
    if (dto.assignedClubId) {
      updateData.orgId = dto.assignedClubId;
    }

    return this.prisma.member.update({
      where: { id },
      data: updateData,
      include: {
        org: {
          select: {
            id: true,
            name: true,
            acronym: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    // Verify member exists
    await this.findOne(id);

    return this.prisma.member.delete({
      where: { id },
    });
  }

  async getStats() {
    const totalMembers = await this.prisma.member.count();
    
    const recentMembers = await this.prisma.member.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Simple counts by status
    const adherentsCount = await this.prisma.member.count({
      where: { memberStatus: 'adherent' }
    });
    
    const clubPlayersCount = await this.prisma.member.count({
      where: { memberStatus: 'club_player' }
    });
    
    const activeLicensesCount = await this.prisma.member.count({
      where: { licenseStatus: 'active' }
    });
    
    const pendingLicensesCount = await this.prisma.member.count({
      where: { licenseStatus: 'pending' }
    });

    return {
      total: totalMembers,
      byCategory: {
        adherent: adherentsCount,
        club_player: clubPlayersCount
      },
      byLicenseStatus: {
        active: activeLicensesCount,
        pending: pendingLicensesCount
      },
      newThisMonth: recentMembers,
    };
  }

  async renewLicense(id: string, expiryDate: string) {
    await this.findOne(id);

    return this.prisma.member.update({
      where: { id },
      data: {
        licenseStatus: 'pending',
        licenseExpirationDate: null,
      },
    });
  }

  private async generateLicenseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.member.count({
      where: {
        licenseNumber: {
          startsWith: `LIC-${year}`,
        },
      },
    });
    return `LIC-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  private mapLicenseStatus(status: string): any {
    const statusMap: Record<string, any> = {
      'draft': 'draft',
      'pending_payment': 'pending',
      'pending_approval': 'pending',
      'active': 'active',
      'archived': 'expired'
    };
    
    return statusMap[status] || 'draft';
  }

  async getLicensingList() {
    return this.prisma.member.findMany({
      where: {
        licenseStatus: {
          in: ['draft', 'pending', 'active'],
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        licenseNumber: true,
        licenseStatus: true,
        licenseType: true,
        licenseSeason: true,
        seasonId: true,
        licenseIssueDate: true,
        memberStatus: true,
        ageCategory: true,
        licenseExpirationDate: true,
        createdAt: true,
        org: {
          select: {
            id: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        documents: {
          where: {
            type: 'photo',
          },
          take: 1,
          orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: [
        { licenseStatus: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async approveLicense(id: string) {
    await this.findOne(id);
    
    return this.prisma.member.update({
      where: { id },
      data: {
        licenseStatus: 'active',
        licenseExpirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    });
  }

  async rejectLicense(id: string) {
    await this.findOne(id);
    
    return this.prisma.member.update({
      where: { id },
      data: {
        licenseStatus: 'rejected',
      },
    });
  }

  async renewMemberLicense(id: string) {
    await this.findOne(id);
    
    return this.prisma.member.update({
      where: { id },
      data: {
        licenseStatus: 'pending',
        licenseExpirationDate: null,
      },
    });
  }

  async verifyMemberSubscription(subscriptionId: string) {
    const subscription = await this.prisma.memberSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        subscription: true,
        member: true,
      },
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    const now = new Date();
    let current = subscription;
    if (subscription.status === 'active' && subscription.endDate < now) {
      current = await this.prisma.memberSubscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' },
        include: {
          subscription: true,
          member: true,
        },
      });
    }

    const isValid = current.status === 'active' && current.endDate >= now;
    return {
      subscriptionId: current.id,
      status: current.status,
      isValid,
      startDate: current.startDate,
      endDate: current.endDate,
      seasonId: current.seasonId,
      subscriptionName: current.subscription?.name,
      memberName: `${current.member.lastName} ${current.member.firstName}`.trim(),
      memberNumber: current.member.licenseNumber,
      checkedAt: now,
    };
  }

  async getMemberSubscriptions(id: string) {
    const member = await this.findOne(id);
    if (member.memberStatus !== 'adherent') {
      return [];
    }
    const subscriptions = await this.prisma.memberSubscription.findMany({
      where: { memberId: member.id },
      include: {
        subscription: true,
        payments: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const updates = subscriptions
      .filter((s) => s.status === 'active' && s.endDate < now)
      .map((s) =>
        this.prisma.memberSubscription.update({
          where: { id: s.id },
          data: { status: 'expired' },
        }),
      );
    if (updates.length) {
      await Promise.all(updates);
      return this.prisma.memberSubscription.findMany({
        where: { memberId: member.id },
        include: {
          subscription: true,
          payments: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return subscriptions;
  }

  async getSchoolPayments() {
    const subscriptions = await this.prisma.memberSubscription.findMany({
      where: {
        member: {
          memberStatus: 'adherent',
        },
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            licenseNumber: true,
            org: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        subscription: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return subscriptions.map((subscription) => ({
      id: subscription.id,
      memberId: subscription.memberId,
      memberName: `${subscription.member.lastName} ${subscription.member.firstName}`.trim(),
      licenseNumber: subscription.member.licenseNumber,
      seasonId: subscription.seasonId,
      amountCents: subscription.amountCents,
      currency: subscription.currency,
      subscriptionStatus: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      subscriptionName: subscription.subscription?.name ?? null,
      orgName: subscription.member.org?.name ?? null,
      payments: subscription.payments.map((payment) => ({
        id: payment.id,
        amountCents: payment.amountCents,
        currency: payment.currency,
        status: payment.status,
        paidAt: payment.paidAt,
        method: payment.method,
        reference: payment.reference,
        createdAt: payment.createdAt,
      })),
    }));
  }

  async createMemberSubscription(id: string, dto: CreateMemberSubscriptionDto) {
    const member = await this.ensureAdherentMember(id);
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const subscription = dto.subscriptionId
      ? await this.prisma.subscription.findUnique({ where: { id: dto.subscriptionId } })
      : null;
    const durationMonths = subscription?.durationMonths ?? 12;
    const endDate = this.addMonths(startDate, durationMonths);
    const amountCents = dto.amountCents ?? subscription?.amountCents ?? 0;

    const created = await this.prisma.memberSubscription.create({
      data: {
        memberId: member.id,
        subscriptionId: dto.subscriptionId,
        seasonId: dto.seasonId ?? member.seasonId ?? undefined,
        amountCents,
        currency: subscription?.currency ?? 'MAD',
        status: 'active',
        startDate,
        endDate,
      },
      include: {
        subscription: true,
        payments: true,
      },
    });

    await this.prisma.member.update({
      where: { id: member.id },
      data: {
        subscriptionType: dto.subscriptionId ?? member.subscriptionType,
        seasonId: dto.seasonId ?? member.seasonId,
        subscriptionAmount: Math.round(amountCents / 100),
        licenseStatus: this.mapLicenseStatus('pending_approval'),
        licenseExpirationDate: null,
      },
    });

    return created;
  }

  async renewMemberSubscription(id: string, subscriptionId: string, dto: RenewMemberSubscriptionDto) {
    const member = await this.ensureAdherentMember(id);
    const existing = await this.prisma.memberSubscription.findFirst({
      where: { id: subscriptionId, memberId: member.id },
      include: { subscription: true },
    });
    if (!existing) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    await this.prisma.memberSubscription.update({
      where: { id: existing.id },
      data: { status: 'expired' },
    });

    const subscription = dto.subscriptionId
      ? await this.prisma.subscription.findUnique({ where: { id: dto.subscriptionId } })
      : existing.subscription;
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const durationMonths = subscription?.durationMonths ?? 12;
    const endDate = this.addMonths(startDate, durationMonths);
    const amountCents = dto.amountCents ?? existing.amountCents;

    const created = await this.prisma.memberSubscription.create({
      data: {
        memberId: member.id,
        subscriptionId: subscription?.id ?? existing.subscriptionId,
        seasonId: dto.seasonId ?? existing.seasonId,
        amountCents,
        currency: subscription?.currency ?? existing.currency,
        status: 'active',
        startDate,
        endDate,
      },
      include: {
        subscription: true,
        payments: true,
      },
    });

    await this.prisma.member.update({
      where: { id: member.id },
      data: {
        subscriptionType: created.subscriptionId ?? member.subscriptionType,
        seasonId: created.seasonId ?? member.seasonId,
        subscriptionAmount: Math.round(amountCents / 100),
        licenseStatus: this.mapLicenseStatus('pending_approval'),
        licenseExpirationDate: null,
      },
    });

    return created;
  }

  async cancelMemberSubscription(id: string, subscriptionId: string) {
    const member = await this.ensureAdherentMember(id);
    const existing = await this.prisma.memberSubscription.findFirst({
      where: { id: subscriptionId, memberId: member.id },
    });
    if (!existing) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }
    return this.prisma.memberSubscription.update({
      where: { id: existing.id },
      data: { status: 'canceled' },
    });
  }

  async deleteMemberSubscription(id: string, subscriptionId: string) {
    const member = await this.ensureAdherentMember(id);
    const existing = await this.prisma.memberSubscription.findFirst({
      where: { id: subscriptionId, memberId: member.id },
    });
    if (!existing) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }
    await this.prisma.memberPayment.deleteMany({
      where: { memberSubscriptionId: existing.id },
    });
    return this.prisma.memberSubscription.delete({
      where: { id: existing.id },
    });
  }

  async addMemberPayment(id: string, subscriptionId: string, dto: AddMemberPaymentDto) {
    const member = await this.ensureAdherentMember(id);
    const subscription = await this.prisma.memberSubscription.findFirst({
      where: { id: subscriptionId, memberId: member.id },
      include: { subscription: true },
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    const payment = await this.prisma.memberPayment.create({
      data: {
        memberSubscriptionId: subscription.id,
        amountCents: dto.amountCents,
        currency: subscription.currency,
        method: dto.method,
        status: dto.status ?? 'paid',
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
        reference: dto.reference,
      },
    });

    if ((dto.status ?? 'paid') === 'paid') {
      await this.prisma.member.update({
        where: { id: member.id },
        data: {
          paymentStatus: 'paid',
          paymentDate: payment.paidAt ?? new Date(),
          paymentMethod: dto.method,
          paymentReference: dto.reference,
          subscriptionAmount: Math.round(dto.amountCents / 100),
        },
      });
    }

    return payment;
  }

  private addMonths(date: Date, months: number) {
    const result = new Date(date);
    const day = result.getDate();
    result.setMonth(result.getMonth() + months);
    if (result.getDate() < day) {
      result.setDate(0);
    }
    return result;
  }

  private async ensureAdherentMember(id: string) {
    const member = await this.findOne(id);
    if (member.memberStatus !== 'adherent') {
      throw new NotFoundException(`Member with ID ${id} is not an adherent`);
    }
    return member;
  }
}
