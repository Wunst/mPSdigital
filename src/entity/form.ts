import { BaseEntity, Entity, Column, OneToMany, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Student } from './student';

@Entity()
export class Form extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;
    
    @OneToMany(() => Student, student => student.form)
    students!: Student[]

    @Index({ unique: true })
    @Column()
    name!: string;

    @Column()
    isActive!: boolean;
};
