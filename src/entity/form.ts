import { BaseEntity, Entity, Column, ManyToMany, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Student } from './student';

@Entity()
export class Form extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToMany(() => Student, student => student.form)
    students!: Student[]

    @Index({ unique: true })
    @Column()
    name!: string;

    @Column()
    isActive!: boolean;
};
