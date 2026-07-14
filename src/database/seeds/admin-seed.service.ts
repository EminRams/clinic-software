import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Users } from '../entities/Users';
import { Clinics } from '../entities/Clinics';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Clinics)
    private readonly clinicsRepository: Repository<Clinics>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      this.logger.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping admin seed');
      return;
    }

    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      this.logger.log(`Admin user "${email}" already exists, skipping seed`);
      return;
    }

    let clinic = await this.clinicsRepository.findOne({ where: { status: true } });
    if (!clinic) {
      clinic = this.clinicsRepository.create({
        name: 'Default Clinic',
        status: true,
      });
      clinic = await this.clinicsRepository.save(clinic);
      this.logger.log('Default clinic created for admin user');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = this.usersRepository.create({
      fullName: 'Admin',
      email,
      passwordHash,
      clinicId: clinic.id,
      status: true,
    });

    await this.usersRepository.save(admin);
    this.logger.log(`Admin user "${email}" created successfully`);
  }
}
