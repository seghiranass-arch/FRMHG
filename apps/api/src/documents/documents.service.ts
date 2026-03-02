import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId?: string, memberId?: string) {
    const where: any = {};

    if (orgId) {
      where.orgId = orgId;
    }

    if (memberId) {
      where.memberId = memberId;
    }

    return this.prisma.document.findMany({
      where,
      include: {
        org: {
          select: {
            id: true,
            name: true,
          },
        },
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        org: true,
        member: true,
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async findByOrg(orgId: string) {
    return this.prisma.document.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByMember(memberId: string) {
    return this.prisma.document.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateDocumentDto) {
    // Verify org exists if provided
    if (dto.orgId) {
      const org = await this.prisma.org.findUnique({
        where: { id: dto.orgId },
      });
      if (!org) {
        throw new NotFoundException(`Organization with ID ${dto.orgId} not found`);
      }
    }

    // Verify member exists if provided
    if (dto.memberId) {
      const member = await this.prisma.member.findUnique({
        where: { id: dto.memberId },
      });
      if (!member) {
        throw new NotFoundException(`Member with ID ${dto.memberId} not found`);
      }
    }

    return this.prisma.document.create({
      data: {
        filename: dto.filename,
        originalName: dto.originalName,
        mimeType: dto.mimeType,
        size: dto.size,
        type: dto.type,
        description: dto.description,
        orgId: dto.orgId,
        memberId: dto.memberId,
      },
    });
  }

  async update(id: string, dto: UpdateDocumentDto) {
    await this.findOne(id);

    return this.prisma.document.update({
      where: { id },
      data: {
        filename: dto.filename,
        type: dto.type,
        description: dto.description,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.document.delete({
      where: { id },
    });
  }
}
