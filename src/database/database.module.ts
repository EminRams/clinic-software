import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        return {
          type: 'postgres',
          url: process.env.DATABASE_URL,
          entities: [__dirname + '/entities/*{.ts,.js}'],
          synchronize: false,
          logging: ['error', 'warn'],
        };
      },
    }),
  ],
})
export class DatabaseModule {}
