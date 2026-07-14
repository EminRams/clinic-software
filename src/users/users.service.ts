import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Users } from '../database/entities/Users';
import { CreateUserRequestDto } from './dto/request/create-user-request.dto';
import { UpdateUserRequestDto } from './dto/request/update-user-request.dto';
import { UserResponseDto } from './dto/response/user-response.dto';
import { DynamicResponseMessage } from '../common/dto/dynamic-response.dto';
import { ResponseHelper } from '../common/helpers/response.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async findAll(clinicId?: string): Promise<DynamicResponseMessage<UserResponseDto[]>> {
    const where = clinicId ? { clinicId } : {};
    const users = await this.usersRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    const data = plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });

    return ResponseHelper.success(data, 'Usuarios listados exitosamente');
  }

  async findOne(id: string): Promise<DynamicResponseMessage<UserResponseDto>> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con ID ${id}`);
    }

    const data = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return ResponseHelper.success(data, 'Usuario encontrado exitosamente');
  }

  async findByEmail(email: string): Promise<Users | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(
    createUserDto: CreateUserRequestDto,
  ): Promise<DynamicResponseMessage<UserResponseDto>> {
    const existing = await this.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash,
    });

    const saved = await this.usersRepository.save(user);

    const data = plainToInstance(UserResponseDto, saved, {
      excludeExtraneousValues: true,
    });

    return ResponseHelper.created(data, 'Usuario creado exitosamente');
  }

  async update(
    id: string,
    updateUserDto: UpdateUserRequestDto,
  ): Promise<DynamicResponseMessage<UserResponseDto>> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con ID ${id}`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.findByEmail(updateUserDto.email);
      if (existing) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(updateUserDto.password, salt);
      delete updateUserDto.password;
    }

    Object.assign(user, updateUserDto);
    const saved = await this.usersRepository.save(user);

    const data = plainToInstance(UserResponseDto, saved, {
      excludeExtraneousValues: true,
    });

    return ResponseHelper.success(data, 'Usuario actualizado exitosamente');
  }

  async remove(id: string): Promise<DynamicResponseMessage<null>> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con ID ${id}`);
    }

    user.status = false;
    await this.usersRepository.save(user);

    return ResponseHelper.success(null, 'Usuario eliminado exitosamente');
  }
}
