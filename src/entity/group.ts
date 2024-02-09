import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany,JoinTable } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Student} from "./student"

export enum Project {
    mPS = 'mPS',
    Herausforderung = 'Herausforderung'
}


@Entity()
export class Group extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    onlinePinboard!: string;

    @Column({
        type: "simple-enum",
        enum: Project,
        default: Project.mPS
    })
    project!: Project;

    @Column()
    startDate!: Date;

    @Column()
    endDate!: Date;

    @ManyToMany(() => Student)
    @JoinTable()
    student!: Student[]
};