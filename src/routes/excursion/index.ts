import express from "express"
import z from "zod";
import { validateRequest } from "zod-express-middleware";
import { Role } from "../../entity/user";
import { Or, IsNull, MoreThan } from "typeorm";
import { Excursion, Status } from "../../entity/excursion";
import { userRoles } from "../../middleware/auth";
import { Group } from "../../entity/group";

const router = express.Router()

// POST /excursion - create excursion
router.post("/", userRoles([Role.student]), validateRequest({
    body: z.object({
        group: z.number(),
        date: z.date(),
        description: z.string(),
    })
}), async(req, res) => {

    const group = await Group.findOne({
        relations: {
            student: {
                user: true,
            },
        },
        where: {
            id: req.body.group,
            endDate: Or(IsNull(), MoreThan(new Date())),
            student: {
                user: { id: req.user.id }
            },
        }
    });

    if (!group) {
        res.status(403).end();
        return;
    }

    await Excursion.insert({
        group,
        date: req.body.date,
        description: req.body.description,
    });
    
    res.status(201).end();
})

// GET /excursion/:id - information about the excursion
router.get("/:id", validateRequest({
    params: z.object({
        id: z.coerce.number().int().nonnegative(),
    })
}), async(req, res) => {

    const excursion = await Excursion.findOneBy({id: req.params.id});

    if (!excursion) {
        res.status(404).end();
        return;
    }

    if(req.user.role === Role.student && !req.user.student.group.includes(excursion.group)) {
        res.status(403).end();
    }

    res.status(200).json({
        id: excursion.id,
        group: excursion.group.id,
        date: excursion.date,
        description: excursion.description,
        state: excursion.status,
    }).end();
})

// GET /excursion/ - list of excursions
router.get("/", async(req, res) => {    

    const excursions = await Excursion.find({
        relations: {
            group: {
                student: true,
            },
        },
        where: {
            group: {
                endDate: Or(IsNull(), MoreThan(new Date())),
                student: req.body.role === Role.student ? {
                    user: { id: req.user.id },
                } : {},
            }
        }
    });

    res.status(200).json(excursions.map(excursion => { return {
        id: excursion.id,
        date: excursion.date,
        description: excursion.description,
        status: excursion.status,
        group: {
            id: excursion.group.id,
            name: excursion.group.name
        } }
    }));
})

// PATCH /excursion/:id - react to excursion
router.patch("/:id", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        id: z.coerce.number().int().nonnegative(),
    }),
    body: z.object({
        status: z.nativeEnum(Status),
    })
}), async(req,res) => {

    const excursion = await Excursion.findOneBy({id: req.params.id});

    if (!excursion) {
        res.status(404).end();
        return;
    }

    await Excursion.update(
        { id: req.params.id},
        { status: req.body.status}
    );

    res.status(200).end();
})

export default router;