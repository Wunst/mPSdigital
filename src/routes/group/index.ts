import express from "express"
import z, { boolean } from "zod";
import { validateRequest } from "zod-express-middleware";
import { Role, User } from "../../entity/user";
import { Student } from "../../entity/student";
import { AppDataSource } from "../../data-source";
import { user, userRoles } from "../../middleware/auth";
import { Or, IsNull, MoreThan } from "typeorm";
import { Group, ProjectType } from "../../entity/group";
import { SpecialParentalConsent } from "../../entity/specialParentalConsent";

const router = express.Router()

// GET /group - list of groups
router.get("/", user, validateRequest({
    query: z.object({
        form: z.string()
    }).partial()
}), async(req, res) => {

    res.status(200).json({
        groups: await Group.find({
            relations: {
                student: true,
            },
            where: {
                student: { form: { name: req.query.form } },
            }
        }),
    }).end();
})

// POST /group - create group
router.post("/", user, validateRequest({
    body: z.object({
        name: z.string(),
        type: z.nativeEnum(ProjectType),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        onlinePinboard: z.string(),
    }).partial({
        endDate: true,
        onlinePinboard: true,
    }),
}), async(req, res) => {

    // memorise student
    let loggedInStudent;
    if (req.user.role === Role.student) {
       loggedInStudent = await Student.findOne({
            relations: {
                user: true,
                group: true,
            },
            where: {
                user: req.user
            }
        });
        // TODO: right statuscode for contradiction (role student, but no student entry)?
        if(!loggedInStudent){
            res.status(403).end();
            return;
        }

        if(loggedInStudent.group.find(group => group.isCurrent())) {
            res.status(403).end();
            return;
        }
    }


    const result = await Group.insert({
        name: req.body.name,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        projectType: req.body.type,
        onlinePinboard: req.body.onlinePinboard
    });
    

    if(loggedInStudent){
        await AppDataSource
            .createQueryBuilder()
            .relation(Student, "group")
            .of(loggedInStudent)
            .add(result.identifiers[0]);
        
    }
    res.status(201).end();
})

// GET /group/:id - information about the group
router.get("/:id", user,  validateRequest({
    params: z.object({
        id: z.coerce.number().int().nonnegative(),
    })
}), async(req, res) => {

    const group = await Group.findOne({
        relations: {
            student: { user: true },
        },
        where: {
            id: req.params.id
        }
    });

    if(!group || (req.user.role == Role.student &&
        !group.student.find(student => student.user.id == req.user.id)))
    {
        res.status(404).end();
        return;
    }

    const user :Object[] = [];
    for (let index = 0; index < group.student.length; index++) {
        const student = group.student[index];
        user.push({ username: student.user.username,
            generalParentalconsent: student.generalParentalConsent,
            specialParentalConsent: student.specialParentalConsent});
    }

    res.status(200).json({
        id: group.id,
        name: group.name,
        type: group.projectType,
        onlinePinboard: group.onlinePinboard,
        startDate: group.startDate,
        endDate: group.endDate,
        members: user
    }).end();
})

//PATCH /group/:id - update group
router.patch("/:id", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        id: z.coerce.number().int().nonnegative(),
    }),
    body: z.object({
        name: z.string(),
        type: z.nativeEnum(ProjectType),
        onlinePinboard: z.string(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
    }).partial()
}), async(req, res) => {

    const group = await Group.findOneBy({id: req.params.id});

    if(!group) {
        res.status(401).end();
        return;
    }

    await Group.update(
        { id: req.params.id},
        {name: req.body.name,
        projectType: req.body.type,
        onlinePinboard: req.body.onlinePinboard,
        startDate: req.body.startDate,
        endDate: req.body.endDate,}
    );

    res.status(200).end();
})

// PUT /group/:id/:username - add student to group
router.put("/:id/:username", user, validateRequest({
    params: z.object({
        id: z.coerce.number().int().nonnegative(),
        username: z.string()
    })
}), async(req, res) => {

    const foundGroup = await Group.findOneBy({ id: req.params.id });
    const foundUser = await User.findOneBy({ username: req.params.username });
    if(!foundGroup || !foundUser) {
        res.status(404).end();
        return;
    }

    if(req.user.role === Role.student && foundUser.id !== req.user.id) {
        res.status(403).end();
        return;
    }

    const student = await Student.findOne({
        relations: {
            user: true,
            group: true,
        },
        where: {
            user: foundUser
        }
    });

    if(!student) {
        res.status(403).end();
        return;
    }

    if(
        !foundGroup.isCurrent() ||
        student.group.find(group => group.id === foundGroup.id) ||
        student.group.find(group => group.isCurrent())
    ) {
        res.status(409).end();
        return;
    }

    await AppDataSource
        .createQueryBuilder()
        .relation(Student, "group")
        .of(student)
        .add(req.params.id);

    res.status(200).end();
})

// DELETE /group/:id/:username - delete user from group
router.delete("/:id/:username", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        id: z.coerce.number().int().nonnegative(),
        username: z.string(),
    })
}), async(req, res) => {


    const foundGroup = await Group.findOneBy({ id: req.params.id });
    const foundUser = await User.findOneBy({ username: req.params.username });
    if(!foundGroup || !foundUser) {
        res.status(404).end();
        return;
    }

    const student = await Student.findOne({
        relations: {
            user: true,
            group: true,
        },
        where: {
            user: foundUser
        }
    });

    if(!student) {
        res.status(403).end();
        return;
    }

    await AppDataSource
        .createQueryBuilder()
        .relation(Student, "group")
        .of(student)
        .remove(req.params.id);

    res.status(200).end();
})

// PUT /group/:id/:username/specialConsent - add special parental consent for user and group
router.put("/:id/:username/specialConsent", userRoles([Role.admin, Role.teacher]), validateRequest({
    params: z.object({
        id: z.coerce.number().int().nonnegative(),
        username: z.string(),
    })
}), async (req, res) => {
    const group = await Group.findOne({
        where: {
            id: req.params.id
        },
        relations: {
            student: { user: true }
        }
    })
    if (!group || !group.student.find(student => student.user.username == req.params.username)) {
        res.status(404).end()
        return
    }

    if (!group.isCurrent) {
        res.status(403).end()
    }

    await SpecialParentalConsent.insert({
        group, 
        student: (await User.findOne({
            where: {
                username: req.params.username
            },
            relations: {
                student: true
            }
        }))!.student
    })

    res.status(200).end()
})


// DELETE /group/:id/specialConsent - delete specialParentalConsent of student from current group
router.delete("/:id/:username/specialConsent", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        id: z.coerce.number().int().nonnegative(),
        username: z.string(),
    })
}), async(req, res) => {
    const foundGroup = await Group.findOne({
        relations:{
            student:{
                user:true,
            }
        },
        where:{id: req.params.id}});

    if(!foundGroup || !foundGroup.student.find(student=>student.user.username == req.params.username)) {
        res.status(404).end();
        return;
    }

    if(!foundGroup.isCurrent()){
        res.status(403).end();
    }

    const specialParentalConsent = await SpecialParentalConsent.findOne({
        relations:{
            student:{
                user:true
            },
            group:true,
        },
        where:{student:{user:{username: req.params.username}},
                group:{id: req.params.id}}
    })

    if(!specialParentalConsent){
        res.status(404).end();
    }

    await AppDataSource
        .createQueryBuilder()
        .relation(Group, "specialParentalConsent")
        .of(foundGroup)
        .remove(specialParentalConsent);

    res.status(200).end();
})


export default router;
