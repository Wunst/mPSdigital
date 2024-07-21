import { BaseEntity, Entity, Column, OneToMany, PrimaryGeneratedColumn, Index, IsNull } from 'typeorm';
/* import { AppDataSource } from '../data-source';
import { Role, User } from './user';
import express from 'express';
import z from 'zod';
import { validateRequest } from 'zod-express-middleware';
import auth from '../auth'; */
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

    @Column()
    isActive!: boolean;
};

/* export const routes = express.Router()

routes.post("/form/:name", validateRequest({
    params: z.object({
        name: z.string(),
    }),
}), async (req, res) => {
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
})

routes.put("/form/:name/:username", validateRequest({
    params: z.object({
        name: z.string(),
        username: z.string(),
    }),
}), async (req, res) => {
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
            user: { id: foundUser.id },
        }
    });

    console.log(JSON.stringify(student));

    if(!student || student.form) {
        res.status(409).end();
        return;
    }

    await AppDataSource
        .createQueryBuilder()
        .relation(Form, "students")
        .of(foundForm.id)
        .add(student.userId);

    res.status(200).end();
})

routes.get("/forms", validateRequest({}), async (req, res) => {
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
})

 */