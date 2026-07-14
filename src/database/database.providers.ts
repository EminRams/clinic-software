import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const databaseProviders = [
    {
        provide: 'DATA_SOURCE',
        useFactory: async () => {
            const dataSource = new DataSource({
                type: 'postgres',
                url: process.env.DATABASE_URL,
                entities: [__dirname + '/entities/*{.ts,.js}'],
                synchronize: false,
            });
            return dataSource.initialize();
        },
    },
];