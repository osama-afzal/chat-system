import { Controller, Post, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('rooms')
export class RoomsController {
    constructor(
        private readonly roomsService: RoomsService
    ) {}

    @Post('create')
    async createRoom(data: CreateRoomDto): Promise<any> {
        await this.roomsService.createRoom(data);
    }
}
