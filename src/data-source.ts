import { DataSource } from 'typeorm';
import { User } from './user';
import { Excursion } from './entity/excursion';
import { Form } from './entity/form';
import { Group } from './entity/group';
import { SpecialParentalConsent } from './entity/specialParentalConsent';
import { Student } from './entity/student';
import { Teacher } from './entity/teacher';

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
