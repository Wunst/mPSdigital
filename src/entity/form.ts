import { BaseEntity, Entity, Column, PrimaryColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Role } from './user';
import express from 'express';
import auth from '../auth';
import { Student } from './student';


@Entity()
export class Form extends BaseEntity {
    @PrimaryColumn()
    name!: string;

    @OneToMany(() => Student, student => student.form)
    students!: Student[]

    @Column()
    mPSYear!: string;
};

export async function create(req: express.Request, res: express.Response) {
    //todo: check for list of user
    if (!req.body['name'] ||
        !req.body['mPSYear']) {
        res.status(400).end();
        return;
    }

    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    if(loggedInUser.role === Role.student){
        res.status(403).end();
        return;
    }
    //todo: insert users
    const result = await Form.insert({
        name: req.body['name'],
        mPSYear: req.body['type'],
    });
    
    res.status(201).end();
}