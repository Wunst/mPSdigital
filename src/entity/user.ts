import bcrypt from "bcrypt"
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Index, OneToOne } from 'typeorm';
import { Student } from './student';

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
        type: 'simple-enum',
        enum: Role
    })
    role!: Role;

    @OneToOne(() => Student,
    student => student.user)
    student!: Student;

    @Column({
        default: false
    })
    changedPassword!: boolean;

    @Column({
        default: "{}"
    })
    settings!: string;

    @Column({
        default: true
    })
    isActive!: boolean;

    async checkPassword(password: string): Promise<boolean> {
        return this.isActive && await bcrypt.compare(password, this.password)
    }
};
