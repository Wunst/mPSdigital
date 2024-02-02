import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export enum Role {
    student = 'student',
    teacher = 'teacher',
    admin = 'admin'
}

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index({ unique: true })
    @Column()
    username!: string;

    @Column()
    password!: string;

    @Column({
        type: "enum",
        enum: Role,
        default: Role.student
    })
    role!: Role;
};
