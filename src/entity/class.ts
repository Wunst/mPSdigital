import { BaseEntity, Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Student} from "./student"


@Entity()
export class Class extends BaseEntity {
    @PrimaryColumn()
    name!: string;

    @OneToMany(() => Student, (student) => student.class)
    student!: Student[]

    @Column()
    mPSYear!: string;
};
