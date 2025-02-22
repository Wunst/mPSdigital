import express from "express"
import z from "zod";
import { validateRequest } from "zod-express-middleware";
import { Role, User } from "../../entity/user";
import { SpecialParentalConsent } from "../../entity/specialParentalConsent";
import { userRoles } from "../../middleware/auth"
import { hashPassword } from "../../utils/hashPassword";
import { Or, IsNull, MoreThan } from "typeorm";
import { Student } from "../../entity/student";
import { Form } from "../../entity/form";
import { AppDataSource } from "../../data-source";
import { Group } from "../../entity/group";
import { group } from "console";
import { Status } from '../../entity/excursion'

const router = express.Router()

// POST /user/:username - create user
router.post("/:username", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        username: z.string(),
    }),
    body: z.object({
        role: z.nativeEnum(Role),
        form: z.string(),
    }).partial({form: true})
}), async(req, res) => {

    // Not allowed to create new user
    if((req.user.role == Role.teacher && !(req.body.role == Role.student))) {
        res.status(403).end();
        return;
    }
    
    const user = await User.findOneBy({ username: req.params.username});
    // User already exist
    if(user){
        res.status(409).send('User exists').end();
        return;
    }

    await User.insert({
        username: req.params.username,
        password: await hashPassword(req.params.username),
        role: req.body.role,
    });

    const newUser = (await User.findOneBy({ 
        username: req.params.username }))!

    if (req.body.role === Role.student) {
        await Student.insert({
            user: newUser,
            generalParentalConsent: false,
        });

        const student = await Student.findBy({ userId: newUser.id })



        if (req.body.form) {
            const form = await Form.findOneBy({name: req.body.form})
            if (form != null) await AppDataSource
                .createQueryBuilder()
                .relation(Student, "form")
                .of(student)
                .add(form.id);
        }
    }

    res.status(201).end();
})

// GET /user - List users
router.get("/", userRoles([Role.teacher, Role.admin]), async (req, res) => {
    res.status(200).json((await User.find({
        relations: {
            student: {
                form: true,
                group: true
            }
        },
        where: {
            isActive: true
        }
    })).map(o => ({
        username: o.username,
        role: o.role,
        form: o.student?.form.find(f => f.isActive),
        group: o.student?.group
    }))).end()
})

// GET /user/:username - Get user info
router.get("/:username", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        username: z.string(),
    }),
}), async (req, res) => {
    const user = await User.findOne({
        relations: {
            student: { group: true,
                form: true
             },
        },
        where: {
            username: req.params.username,
        }
    })

    if (!user) {
        res.status(404).end()
        return
    }
    res.status(200).json({
        username: user.username,
        role: user.role,
        form: user.student?.form.find(form => form.isActive),
        group: user.student?.group?.find((group) => group.isCurrent() === true),
        generalParentalConsent: user.student?.generalParentalConsent,
        specialParentalConsent: user.student?.hasSpecialParentalConsent(),
        hasExcursion: !!user.student?.group?.find(g => g.isCurrent())?.excursions?.find(
            e => e.date == new Date() && e.status == Status.accepted
        )
    }).end()
})

// PATCH /user/:username - update user
router.patch("/:username", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        username: z.string(),
    }),
    body: z.object({
        username: z.string(),
        role: z.nativeEnum(Role),
        generalParentalConsent: z.boolean()
    }).partial(),
}), async (req, res) => {
    const user = await User.findOneBy({
        username: req.params.username,
    })

    if (!user) {
        res.status(404).end()
        return
    }

    if (user.role !== Role.student && req.user.role !== Role.admin) {
        res.status(403).end()
        return
    }

    if (user.role === Role.student) {
        await Student.update({
            userId: user.id
        }, {
            generalParentalConsent: req.body.generalParentalConsent
        })
    }

    await User.update({ 
        username: req.params.username 
    }, { 
        role: req.body.role,
        username: req.body.username,
    })

    res.status(200).end()
})

// DELETE /user/:username - Lock and anonymize user
router.delete("/:username", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        username: z.string(),
    }),
}), async (req, res) => {
    const user = await User.findOneBy({
        username: req.params.username,
    })

    if (!user) {
        res.status(404).end()
        return
    }

    if (user.role !== Role.student && req.user.role !== Role.admin) {
        res.status(403).end()
        return
    }

    await User.update({
        id: user.id
    }, {
        username: "deleteduser" + user.id,
        password: "",
        isActive: false
    })
    res.status(200).end()
})

// POST /user/:username/passwordReset - Reset user password
router.post("/:username/passwordReset", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        username: z.string(),
    }),
}), async (req, res) => {
    const user = await User.findOneBy({
        username: req.params.username,
    })

    if (!user) {
        res.status(404).end()
        return
    }

    if (user.role !== Role.student && req.user.role !== Role.admin) {
        res.status(403).end()
        return
    }

    await User.update({
        username: req.params.username,
    }, {
        password: await hashPassword(req.params.username),
        changedPassword: false,
    })
    res.status(200).end()
})

export default router
