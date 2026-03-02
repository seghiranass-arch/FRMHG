import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIamUserDto, ResetPasswordDto, UpdateIamUserDto } from './dto/iam-user.dto';

const DEFAULT_ROLES = [
  'federation_admin',
  'club_admin',
  'dtn',
  'finance',
  'stock',
  'medecin',
  'arbitre',
];

const PERMISSIONS = [
  'iam.users.read',
  'iam.users.write',
  'iam.roles.read',
  'iam.roles.write',
  'iam.permissions.write',
  'orgs.read',
  'orgs.write',
  'members.read',
  'members.write',
  'licences.read',
  'licences.approve',
  'payments.read',
  'payments.approve',
  'equipment.read',
  'equipment.write',
  'medical.read',
  'medical.write',
  'sport.read',
  'sport.write',
  'settings.write',
  'audit.read',
];

const DISABLED_ROLE = 'disabled';

type IamUser = {
  id: string;
  email: string;
  displayName: string;
  orgId: string | null;
  orgName: string | null;
  isActive: boolean;
  roles: string[];
};

@Injectable()
export class IamService {
  constructor(private prisma: PrismaService) {}

  private toIamUser(user: any): IamUser {
    const roles = user.roles || [];
    const isActive = !roles.includes(DISABLED_ROLE);
    const orgId = user.orgId ?? user.members?.[0]?.orgId ?? null;
    const orgName = user.org?.name ?? null;
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      orgId,
      orgName,
      isActive,
      roles,
    };
  }

  async listUsers(includeInactive: boolean): Promise<IamUser[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        members: { select: { orgId: true }, take: 1 },
        org: { select: { name: true } },
      },
    });
    const mapped = users.map((u) => this.toIamUser(u));
    return includeInactive ? mapped : mapped.filter((u) => u.isActive);
  }

  async listRoles(): Promise<string[]> {
    const rows = await this.prisma.user.findMany({
      select: { roles: true },
    });
    const roleSet = new Set<string>(DEFAULT_ROLES);
    rows.forEach((row) => {
      (row.roles || []).forEach((role) => roleSet.add(role));
    });
    return Array.from(roleSet);
  }

  listPermissions(): string[] {
    return PERMISSIONS;
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let value = '';
    for (let i = 0; i < 12; i += 1) {
      value += chars[Math.floor(Math.random() * chars.length)];
    }
    return value;
  }

  async createUser(dto: CreateIamUserDto): Promise<IamUser> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Un utilisateur avec cet email existe déjà.');
    }
    const password = dto.password && dto.password.trim() ? dto.password : this.generatePassword();
    const hashed = await bcrypt.hash(password, 10);
    const roles = dto.roles && dto.roles.length > 0 ? Array.from(new Set(dto.roles)) : ['user'];
    if (roles.includes('club_admin') && !dto.orgId) {
      throw new BadRequestException('Un admin club doit être lié à un club.');
    }
    if (dto.orgId) {
      const org = await this.prisma.org.findUnique({ where: { id: dto.orgId } });
      if (!org) {
        throw new BadRequestException('Club introuvable.');
      }
    }
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        displayName: dto.displayName,
        password: hashed,
        roles,
        orgId: dto.orgId ?? null,
      },
      include: {
        members: { select: { orgId: true }, take: 1 },
        org: { select: { name: true } },
      },
    });
    return this.toIamUser(user);
  }

  async updateUser(id: string, dto: UpdateIamUserDto): Promise<IamUser> {
    const existing = await this.findUser(id);
    const nextRoles = dto.roles ? Array.from(new Set(dto.roles)) : existing.roles;
    const nextOrgId = dto.orgId !== undefined ? dto.orgId : existing.orgId;
    if (nextRoles.includes('club_admin') && !nextOrgId) {
      throw new BadRequestException('Un admin club doit être lié à un club.');
    }
    if (nextOrgId) {
      const org = await this.prisma.org.findUnique({ where: { id: nextOrgId } });
      if (!org) {
        throw new BadRequestException('Club introuvable.');
      }
    }
    const data: any = {};
    if (dto.displayName) data.displayName = dto.displayName;
    if (dto.roles) data.roles = nextRoles;
    if (dto.orgId !== undefined) data.orgId = dto.orgId;
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        members: { select: { orgId: true }, take: 1 },
        org: { select: { name: true } },
      },
    });
    return this.toIamUser(user);
  }

  async deleteUser(id: string, hardDelete: boolean): Promise<void> {
    await this.findUser(id);
    if (hardDelete) {
      await this.prisma.user.delete({ where: { id } });
      return;
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    const roles = user?.roles || [];
    const nextRoles = roles.includes(DISABLED_ROLE) ? roles : [...roles, DISABLED_ROLE];
    await this.prisma.user.update({
      where: { id },
      data: { roles: nextRoles },
    });
  }

  async restoreUser(id: string): Promise<IamUser> {
    await this.findUser(id);
    const user = await this.prisma.user.findUnique({ where: { id } });
    const roles = (user?.roles || []).filter((role) => role !== DISABLED_ROLE);
    const updated = await this.prisma.user.update({
      where: { id },
      data: { roles },
      include: {
        members: { select: { orgId: true }, take: 1 },
        org: { select: { name: true } },
      },
    });
    return this.toIamUser(updated);
  }

  async resetPassword(id: string, dto: ResetPasswordDto): Promise<{ password: string }> {
    await this.findUser(id);
    const password = dto.newPassword && dto.newPassword.trim() ? dto.newPassword : this.generatePassword();
    const hashed = await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashed },
    });
    return { password };
  }

  private async findUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur ${id} introuvable`);
    }
    return user;
  }
}
