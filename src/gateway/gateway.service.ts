import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Socket } from 'socket.io';

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
}
