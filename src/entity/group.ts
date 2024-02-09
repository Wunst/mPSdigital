import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany,JoinTable, DataSource, MoreThan } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Student} from "./student"
import express from 'express';
import { Role, User } from './user';
import auth from '../auth';
import { group } from 'console';
import { findSourceMap } from 'module';

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


async function createGroup(req: express.Request, res: express.Response) {
    if (!req.body['name'] || !req.body['project'] || !(req.body['project'] in Group)) {
        res.status(400).end();
        return;
    }

    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    if(!(loggedInUser.role == Role.student)){
        res.status(403).end();
    }
    
    // TODO: helpful to memorise the loggedin student?
    const loggedInStudent = await Student.findOneBy({relations: {user: true}, where: {user: {id: loggedInUser.id}}});

    // TODO: do not allow to create new group, if student is in a active group
    if(loggedInStudent?.group: Group.findOneBy(endDate: MoreThan(Date.now()))){
        res.status(403).end();
    }

    // if(await Student.findOne({
    //     relations: {
    //         group: true
    //     },
    //     where: {
    //         student: {
    //             id: loggedInStudent.id
    //         },
    //         group: {
    //             endDate: MoreThan(Date.now())
    //         },
    //     },
    // })){
    //     res.status(403).end();
    // }
    
    // Group already exist
    if(await Group.findOneBy({ name: req.body['name']})){
        res.status(409).send('Group exists').end();
        return;
    }

    await Group.insert({
        name: req.body['name'],
        startDate: Date.now(),
        project : req.body['project']
    });

    // TODO: Add the relation between student and group
    loggedInStudent.group = [await Group.findOneBy({ name: req.body['name']})];
     // loggedInStudent.group.push(await Group.findOneBy({ name: req.body['name']}));

    res.status(201).end();
}

    export default { createGroup };