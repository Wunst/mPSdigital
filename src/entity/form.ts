import { BaseEntity, Entity, Column, OneToMany, PrimaryGeneratedColumn, Index } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Role, User } from './user';
import express from 'express';
import auth from '../auth';
import { Student } from './student';


@Entity()
export class Form extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;
    
    @OneToMany(() => Student, student => student.form)
    students!: Student[]

    @Index({ unique: true })
    @Column()
    name!: string;
};

export async function create(req: express.Request, res: express.Response) {
    //todo: check for list of user
    if (!req.body['name']) {
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
    });
    
    res.status(201).end();
}

export async function addStudent(req: express.Request<{name: string, username: string}>, res: express.Response) {
    const { name, username } = req.params;

    if(!username || !name) {
        res.status(400).end();
        return;
    }

    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    const foundForm = await Form.findOneBy({ name: name });
    const foundUser = await User.findOneBy({ username });
    if(!foundForm || !foundUser) {
        res.status(404).end();
        return;
    }

    if(loggedInUser.role === Role.student) {
        res.status(403).end();
        return;
    }

    const student = await Student.findOne({
        relations: {
            user: true,
            form: true,
        },
        where: {
            user: foundUser
        }
    });

    if(
        !student ||
        student.form !== null
    ) {
        res.status(409).end();
        return;
    }

    await AppDataSource
        .createQueryBuilder()
        .relation(Form, "student")
        .of(foundForm)
        .add(student);

    res.status(200).end();
}