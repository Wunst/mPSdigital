import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, And } from 'typeorm';
import { Student } from "./student"
import express from 'express';
import auth from '../auth';
import { Role } from './user';

export enum ProjectType {
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
        enum: ProjectType,
        default: ProjectType.mPS
    })
    projectType!: ProjectType;

    @Column()
    startDate!: Date;

    @Column({
        nullable: true
    })
    endDate!: Date;

    @ManyToMany(() => Student)
    @JoinTable()
    student!: Student[];

    isCurrent(): boolean {
        return !this.endDate || this.endDate > new Date();
    }
};


async function createGroup(req: express.Request, res: express.Response) {
    if (!req.body['name'] || !req.body['projectType'] ||
        !(req.body['projectType'] in ProjectType)) {
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
    const loggedInStudent = await Student.findOne({
        relations: {
            user: true,
            group: true,
        },
        where: {
            user: loggedInUser
        }
    });
    if(!loggedInStudent){
        res.status(403).end();
        return;
    }

    if(loggedInStudent.group.find(group => group.isCurrent())) {
        res.status(403).end();
        return;
    }

    const result = await Group.insert({
        name: req.body['name'],
        startDate: new Date(),
        projectType: req.body['projectType'],
        onlinePinboard: ''
    });

    // TODO: Add the relation between student and group
    //loggedInStudent.group = [await Group.findOneBy({ name: req.body['name']})];
    //loggedInStudent.group.push(await Group.findOneBy({ name: req.body['name']}));

    res.status(201).end();
}

export default { createGroup };