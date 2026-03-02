import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto, userId: string) {
    const { participantIds, ...eventData } = createEventDto;
    
    return this.prisma.event.create({
      data: {
        ...eventData,
        createdById: userId,
        participants: participantIds ? {
          create: participantIds.map(id => ({ userId: id }))
        } : undefined
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    });
  }

  async findAll(userRoles: string[], userId: string) {
    const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin') || userRoles.includes('federation_admin');

    if (isAdmin) {
      return this.prisma.event.findMany({
        include: {
          participants: {
             include: {
                user: {
                  select: { displayName: true, email: true }
                }
             }
          },
          createdBy: {
             select: { displayName: true }
          }
        },
        orderBy: { startDate: 'asc' }
      });
    }

    return this.prisma.event.findMany({
      where: {
        OR: [
          { targetRoles: { hasSome: userRoles } },
          { participants: { some: { userId } } },
          { createdById: userId }
        ]
      },
      include: {
         participants: {
             include: {
                user: {
                  select: { displayName: true }
                }
             }
          },
         createdBy: {
             select: { displayName: true }
          }
      },
      orderBy: { startDate: 'asc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    });
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const { participantIds, ...eventData } = updateEventDto;

    return this.prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
      if (participantIds) {
        // Remove all existing participants
        await prisma.eventParticipant.deleteMany({
          where: { eventId: id }
        });

        // Add new participants
        if (participantIds.length > 0) {
          await prisma.eventParticipant.createMany({
            data: participantIds.map(userId => ({
              eventId: id,
              userId
            }))
          });
        }
      }

      return prisma.event.update({
        where: { id },
        data: eventData,
        include: {
          participants: true
        }
      });
    });
  }

  async remove(id: string) {
    return this.prisma.event.delete({
      where: { id }
    });
  }
}
