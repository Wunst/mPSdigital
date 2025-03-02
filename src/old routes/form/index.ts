import express from "express"
import z from "zod";
import { validateRequest } from "zod-express-middleware";
import { Role, User } from "../../entity/user";
import { Form } from "../../entity/form";
import { Student } from "../../entity/student";
import { AppDataSource } from "../../data-source";
import { Or, IsNull, MoreThan } from "typeorm";
import { user, userRoles } from "../../middleware/auth";
import { SpecialParentalConsent } from '../../entity/specialParentalConsent'
import { Status } from '../../entity/excursion'

const router = express.Router()

// POST /form - insert form
router.post("/", userRoles([Role.teacher, Role.admin]), validateRequest({
    body: z.object({
        name: z.string(),
        students: z.array(z.string()),
    }).partial({
        students: true})
}), async (req, res) => {
    if (await Form.findOneBy({ name: req.body.name })) {
        res.status(409).end()
        return
    }

    const result = await Form.insert({
        name: req.body.name,
        isActive: true,
    });

    //todo: add user from iser-file

    req.body.students?.forEach(async (username: string) => {
        const user = await User.findOneBy({ username })

        if (!user || user.role !== Role.student) {
            return;
        }
        
        await AppDataSource
            .createQueryBuilder()
            .relation(Student, "form")
            .of(user.id)
            .add(result.identifiers[0]);
    });
    
    res.status(201).end();
})

// PUT /form/:name/:username - add student to form
router.put("/:name/:username", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        name: z.string(),
        username: z.string(),
    }),
}), async (req, res) => {
    const foundForm = await Form.findOneBy({ name: req.params.name });
    const foundUser = await User.findOne({
        relations: { student: { form: true } },
        where: {username: req.params.username}
    });
    if(!foundForm || !foundUser) {
        res.status(404).end();
        return;
    }

    if(!foundUser.student || foundUser.student.form.find(form => form.isActive)) {
        res.status(409).end();
        return;
    }

    await AppDataSource
        .createQueryBuilder()
        .relation(Form, "students")
        .of(foundForm.id)
        .add(foundUser.id)

    res.status(200).end();
})

// GET /form - get forms
router.get("/", user, async (req, res) => {

    res.status(200).json(
        (await Form.find()).map(form => ({
            name: form.name
        }))
    ).end();
})

// GET /form/:name - list of students
router.get("/:name", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        name: z.string(),
    }),
}), async (req, res) => {

    const students = await Student.find({
        relations: {
            form:true,
            user:true,
            group: { excursions: true },
        },
        where: {
            form: {name: req.params.name},
        }
    })

    res.status(200).json(await Promise.all(students.map(async student => {
        const group = student.group.find(group => group.isCurrent())
        return {
            username: student.user.username,
            generalParentalConsent: student.generalParentalConsent,
            specialParentalConsent: student.hasSpecialParentalConsent(),
            hasExcursion: !!group?.excursions?.find(
                e => e.date == new Date() && e.status == Status.accepted
            )
        }
    })));
})

// POST /form/:name/archive - archive
router.post("/:name/archive", userRoles([Role.teacher, Role.admin]), validateRequest({
params: z.object({
    name: z.string(),
})
}), async (req, res) => {

    const form = await(Form.findOneBy({name: req.params.name}));

    if (!form){
        res.status(404).end();
        return;
    }

    await Form.update(
        { id: form.id},
        {name: req.params.name+" "+new Date().getFullYear(),
         isActive: false,
        }
    );
    
    res.status(201).end();
})

export default router;

