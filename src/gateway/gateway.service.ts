import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Socket } from 'socket.io';
import { JoinRoomDto } from './dto/join-room.dto';
import { WsException } from '@nestjs/websockets';
import { LoadHistoryDto } from './dto/load-history.dto';

@Injectable()
export class GatewayService {
  constructor(private readonly prismaService: PrismaService) {}

  async handleMessage(client: Socket, payload: SendMessageDto) {
    const user = client.data.user;

    const room = await this.prismaService.room.findUnique({
      where: { id: payload.roomId },
    });

    if (!room) {
      throw new WsException('Room does not exist');
    }

    const latestMessage = await this.prismaService.message.findFirst({
      where: {
        roomId: payload.roomId,
      },
      orderBy: {
        sequenceNumber: 'desc',
      },
    });

    const nextSequenceNumber = latestMessage
      ? latestMessage.sequenceNumber + BigInt(1)
      : BigInt(1);

    const membership = await this.prismaService.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: payload.roomId,
          userId: user.userId,
        },
      },
    });

    if (!membership) {
      throw new Error('Unauthorized room access');
    }

    const message = await this.prismaService.message.create({
      data: {
        roomId: payload.roomId,
        userId: user.userId,
        content: payload.content,
        sequenceNumber: nextSequenceNumber,
      },
      include: {
        user: true,
      },
    });

    return {
      id: message.id,
      roomId: message.roomId,
      username: message.user.username,
      content: message.content,
      sequenceNumber: message.sequenceNumber.toString(),
      createdAt: message.createdAt,
    };
  }

  async joinRoom(client: Socket, payload: JoinRoomDto) {
    const user = client.data.user;

    const room = await this.prismaService.room.findUnique({
      where: {
        id: payload.roomId,
      },
    });

    if (!room) {
      throw new Error('Room not found');
    }

    await this.prismaService.roomMember.upsert({
      where: {
        roomId_userId: {
          roomId: payload.roomId,
          userId: user.userId,
        },
      },
      update: {},
      create: {
        roomId: payload.roomId,
        userId: user.userId,
      },
    });
  }

  async findRoom(roomId: string) {
    return this.prismaService.room.findUnique({
      where: { id: roomId },
    });
  }

  async getRecentMessages(roomId: string) {
    const messages = await this.prismaService.message.findMany({
      where: {
        roomId,
      },
      orderBy: {
        sequenceNumber: 'desc',
      },
      take: 20,
      include: {
        user: true,
      },
    });

    return messages.reverse().map((message) => ({
      id: message.id,
      roomId: message.roomId,
      username: message.user.username,
      content: message.content,
      sequenceNumber: message.sequenceNumber.toString(),
      createdAt: message.createdAt,
    }));
  }

  async loadHistory(payload: LoadHistoryDto) {
    const limit = payload.limit ?? 20;

    const messages = await this.prismaService.message.findMany({
      where: {
        roomId: payload.roomId,
        ...(payload.beforeSequenceNumber && {
          sequenceNumber: {
            lt: BigInt(payload.beforeSequenceNumber)
          },
        }),
      },
      orderBy: {
        sequenceNumber: 'desc'
      },
      take: limit,
      include: {
        user: true
      }
    });

    return messages.reverse().map((message) => ({
      id: message.id,
      roomId: message.roomId,
      username: message.user.username,
      content: message.content,
      sequenceNumber: message.sequenceNumber.toString(),
      createdAt: message.createdAt
    }));
  }
}
