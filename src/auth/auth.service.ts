import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Users } from '../database/entities/Users';
import { LoginRequestDto } from './dto/request/login-request.dto';
import { UserResponseDto } from './dto/response/login-response.dto';
import { DynamicResponseMessage } from '../common/dto/dynamic-response.dto';
import { ResponseHelper } from '../common/helpers/response.helper';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Users> {
    const user = await this.usersRepository.findOne({
      where: { email, status: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }

  async login(
    loginDto: LoginRequestDto,
  ): Promise<{ response: DynamicResponseMessage<UserResponseDto>; token: string }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = {
      sub: user.id,
      email: user.email,
      clinicId: user.clinicId,
    };

    const token = this.jwtService.sign(payload);

    const userResponse = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return {
      response: ResponseHelper.success(userResponse, 'Inicio de sesión exitoso'),
      token,
    };
  }
}
