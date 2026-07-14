import { Controller, Post, Body, Res, Header } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/request/login-request.dto';
import { UserResponseDto } from './dto/response/login-response.dto';
import { DynamicResponseMessage } from '../common/dto/dynamic-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<DynamicResponseMessage<UserResponseDto>> {
    const { response, token } = await this.authService.login(loginDto);
    res.setHeader('Authorization', `Bearer ${token}`);
    return response;
  }
}
