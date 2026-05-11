import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Socket } from 'socket.io';
import { JoinRoomDto } from './dto/join-room.dto';

@Injectable()
export class GatewayService {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async handleMessage(client: Socket, payload: SendMessageDto) {
        const user = client.data.user;

        const latestMessage = await this.prismaService.message.findFirst({
            where: {
                roomId: payload.roomId
            },
            orderBy: {
                sequenceNumber: 'desc'
            }
        });

        const nextSequenceNumber = latestMessage
            ? latestMessage.sequenceNumber + BigInt(1)
            : BigInt(1);

        const membership = await this.prismaService.roomMember.findUnique({
            where: {
                roomId_userId: {
                    roomId: payload.roomId,
                    userId: user.userId
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
                sequenceNumber: nextSequenceNumber
            },
        });

        return {
            id: message.id,
            roomId: message.roomId,
            userId: message.userId,
            content: message.content,
            sequenceNumber: message.sequenceNumber.toString(),
            createdAt: message.createdAt,
        };
    }

    async joinRoom(client: Socket, payload: JoinRoomDto) {
        const user = client.data.user;

        const room = await this.prismaService.room.findUnique({
            where: {
                id: payload.roomId
            },
        });

        if (!room) {
            throw new Error('Room not found');
        }

        await this.prismaService.roomMember.upsert({
            where: {
                roomId_userId: {
                    roomId: payload.roomId,
                    userId: user.userId
                },
            },
            update: {},
            create: {
                roomId: payload.roomId,
                userId: user.userId
            }
        });
    }
}
