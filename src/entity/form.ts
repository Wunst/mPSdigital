import { BaseEntity, Entity, Column, PrimaryColumn, ManyToMany } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Student} from "./student"
import { User } from './user';


@Entity()
export class Form extends BaseEntity {
    @PrimaryColumn()
    name!: string;

    @ManyToMany(() => User,
    user => user.form)
    user!: User[]

    @Column()
    mPSYear!: string;
};