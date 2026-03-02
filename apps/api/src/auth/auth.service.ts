import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  orgId?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch {
      if (user.password === password) {
        const hashed = await bcrypt.hash(password, 10);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { password: hashed },
        });
        isPasswordValid = true;
      }
    }
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
    };
  }

  async login(dto: LoginDto): Promise<{ user: AuthUser; token: string }> {
    const user = await this.validateUser(dto.email, dto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const token = this.jwtService.sign(payload);

    return { user, token };
  }

  async getUserFromToken(payload: JwtPayload): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        members: { select: { orgId: true }, take: 1 },
      },
    });

    if (!user) {
      return null;
    }

    let orgId = user.orgId ?? user.members?.[0]?.orgId ?? null;
    if (!orgId) {
      const linkedMember = await this.prisma.member.findFirst({
        where: {
          OR: [
            { userId: user.id },
            { email: user.email },
          ],
        },
        select: {
          orgId: true,
          assignedClubId: true,
        },
      });
      orgId = linkedMember?.orgId ?? linkedMember?.assignedClubId ?? null;
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
      orgId,
    };
  }
}
