import express from "express"
import z from "zod";
import { validateRequest } from "zod-express-middleware";
import { Role, User } from "../../entity/user";
import { SpecialParentalConsent } from "../../entity/specialParentalConsent";
import { userRoles } from "../../middleware/auth"
import { hashPassword } from "../../utils/hashPassword";
import { Or, IsNull, MoreThan } from "typeorm";

const router = express.Router()

// GET /user - List users
router.get("/", userRoles([Role.teacher, Role.admin]), async (req, res) => {
    res.status(200).json((await User.find({
        select: [ 'username' ] 
    })).map(u => u.username)).end()
})

// GET /user/:username - Get user info
router.get("/:username", userRoles([Role.teacher, Role.admin]), validateRequest({
    params: z.object({
        username: z.string(),
    }),
}), async (req, res) => {
    const user = await User.findOne({
        relations: {
            student: { group: true },
        },
        where: {
            username: req.params.username,
        }
    })

    if (!user) {
        res.status(404).end()
        return
    }

    const specialParentalConsent = !!await SpecialParentalConsent.findOne({
        relations: {
            group: true, 
            student: true
        },
        where: {
            group: {
                endDate: Or(IsNull(), MoreThan(new Date()))
            },
            student: user.student
        }
    })

    res.status(200).json({
        username: user.username,
        role: user.role,
        form: user.student?.form.name,
        generalParentalConsent: user.student?.generalParentalConsent,
        specialParentalConsent: specialParentalConsent
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
    
    await User.update({ 
        username: req.params.username 
    }, { 
        username: req.body.username,
        role: req.body.role,
        student: {
            generalParentalConsent: req.body.generalParentalConsent
        }
    })
    res.status(200).end()
})

// DELETE /user/:username - Delete user
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

    await User.delete({
        username: req.params.username,
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

export default router;

