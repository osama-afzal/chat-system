import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async createRoom(data: CreateRoomDto): Promise<any> {
        const room = await this.prismaService.room.create({
            data: {
                name: data.name
            }
        });

        return {
            roomName: room.name,
            createdAt: room.createdAt
        }
    }
}
