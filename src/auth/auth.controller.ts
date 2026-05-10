import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('register')
    async register(@Body() data: RegisterDto): Promise<any> {
        const { username, password } = data
        
        return await this.authService.register(username, password);
    }

    @Post('login')
    async login(@Body() data: LoginDto): Promise<any> {
        const { username, password } = data

        return await this.authService.login(username, password);
    }
}
