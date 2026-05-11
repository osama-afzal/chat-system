import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { GatewayService } from './gateway.service';
import { JoinRoomDto } from './dto/join-room.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GatewayGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly gatewayService: GatewayService
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Incoming socket connection');

    try {
      const token = client.handshake.auth.token;

      console.log('Token received');

      if (!token) {
        console.log('No token provided');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);

      console.log('JWT payload:', payload);

      client.data.user = {
        userId: payload.sub,
        username: payload.username,
      };

      console.log('Authenticated user:', client.data.user);
    } catch (error) {
      console.log('Socket auth failed:', error);

      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message.send')
  async handleMessage(client: Socket, payload: any) {
    const message = await this.gatewayService.handleMessage(
      client,
      payload
    );

    this.server.to(payload.roomId).emit(
      'message.new',
      message,
    );
  }

  @SubscribeMessage('room.join')
  async handleJoinRoom(client: Socket, payload: JoinRoomDto) {
    await this.gatewayService.joinRoom(client, payload);

    client.join(payload.roomId);

    client.emit('room.joined', {
      roomId: payload.roomId
    });
  }
}
