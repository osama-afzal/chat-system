import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService
    ) {}

    async register(username: string, password: string): Promise<any> {
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await this.prismaService.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            throw new BadRequestException('Username already exists');
        }

        const user = await this.prismaService.user.create({
            data: {
                username,
                passwordHash: hashedPassword
            }
        });

        return {
            username: user.username,
            createdAt: user.createdAt
        }
    }

    async login(username: string, password: string): Promise<any> {
        const user = await this.prismaService.user.findUnique({
            where: { username }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: user.id,
            username: user.username
        }

        return {
            access_token: await this.jwtService.signAsync(payload)
        }
    }
}
