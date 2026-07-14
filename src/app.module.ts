import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Users } from './database/entities/Users';
import { Clinics } from './database/entities/Clinics';
import { AdminSeedService } from './database/seeds/admin-seed.service';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Users, Clinics]),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, AdminSeedService],
})
export class AppModule {}
