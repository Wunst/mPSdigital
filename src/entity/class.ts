import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany, ManyToMany,JoinTable, PrimaryColumn } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Student} from "./student"


@Entity()
export class Class extends BaseEntity {
    @PrimaryColumn()
    @OneToMany(() => Student, (student) => student.class)
    student!: Student[]

    @Column()
    mPSYear!: string;
};
