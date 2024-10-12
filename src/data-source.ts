import { DataSource } from 'typeorm';
import { User } from './entity/user';
import { Student } from './entity/student';
import { Form } from './entity/form';
import { Group } from './entity/group';
import { SpecialParentalConsent } from './entity/specialParentalConsent';
import { Excursion } from './entity/excursion';

let AppDataSource: DataSource;

if (process.env['NODE_ENV'] === 'production') {
    AppDataSource = new DataSource({
        type: 'postgres',
        host: process.env["POSTGRES_HOST"],
        port: +(process.env["POSTGRES_PORT"] || 5432),
        username: process.env["POSTGRES_USER"],
        password: process.env["POSTGRES_PASSWORD"],
        database: process.env["POSTGRES_DB"],
        entities: [
            User,
            Form,
            Student,
            Group,
            SpecialParentalConsent,
            Excursion
        ]
    });
} else {
    AppDataSource = new DataSource({
        type: 'sqlite',
        database: 'testing.sqlite',
        entities: [
            User,
            Form,
            Student,
            Group,
            SpecialParentalConsent,
            Excursion
        ],
        logging: true,
    });
}

export { AppDataSource };
