import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';

type Discipline = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  private disciplines: Discipline[] = [];

  private ensureDisciplines() {
    if (this.disciplines.length > 0) return;
    const now = new Date().toISOString();
    this.disciplines = [
      { id: 'hockey_sur_glace', name: 'Hockey sur glace', code: 'HSG', description: null, is_active: true, createdAt: now, updatedAt: now },
      { id: 'hockey_sur_gazon', name: 'Hockey sur gazon', code: 'HSGZ', description: null, is_active: true, createdAt: now, updatedAt: now },
      { id: 'hockey_en_salle', name: 'Hockey en salle', code: 'HSS', description: null, is_active: true, createdAt: now, updatedAt: now },
      { id: 'hockey_subaquatique', name: 'Hockey subaquatique', code: 'HSQ', description: null, is_active: true, createdAt: now, updatedAt: now },
    ];
  }

  getDisciplines() {
    this.ensureDisciplines();
    return [...this.disciplines];
  }

  createDiscipline(data: { name: string; description?: string | null; is_active?: boolean }) {
    this.ensureDisciplines();
    const idBase = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || `discipline_${Date.now()}`;
    const id = this.disciplines.some(d => d.id === idBase) ? `${idBase}_${Date.now()}` : idBase;
    if (this.disciplines.some(d => d.name.toLowerCase() === data.name.toLowerCase())) {
      throw new BadRequestException('Discipline already exists');
    }
    const now = new Date().toISOString();
    const discipline: Discipline = {
      id,
      name: data.name,
      code: null,
      description: data.description ?? null,
      is_active: data.is_active ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.disciplines = [discipline, ...this.disciplines];
    return discipline;
  }

  updateDiscipline(id: string, data: { name?: string; description?: string | null; is_active?: boolean }) {
    this.ensureDisciplines();
    const index = this.disciplines.findIndex(d => d.id === id);
    if (index === -1) {
      throw new NotFoundException('Discipline not found');
    }
    if (data.name && this.disciplines.some(d => d.id !== id && d.name.toLowerCase() === data.name!.toLowerCase())) {
      throw new BadRequestException('Discipline already exists');
    }
    const now = new Date().toISOString();
    const updated: Discipline = {
      ...this.disciplines[index],
      ...data,
      updatedAt: now,
    };
    this.disciplines[index] = updated;
    return updated;
  }

  deleteDiscipline(id: string) {
    this.ensureDisciplines();
    const index = this.disciplines.findIndex(d => d.id === id);
    if (index === -1) {
      throw new NotFoundException('Discipline not found');
    }
    const [removed] = this.disciplines.splice(index, 1);
    return removed;
  }

  async getSubscriptionTypes() {
    const items = await this.prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      amount_cents: item.amountCents,
      currency: item.currency,
      duration_months: item.durationMonths,
      is_active: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  async createSubscriptionType(dto: CreateSubscriptionDto) {
    const created = await this.prisma.subscription.create({
      data: {
        name: dto.name,
        description: dto.description,
        amountCents: dto.amount_cents,
        currency: dto.currency ?? 'MAD',
        durationMonths: dto.duration_months ?? null,
        isActive: dto.is_active ?? true,
      },
    });
    return {
      id: created.id,
      name: created.name,
      description: created.description,
      amount_cents: created.amountCents,
      currency: created.currency,
      duration_months: created.durationMonths,
      is_active: created.isActive,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async updateSubscriptionType(id: string, dto: UpdateSubscriptionDto) {
    const updated = await this.prisma.subscription.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        amountCents: dto.amount_cents,
        currency: dto.currency,
        durationMonths: dto.duration_months,
        isActive: dto.is_active,
      },
    });
    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      amount_cents: updated.amountCents,
      currency: updated.currency,
      duration_months: updated.durationMonths,
      is_active: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteSubscriptionType(id: string) {
    await this.prisma.$transaction([
      this.prisma.member.updateMany({
        where: { subscriptionId: id },
        data: { subscriptionId: null },
      }),
      this.prisma.subscription.delete({
        where: { id },
      }),
    ]);
    return { id };
  }

  getCategories() {
    return [
      { id: 'u7', name: 'U7', minAge: 0, maxAge: 7, description: 'Moins de 7 ans' },
      { id: 'u9', name: 'U9', minAge: 7, maxAge: 9, description: '7-9 ans' },
      { id: 'u11', name: 'U11', minAge: 9, maxAge: 11, description: '9-11 ans' },
      { id: 'u13', name: 'U13', minAge: 11, maxAge: 13, description: '11-13 ans' },
      { id: 'u15', name: 'U15', minAge: 13, maxAge: 15, description: '13-15 ans' },
      { id: 'u17', name: 'U17', minAge: 15, maxAge: 17, description: '15-17 ans' },
      { id: 'u20', name: 'U20', minAge: 17, maxAge: 20, description: '17-20 ans' },
      { id: 'senior', name: 'Seniors', minAge: 20, maxAge: null, description: '20 ans et plus' },
    ];
  }
}
