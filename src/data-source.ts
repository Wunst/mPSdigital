import { DataSource } from 'typeorm';
import { User } from './user';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'mpsdigital',
    database: 'mpsdigital',
    entities: [
        User
    ]
});
