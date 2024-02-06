import { DataSource } from 'typeorm';
import { User } from './user';

let AppDataSource: DataSource;

if (process.env['NODE_ENV'] === 'production') {
    AppDataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'mpsdigital',
        database: 'mpsdigital',
        entities: [
            User
        ]
    });
} else {
    AppDataSource = new DataSource({
        type: 'sqlite',
        database: 'testing.sqlite',
        entities: [
            User
        ]
    });
}

export { AppDataSource };
