import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, And } from 'typeorm';
import { Student } from "./student"
import express from 'express';
import auth from '../auth';
import { Role } from './user';

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
    if (!req.body['name'] || !req.body['project'] ||
        !(req.body['project'] in Project)) {
        res.status(400).end();
        return;
    }

    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    if (loggedInUser.role !== Role.student) {
        res.status(401).end();
        return;
    }

    // memorise student
    const loggedInStudent = await Student.findOneBy({ user: loggedInUser });
    if(!loggedInStudent){
        res.status(403).end();
        return;
    }

    if(loggedInStudent.group.find(group => group.endDate >= new Date())) {
        res.status(403).end();
        return;
    }

    const result = await Group.insert({
        name: req.body['name'],
        startDate: new Date(),
        project: req.body['project']
    });

    // TODO: Add the relation between student and group
    //loggedInStudent.group = [await Group.findOneBy({ name: req.body['name']})];
    //loggedInStudent.group.push(await Group.findOneBy({ name: req.body['name']}));

    res.status(201).end();
}

export default { createGroup };