import { BaseEntity, Entity, Column, PrimaryColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Student} from "./student"
import { User } from './user';


@Entity()
export class Form extends BaseEntity {
    @PrimaryColumn()
    name!: string;

    @OneToMany(() => Student, student => student.form)
    students!: Student[]

    @Column()
    mPSYear!: string;
};