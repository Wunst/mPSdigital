import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany,JoinTable, Any, In, MoreThan, IsNull, Or } from 'typeorm';
import { AppDataSource } from '../data-source';
import express from 'express';
import { Student} from "./student"
import auth from '../auth';
import user, { Role } from './user';
import { group } from 'console';
import { User } from './user';

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

async function groupList(req: express.Request, res: express.Response) {
    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    if (loggedInUser.role === Role.student) {
        res.status(403).end();
        return;
    }

    let groups : Group[] = [];

    if (!loggedInUser.allForms) {
        for (let index = 0; index < loggedInUser.form.length; index++) {
            const form = loggedInUser.form[index];
            Group.find({
                relations: {
                    student: { user: true }
                },
                where: {
                    student: { user: { form } },
                    endDate: Or(MoreThan(new Date()), IsNull())
                }});
            groups.push();
        }
    }else{
       groups = await Group.find();
    }

    res.status(200).json({
        groups,
    }).end();
}

export default { groupList};