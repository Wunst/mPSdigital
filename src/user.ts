import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AppDataSource } from './data-source';

export enum Role {
    student = 'student',
    teacher = 'teacher',
    admin = 'admin'
}

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    username!: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column()
    password!: string;

    @Column({
        type: "simple-enum",
        enum: Role,
        default: Role.student
    })
    role!: Role;
};
