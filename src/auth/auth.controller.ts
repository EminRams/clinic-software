import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/request/login-request.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { DynamicResponseMessage } from '../common/dto/dynamic-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000, blockDuration: 120000 } })
  @Post('login')
  async login(
    @Body() loginDto: LoginRequestDto,
  ): Promise<DynamicResponseMessage<LoginResponseDto>> {
    return this.authService.login(loginDto);
  }
}
