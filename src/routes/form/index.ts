import express from "express"
import z from "zod";
import { validateRequest } from "zod-express-middleware";
import { Role, User } from "../../entity/user";
import { Form } from "../../entity/form";
import { Student } from "../../entity/student";
import { AppDataSource } from "../../data-source";
import { Or, IsNull, MoreThan } from "typeorm";
import auth from "../../auth";
import { resolve } from "path";

const router = express.Router()

// POST /form/:name - insert form
router.post("/form/:name", validateRequest({
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

// PUT /form/:name/:username - add student to form
router.put("/form/:name/:username", validateRequest({
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

// GET /form - get forms
router.get("/form", validateRequest({}), async (req, res) => {
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

// GET /form/:name - list of students
router.get("/form/:name", validateRequest({}), async (req, res) => {
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
        },
        where: {
            form: {name: name},
        }
    });

    res.status(200).json(students.map(student => { return {
        username: student.user.username,
    }}));
})

// POST /form/:name/archive - archive
router.post("/form/:name/archive", validateRequest({}), async (req, res) => {
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
})

export default router;

