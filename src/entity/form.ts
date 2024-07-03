import { BaseEntity, Entity, Column, OneToMany, PrimaryGeneratedColumn, Index, IsNull, ManyToMany, MoreThan, Or } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Role, User } from './user';
import express from 'express';
import auth from '../auth';
import { Student } from './student';
import { format } from 'path';
import { Group } from './group';


@Entity()
export class Form extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToMany(() => Student, student => student.form)
    students!: Student[]

    @Index({ unique: true })
    @Column()
    name!: string;

    @Column()
    isActive!: boolean;
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

    const result = await Form.insert({
        name: req.body['name'],
        isActive: true,
    });

    req.body['students'].forEach(async (username: string) => {
        const user = await User.findOneBy({ username })

        if (!user || user.role !== "student") {
            return;
        }
        
        await AppDataSource
            .createQueryBuilder()
            .relation(Student, "form")
            .of(user.id)
            .add(result.identifiers[0]);
    });
    
    res.status(201).end();
}

export async function addStudent(req: express.Request<{name: string, username: string}>, res: express.Response) {
    const { name, username } = req.params;

    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }
    
    if(loggedInUser.role === Role.student) {
        res.status(403).end();
        return;
    }

    if(!username || !name) {
        res.status(400).end();
        return;
    }

    const foundForm = await Form.findOneBy({ name: name });
    const foundUser = await User.findOneBy({ username });
    if(!foundForm || !foundUser) {
        res.status(404).end();
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
        .relation(Form, "students")
        .of(foundForm.id)
        .add(student.userId);

    res.status(200).end();
}

export async function list(req: express.Request, res: express.Response) {
    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }
    

    res.status(200).json(
        (await Form.find()).map(form => ({
            name: form.name
        }))
    ).end();
}

export async function listStudent(req: express.Request<{name: string}>, res: express.Response) {
    const { name } = req.params;
    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    if(loggedInUser.role === Role.student) {
        res.status(403).end();
        return;
    }

    const students = await Student.find({
        relations: {
            form:true,
            user:true,
            group:true,
        },
        where: {
            form: {name: name},
            group:{endDate: Or(MoreThan(new Date()), IsNull())}
        }
    });

    res.status(200).json(students.map(student => { return {
        username: student.user.username,
    }}));
}

export async function archive(req: express.Request<{name: string}>, res: express.Response) {
    const { name } = req.params;

    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    if(loggedInUser.role === Role.student){
        res.status(403).end();
        return;
    }

    const form = await(Form.findOneBy({name: name}));

    if (!form){
        res.status(404).end();
        return;
    }

    await Form.update(
        { id: form.id},
        {name: name+" "+new Date().getFullYear(),
         isActive: false,
        }
    );
    
    res.status(201).end();
}