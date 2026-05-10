import { Module } from '@nestjs/common';
import { GatewayGateway } from './gateway.gateway';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { GatewayService } from './gateway.service';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [GatewayGateway, GatewayService]
})
export class GatewayModule {}
