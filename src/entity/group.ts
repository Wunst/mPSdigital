import express from 'express';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany,JoinTable } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Student} from "./student"
import auth from '../auth';
import { Role, User } from './user';

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

async function join(req: express.Request, res: express.Response) {
    const { username, group } = req.body;
    if(!username || !group) {
        res.status(400).end();
        return;
    }

    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    const foundGroup = await Group.findOneBy({ id: group });
    const foundUser = await User.findOneBy({ username });
    if(!foundGroup || !foundUser) {
        res.status(404).end();
        return;
    }

    if(loggedInUser.role === Role.student && foundUser !== loggedInUser) {
        res.status(403).end();
        return;
    }

    const student = await Student.findOne({
        relations: {
            user: true,
            group: true,
        },
        where: {
            user: foundUser
        }
    });

    if(!student) {
        res.status(403).end();
        return;
    }

    if(student.group.find(group => group.endDate > new Date())) {
        res.status(409).end();
        return;
    }

    student.group.push(foundGroup);
}

export default { join };
