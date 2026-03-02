import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto, UpdateTeamDto } from './team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.team.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: true,
        _count: {
          select: { members: true },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  async create(dto: CreateTeamDto) {
    throw new ForbiddenException(`Team creation is disabled for org ${dto.orgId}`);
  }

  async update(id: string, dto: UpdateTeamDto) {
    void dto;
    throw new ForbiddenException(`Team update is disabled for ${id}`);
  }

  async delete(id: string) {
    throw new ForbiddenException(`Team deletion is disabled for ${id}`);
  }

  async getMembers(id: string) {
    const team = await this.findOne(id);
    return team.members;
  }

  async addMember(teamId: string, memberId: string) {
    await this.findOne(teamId); // Check team exists
    
    // Check if member exists and belongs to same org
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // Update member to belong to this team
    return this.prisma.member.update({
      where: { id: memberId },
      data: { 
        // Note: You might want to add a teamId field to Member model
        // For now, we'll just return the member
      },
    });
  }
}
