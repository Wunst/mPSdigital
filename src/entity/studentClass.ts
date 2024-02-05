import { BaseEntity, Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Student} from "./student"


@Entity()
export class StudentClass extends BaseEntity {
    @PrimaryColumn()
    name!: string;

    @OneToMany(() => Student, (student) => student.studentClass)
    student!: Student[]

    @Column()
    mPSYear!: string;
};
